require('dotenv').config();
const express = require('express');
const Event = require('./models/Event');

const historyApiFallback = require('connect-history-api-fallback');
const mongoose = require('mongoose');
const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const moment = require('moment');
const axios = require('axios');
const bot = require('./bot');

const webpackConfig = require('../webpack.config');

const isDev = process.env.NODE_ENV !== 'production';
const cronToken = process.env.CRON_SERVICE_SECRET_TOKEN;
const adminId = process.env.ADMIN_TG_ID;
const port = process.env.PORT || 3000;
const token = process.env.BOT_TOKEN;

const tunnelUrl = process.env.APP_URL || 'https://7c6cd916.ngrok.io';
const urlForWebhook = `${tunnelUrl}/bot`;

const apiUrl = `https://api.telegram.org/bot${token}`;

axios
  .post(`${apiUrl}/setWebhook`, { url: urlForWebhook })
  .then(res => console.log(res.data))
  .catch(er => console.log(er));

mongoose.connect(process.env.DB_URL);
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// API routes
require('./routes')(app);

app.get('/api/checkDates', (req, res, next) => {
  if (req.query.cronToken !== cronToken) {
    res.send('Invalid token');
  }
  // getting all Events for tomorrow
  const tomorrow = moment()
    .add(1, 'd')
    .startOf('day');
  Event.find({
    date: {
      $gte: tomorrow.toDate(),
      $lte: moment(tomorrow)
        .endOf('day')
        .toDate(),
    },
  })
    .populate('patient')
    .populate('doctor', 'telegramId')
    .then(result => {
      const patientsForDoctor = {};
      result.forEach(item => {
        bot.sendMessage(item.patient.telegramId, item.name);
        // saving Data for each event per Doctor
        if (item.doctor.telegramId) {
          if (!patientsForDoctor[item.doctor.telegramId]) {
            patientsForDoctor[item.doctor.telegramId] = [];
          }
          patientsForDoctor[item.doctor.telegramId].push(
            `${item.patient.name}: "${item.name}"`
          );
        }
      });

      for (const doctorTelegramId in patientsForDoctor) {
        const message = `Отправил уведомления пациентам:\n${patientsForDoctor[
          doctorTelegramId
        ].join('\n')}`;
        bot.sendMessage(doctorTelegramId, message);
      }
      res.send('OK');
    })
    .catch(err => next(err));
});

app.post('/bot', (req, res) => {
  const { message } = req.body;
  const { chat, contact, text } = message;

  if (text === '/start') {
    bot.askForPhone(chat.id);
  }

  if (text === '/start info') {
    bot.sendMessage(chat.id, `Ваш Telegram ID: ${chat.id}`);
  }

  if (contact) {
    bot.handlePhone(message);
  }

  res.send('ok');
});

if (isDev) {
  const compiler = webpack(webpackConfig);

  app.use(
    historyApiFallback({
      verbose: false,
    })
  );

  app.use(
    webpackDevMiddleware(compiler, {
      publicPath: webpackConfig.output.publicPath,
      contentBase: path.resolve(__dirname, '../client/public'),
      stats: {
        colors: true,
        hash: false,
        timings: true,
        chunks: false,
        chunkModules: false,
        modules: false,
      },
    })
  );

  app.use(webpackHotMiddleware(compiler));
  app.use(express.static(path.resolve(__dirname, '../dist')));
} else {
  app.use(express.static(path.resolve(__dirname, '../dist')));
  app.get('*', function(req, res) {
    res.sendFile(path.resolve(__dirname, '../dist/index.html'));
  });
}

app.listen(port, '0.0.0.0', err => {
  if (err) {
    console.log(err);
  }

  console.info('>>> 🌎 Open http://0.0.0.0:%s/ in your browser.', port);
});

module.exports = app;
