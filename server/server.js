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

const webpackConfig = require('../webpack.config');

const isDev = process.env.NODE_ENV !== 'production';
const cronToken = process.env.CRON_SERVICE_SECRET_TOKEN;
const adminId = process.env.ADMIN_TG_ID;
const port = process.env.PORT || 8080;

const bot = require('./bot');
// Configuration
// ================================================================================================

// Set up Mongoose
mongoose.connect(process.env.DB_URL);
mongoose.set('useFindAndModify', false);
mongoose.Promise = global.Promise;

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// API routes
require('./routes')(app);

app.get('/api/checkDates', (req, res, next) => {
  if (req.query.cronToken === cronToken) {
    const today = moment().startOf('day');
    Event.find({
      date: {
        $gte: today.toDate(),
        $lte: moment(today)
          .endOf('day')
          .toDate(),
      },
    })
      .populate('patient')
      .then(result => {
        const message = `👌 notifications sent: ${result.length} 👌`;
        res.send(message);
        result.forEach(item => {
          bot.sendMessage(item.patient.telegramId, item.name);
        });
        bot.sendMessage(adminId, message);
      })
      .catch(err => next(err));
  } else {
    res.send('Invalid token');
  }
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
