# Bobobot - a tool for doctors for creating automated notifcations using Telegram Bot API

## Requirements

- [Node.js](https://nodejs.org/en/) 6+

```shell
npm install
```

- Install [MongoDB](https://docs.mongodb.com/manual/administration/install-community/)
- create `.env` file and add
  - `DB_URL = <your_mongo_url>`
  - `BOT_TOKEN = <telegram_bot_token>`
  - `JWT_SECRET = <random string>`
  - `APP_URL = 'https://<app-name>.herokuapp.com:443'` - this is required for production only
  - `BOT_NAME = <bot name>`
  - `CRON_SERVICE_SECRET_TOKEN = some token for cron service to access bot via /api/checkDates?cronToken=`

## Running

#### Development (Webpack dev server) mode:

create a tunnel using ngrok and set APP_URL with it. it's needed for telegram bot to work

```shell
APP_URL=https://blabla.ngrok.io npm run start:dev
```

#### Production mode:

```shell
npm start
```

Project is created using [MERN boilerplate](https://github.com/keithweaver/MERN-boilerplate) with following technologies:

- [React](https://facebook.github.io/react/) and [React Router](https://reacttraining.com/react-router/) for the frontend
- [Express](http://expressjs.com/) and [Mongoose](http://mongoosejs.com/) for the backend
- [Sass](http://sass-lang.com/) for styles (using the SCSS syntax)
- [Webpack](https://webpack.github.io/) for compilation
