const TelegramBot = require('node-telegram-bot-api');
const Patient = require('../server/models/Patient');

const token = process.env.BOT_TOKEN;

const NODE_ENV = process.env.NODE_ENV;
const isProd = NODE_ENV === 'production';
// const isProd = false;

const options = isProd
  ? {
      webHook: {
        port: 443,
      },
    }
  : { polling: true };

const bot = new TelegramBot(token, options);

if (isProd) {
  const url = process.env.APP_URL || 'https://<app-name>.herokuapp.com:443';
  bot.setWebHook(`${url}/bot${token}`);
}

bot.onText(/\/start/, function(msg) {
  const option = {
    parse_mode: 'Markdown',
    reply_markup: {
      one_time_keyboard: true,
      keyboard: [
        [
          {
            text: 'Отравить телефон',
            request_contact: true,
          },
        ],
      ],
    },
  };

  bot.sendMessage(msg.chat.id, 'Нажмите кнопку отправить телефон', option);
});

bot.on('contact', msg => {
  let phoneNumber = msg.contact.phone_number.replace(/ /g, '');
  if (phoneNumber.startsWith('8')) {
    phoneNumber = phoneNumber.replace('8', '+7');
  }
  if (phoneNumber.length === 11 && phoneNumber.startsWith('7')) {
    phoneNumber = phoneNumber.replace('7', '+7');
  }
  console.log({ phoneNumber });

  Patient.findOneAndUpdate(
    { phoneNumber },
    { $set: { telegramId: msg.chat.id } },
    (err, doc) => {
      const message =
        err || !doc
          ? 'Номер не найден, попросите вашего врача добавить ваш номер в базу'
          : 'Номер сохранен';
      bot.sendMessage(msg.chat.id, message, {
        reply_markup: {
          remove_keyboard: true,
        },
      });
    }
  );
});

module.exports = bot;
