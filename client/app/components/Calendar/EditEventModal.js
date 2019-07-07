import React, { useState } from 'react';
import PropTypes from 'prop-types';

import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import axios from 'axios';

EditEventModal.propTypes = {
  eventEdited: PropTypes.func.isRequired,
  eventRemoved: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  setLoading: PropTypes.func.isRequired,
  event: PropTypes.object.isRequired,
};

export default function EditEventModal(props) {
  const [eventName, setEventName] = useState(props.event.title);
  const onUpdateName = e => {
    setEventName(e.target.value);
  };

  const onEditEvent = () => {
    if (!eventName) {
      return;
    }
    props.setLoading(true);
    const token = localStorage.getItem('token');

    const updatedEvent = {
      _id: props.event.id,
      name: eventName,
      date: props.event.start,
    };

    axios
      .put(`/api/events`, [updatedEvent], {
        headers: { token: token },
      })
      .then(() => {
        props.eventEdited(updatedEvent);
      })
      .catch(er => console.error(er))
      .finally(() => props.setLoading(false));
  };

  const onDeleteEvent = () => {
    const confirmation = window.confirm(
      `Вы уверены, что хотите удалить событие "${props.event.title}"?`
    );
    if (confirmation) {
      const token = localStorage.getItem('token');
      axios
        .delete('/api/events', {
          data: [props.event.id],
          headers: { token: token },
        })
        .then(() => {
          props.eventRemoved(props.event.id);
        })
        .catch(er => console.error(er))
        .finally(() => props.setLoading(false));
    } else {
      props.closeModal();
    }
  };

  return (
    <>
      <h2>Изменить событие</h2>
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
          <Button onClick={onEditEvent} color="primary">
            Сохранить
          </Button>
          <Button onClick={onDeleteEvent} color="secondary">
            Удалить
          </Button>
          <Button onClick={props.closeModal}>Отмена</Button>
        </Grid>
      </Grid>
    </>
  );
}
