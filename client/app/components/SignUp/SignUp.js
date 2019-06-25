import React, { useState } from 'react';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Link from '@material-ui/core/Link';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Typography from '@material-ui/core/Typography';
import { makeStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import axios from 'axios';

function MadeWithLove() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {'Built with love by the '}
      <Link color="inherit" href="https://material-ui.com/">
        Material-UI
      </Link>
      {' team.'}
    </Typography>
  );
}

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
  const [password, setPassword] = useState('');

  function handleSuccess(res) {
    localStorage.setItem('token', res.data.token);
    props.history.push('/calendar');
  }

  function handleError(error) {
    // console.log(error);
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
        label="Name"
        autoFocus
        data-lpignore="true"
        value={name}
        onChange={onUpdateName}
      />
    </Grid>
  );

  function switchSignIn() {
    setIsSignUp(!isSignUp);
  }

  const signUpButtonName = isSignUp ? 'Sign Up' : 'Sign In';
  const switchButtonName = isSignUp
    ? 'Already have an account? Sign in'
    : 'Registration';

  return (
    <Container component="main" maxWidth="xs">
      <CssBaseline />
      <div className={classes.paper}>
        <Avatar className={classes.avatar} />
        <Typography component="h1" variant="h5">
          {isSignUp ? 'Sign up' : 'Sign in'}
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
                label="Email Address"
                name="email"
                data-lpignore="true"
                value={email}
                onChange={onUpdateEmail}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                name="password"
                label="Password"
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
      <Box mt={5}>
        <MadeWithLove />
      </Box>
    </Container>
  );
}
