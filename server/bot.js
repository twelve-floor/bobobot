const Patient = require('./models/Patient');
const axios = require('axios');
const token = process.env.BOT_TOKEN;
const apiUrl = `https://api.telegram.org/bot${token}`;

function handlePhone(msg) {
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
      const text =
        err || !doc
          ? 'Номер не найден, попросите вашего врача добавить ваш номер в базу'
          : 'Номер сохранен, спасибо';
      sendMessage(msg.chat.id, text);
    }
  );
}

function askForPhone(chat_id) {
  axios
    .post(`${apiUrl}/sendMessage`, {
      text:
        'Пожалуйста, нажмите кнопку "Отправить телефон", чтобы бот смог отправлять вам уведомления о назначенных записях',
      chat_id,
      reply_markup: {
        one_time_keyboard: true,
        keyboard: [
          [
            {
              text: 'Отправить телефон',
              request_contact: true,
            },
          ],
        ],
      },
    })
    .then(() => console.log('Asking for phone'))
    .catch(er => console.log(er));
}

function sendMessage(chat_id, text) {
  axios
    .post(`${apiUrl}/sendMessage`, {
      text,
      chat_id,
      parse_mode: 'Markdown',
      reply_markup: {
        keyboard: [[{ text: 'Получить расписание' }]],
      },
    })
    .then(() => console.log('Message sent'))
    .catch(er => console.log(er));
}

module.exports = {
  handlePhone,
  askForPhone,
  sendMessage,
};
