import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';

import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Delete from '@material-ui/icons/Delete';
import Add from '@material-ui/icons/Add';

import axios from 'axios';

AddEventTemplateModal.propTypes = {
  eventsTemplateAdded: PropTypes.func.isRequired,
  patientId: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
  date: PropTypes.instanceOf(Date),
  setLoading: PropTypes.func.isRequired,
};

export default function AddEventTemplateModal(props) {
  const [templateName, setTemplateName] = useState('');
  const [events, setEvents] = useState([
    {
      dayOffset: 0,
      name: '',
    },
  ]);

  const onUpdateName = e => {
    setTemplateName(e.target.value);
  };

  const validateEvents = () => {
    return events.every(event => !!event.name);
  };

  const onAddEventTemplate = () => {
    if (!validateEvents()) {
      return;
    }
    props.setLoading(true);
    const token = localStorage.getItem('token');
    const data = {
      name: templateName,
      events,
    };
    axios
      .post(`/api/eventTemplates`, data, {
        headers: { token: token },
      })
      .then(res => {
        props.eventsTemplateAdded(res.data);
      })
      .catch(er => console.error(er))
      .finally(() => props.setLoading(false));
  };

  const onAddEvent = () => {
    const lastEventOffset = events[events.length - 1].dayOffset;
    setEvents([
      ...events,
      {
        dayOffset: lastEventOffset + 1,
        name: '',
      },
    ]);
  };

  const deleteEvent = indexToDelete => {
    setEvents(events.filter((_, index) => index !== indexToDelete));
  };

  const updateEventOffset = (newDayOffset, indexToUpdate) => {
    setEvents(
      events.map((event, index) => {
        if (index === indexToUpdate) {
          return {
            dayOffset: Number(newDayOffset),
            name: event.name,
          };
        }
        return event;
      })
    );
  };

  const updateEventName = (newEventName, indexToUpdate) => {
    setEvents(
      events.map((event, index) => {
        if (index === indexToUpdate) {
          return {
            dayOffset: event.dayOffset,
            name: newEventName,
          };
        }
        return event;
      })
    );
  };

  const renderedEvents = events.map((event, index) => {
    const onChangeDayOffset = e => {
      updateEventOffset(e.target.value, index);
    };
    const onChangeEventName = e => {
      updateEventName(e.target.value, index);
    };
    return (
      <Fragment key={index}>
        <Grid item xs={2}>
          <TextField
            disabled={index === 0}
            required
            fullWidth
            label="День"
            type="number"
            onChange={onChangeDayOffset}
            value={event.dayOffset}
          />
        </Grid>
        <Grid item xs={8}>
          <TextField
            required
            fullWidth
            label="Название события"
            onChange={onChangeEventName}
            value={event.name}
          />
        </Grid>
        <Grid item xs={2}>
          <IconButton disabled={index === 0} onClick={() => deleteEvent(index)}>
            <Delete />
          </IconButton>
        </Grid>
      </Fragment>
    );
  });

  return (
    <div className="templateModal">
      <h2>Добавить шаблон группы событий</h2>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Название шаблона"
            data-lpignore="true"
            value={templateName}
            onChange={onUpdateName}
          />
        </Grid>
        {renderedEvents}
        <Grid item xs={12}>
          <Button onClick={onAddEvent}>
            <Add /> Добавить событие
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button onClick={onAddEventTemplate} color="primary">
            Создать шаблон
          </Button>
          <Button onClick={props.closeModal}>Отмена</Button>
        </Grid>
      </Grid>
    </div>
  );
}
