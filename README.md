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


## Running

Development (Webpack dev server) mode:

```shell
npm run start:dev
```

Production mode:

```shell
npm start
```


Project is created using [MERN boilerplate](https://github.com/keithweaver/MERN-boilerplate) with following technologies:
- [React](https://facebook.github.io/react/) and [React Router](https://reacttraining.com/react-router/) for the frontend
- [Express](http://expressjs.com/) and [Mongoose](http://mongoosejs.com/) for the backend
- [Sass](http://sass-lang.com/) for styles (using the SCSS syntax)
- [Webpack](https://webpack.github.io/) for compilation
