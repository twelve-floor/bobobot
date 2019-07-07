const TelegramBot = require('node-telegram-bot-api');
const Event = require('../server/models/Event');
const Patient = require('../server/models/Patient');

const token = '836564131:AAGvDqFDA1NYGjN3i_ltdYYrZk2Hjixy1fU';
const bot = new TelegramBot(token, { polling: true });

bot.onText(/^\/отправить телефон/, function(msg, match) {
  var option = {
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
  const contact = msg.contact.phone_number;
  Patient.findOne({ phoneNumber: contact })
    .exec()
    .then(patient => {
      patient.telegramId = msg.chat.id;
      patient.save().catch(err => next(err));
    });

  bot.sendMessage(msg.chat.id, 'Номер получен', {
    reply_markup: {
      remove_keyboard: true,
    },
  });
});

let date = new Date();
let dateForSearch =
  date.getFullYear() + '/' + date.getMonth() + '/' + date.getDate();

Event.find({ date: dateForSearch })
  .populate('patient')
  .then(function(result) {
    for (let item of result) {
      bot.sendMessage(item.patient.telegramId, item.name);
    }
  });

module.exports = bot;
