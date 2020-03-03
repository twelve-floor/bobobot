require('dotenv').config();
const express = require('express');
const Event = require('./models/Event');
const Patient = require('./models/Patient');
const User = require('./models/User');

const historyApiFallback = require('connect-history-api-fallback');
const mongoose = require('mongoose');
const path = require('path');
const webpack = require('webpack');
const webpackDevMiddleware = require('webpack-dev-middleware');
const webpackHotMiddleware = require('webpack-hot-middleware');
const moment = require('moment');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const bot = require('./bot');

const webpackConfig = require('../webpack.config');

const isDev = process.env.NODE_ENV !== 'production';
const cronToken = process.env.CRON_SERVICE_SECRET_TOKEN;
const adminId = process.env.ADMIN_TG_ID;
const port = process.env.PORT || 3000;
const token = process.env.BOT_TOKEN;
const secret = process.env.JWT_SECRET;
const tunnelUrl = process.env.APP_URL || 'https://2340dcde.ngrok.io';
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
const noTelegramIdErrorMessage = patient =>
  `Не удалось отправить сообщение пациенту ${
    patient.name
  }, потому что он/она не написал боту "${
    process.env.BOT_NAME
  }" команду "/start" или не отправил свой номер`;

const sendMessagesToPatientsAndDoctors = ({ result, isTomorrow, res }) => {
  const patientsForDoctor = {};
  const day = isTomorrow ? 'завтра' : 'сегодня';
  console.log(`Количество событий ${day}: ${result.length}`);
  console.log({ events: JSON.stringify(result) });
  result.forEach(item => {
    try {
      if (item.patient && item.patient.telegramId) {
        bot.sendMessage({
          chat_id: item.patient.telegramId.trim(),
          text: `Событие ${day}: ${item.name}`,
          to: 'patient',
        });
      } else {
        console.log('no patient or patients telegram id for', item);
      }
      console.log({ doctor: item.doctor });
      // saving Data for each event per Doctor
      if (item.doctor && item.doctor.telegramId) {
        if (!patientsForDoctor[item.doctor.telegramId]) {
          patientsForDoctor[item.doctor.telegramId] = {
            name: item.doctor.name,
            messages: [],
          };
        }
        if (item.patient && item.patient.telegramId) {
          patientsForDoctor[item.doctor.telegramId].messages.push(
            `${getUserTelegramLink(item.patient)}: "${item.name}"`
          );
        } else {
          patientsForDoctor[item.doctor.telegramId].messages.push(
            noTelegramIdErrorMessage(item.patient)
          );
        }
      }
    } catch (e) {
      console.error('Some error happened', e);
      console.error('During handlong', item);
    }
  });
  let response = '';
  for (const doctorTelegramId in patientsForDoctor) {
    const all = patientsForDoctor[doctorTelegramId].messages.join('\n');
    const message = `*Отправил уведомления пациентам:*\n${all}`;
    bot.sendMessage({
      chat_id: doctorTelegramId.trim(),
      text: message,
      to: 'doctor',
    });
    response += `<h3>Для доктора ${
      patientsForDoctor[doctorTelegramId].name
    }:</h3><p>${all}</p>\n`;
  }
  res.send(response || `Нет событий на ${day}`);
};

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
    .populate('doctor', ['telegramId', 'name'])
    .then(result => {
      sendMessagesToPatientsAndDoctors({ result, isTomorrow: true, res });
    })
    .catch(err => next(err));
});

app.get('/api/checkDatesToday', (req, res, next) => {
  if (req.query.cronToken !== cronToken) {
    res.send('Invalid token');
  }
  const today = moment();
  Event.find({
    date: {
      $gte: today.startOf('day').toDate(),
      $lte: today.endOf('day').toDate(),
    },
  })
    .populate('patient')
    .populate('doctor', ['telegramId', 'name'])
    .then(result => {
      sendMessagesToPatientsAndDoctors({ result, isTomorrow: false, res });
    })
    .catch(err => next(err));
});

function getUserTelegramLink(user) {
  return `[${user.name}](tg://user?id=${user.telegramId})`;
}

app.post('/bot', async (req, res) => {
  const { message } = req.body;
  const { chat, contact, text } = message;
  console.log(JSON.stringify(message));
  if (text === '/start') {
    bot.askForPhone(chat.id);
  }

  if (text === '/start info') {
    bot.sendMessage({
      chat_id: chat.id,
      text: `Ваш Telegram ID: ${chat.id}`,
      to: 'doctor',
    });
  }

  if (text === 'Открыть календарь') {
    const user = await User.findOne({ telegramId: chat.id });
    if (user == null) {
      bot.sendMessage({
        chat_id: chat.id,
        text:
          'Пользователь на зарегистрирован или неправильно указал Telegram ID',
        to: 'doctor',
      });
    } else {
      const payload = { userId: user.id };
      const token = jwt.sign(JSON.stringify(payload), secret);
      const url = `Пройдите по ссылке, чтобы открыть ваш календарь: ${tunnelUrl}/calendar?token=${token}`;
      bot.sendMessage({
        chat_id: chat.id,
        text: url,
        to: 'doctor',
      });
    }
  }

  if (text === 'Получить расписание') {
    const patient = await Patient.findOne({ telegramId: chat.id });
    const eventsForPatient = await Event.find({
      patient: patient,
      date: {
        $gte: moment()
          .startOf('day')
          .toDate(),
      },
    })
      .sort('date')
      .populate('doctor', ['name', 'telegramId']);
    if (eventsForPatient.length === 0) {
      bot.sendMessage({
        chat_id: chat.id,
        text: 'У вас нет предстоящих событий.',
        to: 'patient',
      });
    } else {
      const body = eventsForPatient
        .map(
          event =>
            `${moment(event.date)
              .locale('ru')
              .format('Do MMM YYYY')}: "${
              event.name
            }" у врача ${getUserTelegramLink(event.doctor)}.`
        )
        .join('\n');
      const message = `*У вас запланировано ${
        eventsForPatient.length
      } событий(-я)*:\n${body}`;
      bot.sendMessage({ chat_id: chat.id, text: message, to: 'patient' });
    }
    console.log({ eventsForPatient });
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
