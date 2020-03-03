import React, { PureComponent } from 'react';
import Calendar from 'react-big-calendar';
import moment from 'moment';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';

import Modal from 'react-modal';
import axios from 'axios';
import LinearProgress from '@material-ui/core/LinearProgress';
import Button from '@material-ui/core/Button';

import AddPatientModal from './AddPatientModal';
import AddEventModal from './AddEventModal';
import EditPatientModal from './EditPatientModal';
import DeletePatientModal from './DeletePatientModal';
import EditEventModal from './EditEventModal';
import AddEventTemplateModal from './AddEventTemplateModal';
import SelectEventTemplateModal from './SelectEventTemplateModal';
import Patients from './Patients';

import { eventConverter } from './helpers';
import {
  ADD_EVENT,
  ADD_PATIENT,
  EDIT_PATIENT,
  ADD_EVENT_TEMPLATE,
  CHOOSE_EVENTS_TEMPLATE,
  ALL_PATIENTS_ID,
  EDIT_EVENT,
  DELETE_PATIENT,
} from './constants';
import './calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale('ru');
const localizer = Calendar.momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

const customStyles = {
  content: {
    top: '40%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

Modal.setAppElement('#app');

const createEventsFromTemplate = (date, template) => {
  const eventsWithDifference = template.events.map((current, index) => {
    if (index === 0) {
      return {
        name: current.name,
        daysDelta: 0,
      };
    }
    const prev = template.events[index - 1];
    return {
      name: current.name,
      daysDelta: current.dayOffset - prev.dayOffset,
    };
  });

  let tempDate = moment(date);
  const items = eventsWithDifference.map(eventWithDelta => {
    tempDate.add(eventWithDelta.daysDelta, 'day');
    if (tempDate.weekday() > 4) {
      tempDate.add(7 - tempDate.weekday(), 'day');
    }
    return {
      name: eventWithDelta.name,
      date: tempDate.toDate().getTime(),
    };
  });
  return items;
};

class CalendarApp extends PureComponent {
  state = {
    events: [],
    patients: [],
    eventTemplates: [],
    selectedPatient: { _id: 'no_patient' },
    calendarIsSelectable: false,
    modalIsOpen: false,
  };

  componentDidMount() {
    const token = localStorage.getItem('token');
    if (!token) {
      const query = new URLSearchParams(this.props.location.search);
      const queryToken = query.get('token');
      if (!queryToken) {
        this.props.history.push('/');
      } else {
        localStorage.setItem('token', queryToken);
        this.props.history.push('/calendar');
      }
      return;
    }

    this.setState({ loading: true });
    const allPatients = { name: 'Все', _id: ALL_PATIENTS_ID };
    axios
      .get('/api/patients', { headers: { token } })
      .then(res => {
        this.setState(
          {
            patients: [allPatients, ...res.data],
            loading: false,
          },
          () => this.onPatientChange(allPatients)
        );
      })
      .catch(err => alert(err));

    axios
      .get('/api/eventTemplates', { headers: { token } })
      .then(res => {
        this.setState({
          eventTemplates: res.data,
          loading: false,
        });
      })
      .catch(err => alert(err));
  }

  onEventUpdated = rawUpdatedEvent => {
    const events = this.state.events.map(event => {
      if (event.id === rawUpdatedEvent._id) {
        return eventConverter(rawUpdatedEvent);
      }
      return event;
    });
    this.setState({ events, modalIsOpen: false });
  };

  onEventRemoved = removedEventId => {
    const events = this.state.events.filter(
      event => event.id !== removedEventId
    );
    this.setState({ events, modalIsOpen: false });
  };

  onEventDrop = ({ event, start }) => {
    const token = localStorage.getItem('token');
    const updatedEvent = {
      name: event.title,
      _id: event.id,
      date: start.getTime(),
    };
    this.setState({ loading: true });
    axios
      .put(`/api/events`, [updatedEvent], {
        headers: { token: token },
      })
      .then(() => {
        this.onEventUpdated(updatedEvent);
      })
      .finally(() => this.setState({ loading: false }));
  };

  onPatientChange = patient => {
    if (patient._id !== this.state.selectedPatient._id) {
      this.setState({ selectedPatient: patient, loading: true }, () => {
        const { selectedPatient } = this.state;
        const token = localStorage.getItem('token');
        const url =
          selectedPatient._id === ALL_PATIENTS_ID
            ? '/api/events'
            : `/api/events/${selectedPatient._id}`;

        axios
          .get(url, {
            headers: { token },
          })
          .then(res => {
            const events = res.data.map(eventConverter);
            this.setState({ events });
          })
          .catch(er => console.error(er))
          .finally(() => this.setState({ loading: false }));
      });
    }
  };

  onPatientAdded = patient => {
    this.setState({
      patients: [...this.state.patients, patient],
      modalIsOpen: false,
    });
  };

  onPatientRemoved = removedPatientId => {
    const patients = this.state.patients.filter(
      patient => patient._id !== removedPatientId
    );
    this.setState({ patients });
  };

  onDateSelected = dateItem => {
    if (this.modalContentType === ADD_EVENT) {
      this.selectedDate = dateItem.start;
      this.setState({
        calendarIsSelectable: false,
        modalIsOpen: true,
      });
    }
    if (
      this.modalContentType === CHOOSE_EVENTS_TEMPLATE &&
      this.currentEventTemplate
    ) {
      this.setLoading(true);
      const token = localStorage.getItem('token');
      const patientId = this.state.selectedPatient._id;
      const events = createEventsFromTemplate(
        dateItem.start,
        this.currentEventTemplate
      );
      axios
        .post(`/api/events/${patientId}`, events, {
          headers: { token: token },
        })
        .then(res => {
          const events = res.data.map(eventConverter);
          this.setState({
            events: [...this.state.events, ...events],
          });
        })
        .catch(er => console.error(er))
        .finally(() => this.setLoading(false));

      this.setState({
        calendarIsSelectable: false,
      });
    }
  };

  onSetModalType = modalType => {
    this.modalContentType = modalType;
    if (
      [DELETE_PATIENT, EDIT_PATIENT, CHOOSE_EVENTS_TEMPLATE].includes(modalType)
    ) {
      this.setState({ modalIsOpen: true });
    }
  };

  onSetSelectable = () => {
    this.setState({ calendarIsSelectable: true });
  };

  openAddPatientModal = () => {
    this.modalContentType = ADD_PATIENT;
    this.setState({ modalIsOpen: true });
  };

  openAddEventTemplateModal = () => {
    this.modalContentType = ADD_EVENT_TEMPLATE;
    this.setState({ modalIsOpen: true });
  };

  closeModal = () => {
    this.setState({ modalIsOpen: false });
  };

  setLoading = loading => {
    this.setState({ loading });
  };

  onEventsAdded = rawEvents => {
    const events = rawEvents.map(eventConverter);
    this.setState({
      events: [...this.state.events, ...events],
      modalIsOpen: false,
    });
  };

  onEventsTemplateAdded = newEventTemplate => {
    this.setState({
      eventTemplates: [...this.state.eventTemplates, newEventTemplate],
      modalIsOpen: false,
    });
  };

  onEventTemplateSelected = eventTemplate => {
    this.currentEventTemplate = eventTemplate;
    this.setState({
      calendarIsSelectable: true,
      modalIsOpen: false,
    });
  };

  onPatientEdited = editedPatient => {
    const newEditedPatient = {
      ...this.state.selectedPatient,
      ...editedPatient,
    };
    const patients = this.state.patients.map(patient => {
      if (patient._id === this.state.selectedPatient._id) {
        return newEditedPatient;
      }
      return patient;
    });
    this.setState({
      patients,
      selectedPatient: newEditedPatient,
    });
    this.closeModal();
  };

  onEditEvent = event => {
    this.modalContentType = EDIT_EVENT;
    this.currentEvent = event;
    this.setState({ modalIsOpen: true });
  };

  modals = {
    [EDIT_EVENT]: () => (
      <EditEventModal
        event={this.currentEvent}
        closeModal={this.closeModal}
        setLoading={this.setLoading}
        eventEdited={this.onEventUpdated}
        eventRemoved={this.onEventRemoved}
      />
    ),
    [EDIT_PATIENT]: () => (
      <EditPatientModal
        closeModal={this.closeModal}
        patientEdited={this.onPatientEdited}
        setLoading={this.setLoading}
        patient={this.state.selectedPatient}
      />
    ),
    [ADD_PATIENT]: () => (
      <AddPatientModal
        closeModal={this.closeModal}
        patientAdded={this.onPatientAdded}
        setLoading={this.setLoading}
      />
    ),
    [ADD_EVENT]: () => (
      <AddEventModal
        closeModal={this.closeModal}
        patientId={this.state.selectedPatient._id}
        date={this.selectedDate}
        eventsAdded={this.onEventsAdded}
        setLoading={this.setLoading}
      />
    ),
    [ADD_EVENT_TEMPLATE]: () => (
      <AddEventTemplateModal
        closeModal={this.closeModal}
        patientId={this.state.selectedPatient._id}
        date={this.selectedDate}
        eventsTemplateAdded={this.onEventsTemplateAdded}
        setLoading={this.setLoading}
      />
    ),
    [CHOOSE_EVENTS_TEMPLATE]: () => (
      <SelectEventTemplateModal
        closeModal={this.closeModal}
        onEventTemplateSelected={this.onEventTemplateSelected}
        eventTemplates={this.state.eventTemplates}
      />
    ),
    [DELETE_PATIENT]: () => (
      <DeletePatientModal
        closeModal={this.closeModal}
        patientId={this.state.selectedPatient._id}
        setLoading={this.setLoading}
        onPatientRemoved={this.onPatientRemoved}
      />
    ),
  };

  onSignout = () => {
    localStorage.removeItem('token');
    this.props.history.push('/');
  };

  render() {
    const calendarWrapperClass = this.state.calendarIsSelectable
      ? 'calendar-wrapper-selectable'
      : 'calendar-wrapper';
    const style = this.state.loading ? {} : { marginTop: 4 };
    const modalContent =
      this.modalContentType && this.modals[this.modalContentType]();

    const dateCellWrapper = props => (
      <div
        onClick={() => {
          if (this.state.calendarIsSelectable) {
            this.onDateSelected({ start: props.value });
          }
        }}
        className="date-cell"
      />
    );

    return (
      <>
        {this.state.loading && <LinearProgress />}
        <div className="App" style={style}>
          <div className="left-side">
            <Patients
              makeCalendarSelectable={this.onSetSelectable}
              changeModalType={this.onSetModalType}
              onPatientChange={this.onPatientChange}
              patients={this.state.patients}
              clickable={!this.state.calendarIsSelectable}
            />

            <div className="button-container">
              <Button
                onClick={this.openAddPatientModal}
                disabled={this.state.calendarIsSelectable}
              >
                Добавить пациента
              </Button>
              <Button
                onClick={this.openAddEventTemplateModal}
                disabled={this.state.calendarIsSelectable}
              >
                Шаблон группы событий
              </Button>
              <Button
                onClick={this.onSignout}
                color="secondary"
                disabled={this.state.calendarIsSelectable}
              >
                Выйти
              </Button>
            </div>
          </div>

          <div className={calendarWrapperClass}>
            <DnDCalendar
              selectable={this.state.calendarIsSelectable}
              defaultDate={new Date()}
              defaultView="month"
              events={this.state.events}
              localizer={localizer}
              onEventDrop={this.onEventDrop}
              className="calendar"
              style={{ height: '90vh' }}
              views={['month', 'agenda']}
              onDoubleClickEvent={this.onEditEvent}
              components={{ dateCellWrapper }}
            />
          </div>
        </div>

        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Modal"
        >
          {modalContent}
        </Modal>
      </>
    );
  }
}

export default CalendarApp;
