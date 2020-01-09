import React, { useState } from 'react';
import PropTypes from 'prop-types';

import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import moment from 'moment';

AddEventModal.propTypes = {
  eventsAdded: PropTypes.func.isRequired,
  patientId: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
  date: PropTypes.instanceOf(Date),
  setLoading: PropTypes.func.isRequired,
};

export default function AddEventModal(props) {
  const [eventName, setEventName] = useState('');

  const onUpdateName = e => {
    setEventName(e.target.value);
  };

  const onAddEvent = () => {
    if (!eventName) {
      return;
    }
    props.setLoading(true);
    const token = localStorage.getItem('token');
    const event = {
      name: eventName,
      date: props.date.getTime(),
      parentEvent: null,
    };

    axios
      .post(`/api/events/${props.patientId}`, [event], {
        headers: { token: token },
      })
      .then(res => {
        props.eventsAdded(res.data);
      })
      .catch(er => console.error(er))
      .finally(() => props.setLoading(false));
  };

  return (
    <>
      <h2>Добавить событие на {moment(props.date).format('Do MMM')}</h2>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            variant="outlined"
            required
            fullWidth
            label="Название события"
            data-lpignore="true"
            value={eventName}
            onChange={onUpdateName}
          />
        </Grid>

        <Grid item xs={12}>
          <Button onClick={onAddEvent} color="primary">
            Добавить
          </Button>
          <Button onClick={props.closeModal}>Отмена</Button>
        </Grid>
      </Grid>
    </>
  );
}
