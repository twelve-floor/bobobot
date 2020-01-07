import React, { useState } from 'react';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import axios from 'axios';

const botUrl = `https://t.me/${process.env.BOT_NAME}?start=info`;

const useStyles = makeStyles(theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white,
    },
  },
  paper: {
    marginTop: theme.spacing(8),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: theme.palette.secondary.main,
  },
  form: {
    width: '100%', // Fix IE 11 issue.
    marginTop: theme.spacing(3),
  },
  submit: {
    margin: theme.spacing(3, 0, 2),
  },
}));

export default function SignUp(props) {
  const classes = useStyles();
  const token = localStorage.getItem('token');
  if (token != null) {
    props.history.push('/calendar');
  }
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [telegramId, setTelegramId] = useState('');
  const [password, setPassword] = useState('');
  console.log(process.env);
  function handleSuccess(res) {
    localStorage.setItem('token', res.data.token);
    props.history.push('/calendar');
  }

  function handleError(error) {
    alert(error);
  }

  function signUp() {
    if (!name && !email && !password) {
      return;
    }
    const userData = {
      name,
      email,
      password,
      telegramId,
    };
    axios
      .post('/api/users/register', userData)
      .then(handleSuccess)
      .catch(handleError);
  }

  function signIn() {
    if (!email && !password) {
      return;
    }
    const userData = {
      email,
      password,
    };
    axios
      .post('/api/users/login', userData)
      .then(handleSuccess)
      .catch(handleError);
  }

  function onSubmit(e) {
    e.preventDefault();

    if (isSignUp) {
      signUp();
    } else {
      signIn();
    }
  }

  function onUpdateName(e) {
    setName(e.target.value);
  }

  function onUpdateEmail(e) {
    setEmail(e.target.value);
  }

  function onUpdateTelegramId(e) {
    setTelegramId(e.target.value);
  }

  function onUpdatePassword(e) {
    setPassword(e.target.value);
  }

  const nameInput = isSignUp && (
    <Grid item xs={12}>
      <TextField
        autoComplete="fname"
        name="name"
        variant="outlined"
        required
        fullWidth
        id="name"
        label="Имя"
        autoFocus
        data-lpignore="true"
        value={name}
        onChange={onUpdateName}
      />
    </Grid>
  );

  const telegramIdInput = isSignUp && (
    <Grid item xs={12}>
      <TextField
        variant="outlined"
        required
        fullWidth
        name="telegramId"
        label="Telegram ID"
        type="text"
        id="telegramId"
        data-lpignore="true"
        value={telegramId}
        onChange={onUpdateTelegramId}
      />
      <p>
        Откройте{' '}
        <a target="_blank" href={botUrl}>
          {botUrl}
        </a>{' '}
        и нажмите 'Start' чтобы узнать Telegram ID
      </p>
    </Grid>
  );

  function switchSignIn() {
    setIsSignUp(!isSignUp);
  }

  const header = isSignUp ? 'Регистрация' : 'Вход';
  const signUpButtonName = isSignUp ? 'Зарегистрироваться' : 'Войти';
  const switchButtonName = isSignUp ? 'Войти на сайт' : 'Зарегистрироваться';

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Typography component="h1" variant="h5">
          {header}
        </Typography>
        <form className={classes.form} noValidate>
          <Grid container spacing={2}>
            {nameInput}
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="email"
                label="Почта"
                name="email"
                data-lpignore="true"
                value={email}
                onChange={onUpdateEmail}
              />
            </Grid>
            {telegramIdInput}
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Пароль"
                type="password"
                id="password"
                autoComplete="current-password"
                data-lpignore="true"
                password={password}
                onChange={onUpdatePassword}
              />
            </Grid>
          </Grid>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
            className={classes.submit}
            onClick={onSubmit}
          >
            {signUpButtonName}
          </Button>
          <Grid container justify="flex-end">
            <Grid item>
              <Button onClick={switchSignIn}>{switchButtonName}</Button>
            </Grid>
          </Grid>
        </form>
      </div>
    </Container>
  );
}
