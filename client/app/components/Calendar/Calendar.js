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
import AddEventTemplateModal from './AddEventTemplateModal';
import SelectEventTemplateModal from './SelectEventTemplateModal';
import Patients from './Patients';

import { eventConverter } from './helpers';
import {
  ADD_EVENT,
  ADD_PATIENT,
  ADD_EVENT_TEMPLATE,
  CHOOSE_EVENTS_TEMPLATE,
} from './constants';
import './calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

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

const ALL_PATIENTS_ID = 'all_patients';

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
    if (tempDate.weekday() > 5) {
      tempDate.add(8 - tempDate.weekday(), 'day');
    }
    return {
      name: eventWithDelta.name,
      date: tempDate.toDate(),
    };
  });
  return items;
};

class App extends PureComponent {
  state = {
    events: [],
    patients: [],
    eventTemplates: [],
    selectedPatient: { _id: 'no_patient' },
    calendarIsSelectable: false,
    modalIsOpen: false,
  };

  componentDidMount() {
    this.setState({ loading: true });
    const token = localStorage.getItem('token');
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

  onEventResize = (type, { event, start, end, allDay }) => {
    this.setState(state => {
      state.events[0].start = start;
      state.events[0].end = end;
      return { events: state.events };
    });
  };

  onEventDrop = ({ event, start, end, allDay }) => {
    console.log({ event, start, end, allDay });
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
    if (modalType === CHOOSE_EVENTS_TEMPLATE) {
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

  renderModalContent = () => {
    if (this.modalContentType === ADD_PATIENT) {
      return (
        <AddPatientModal
          closeModal={this.closeModal}
          patientAdded={this.onPatientAdded}
          setLoading={this.setLoading}
        />
      );
    }
    if (this.modalContentType === ADD_EVENT) {
      return (
        <AddEventModal
          closeModal={this.closeModal}
          patientId={this.state.selectedPatient._id}
          date={this.selectedDate}
          eventsAdded={this.onEventsAdded}
          setLoading={this.setLoading}
        />
      );
    }
    if (this.modalContentType === ADD_EVENT_TEMPLATE) {
      return (
        <AddEventTemplateModal
          closeModal={this.closeModal}
          patientId={this.state.selectedPatient._id}
          date={this.selectedDate}
          eventsTemplateAdded={this.onEventsTemplateAdded}
          setLoading={this.setLoading}
        />
      );
    }

    if (this.modalContentType === CHOOSE_EVENTS_TEMPLATE) {
      return (
        <SelectEventTemplateModal
          closeModal={this.closeModal}
          onEventTemplateSelected={this.onEventTemplateSelected}
          eventTemplates={this.state.eventTemplates}
        />
      );
    }
  };

  render() {
    const calendarWrapperClass = this.state.calendarIsSelectable
      ? 'calendar-wrapper-selectable'
      : 'calendar-wrapper';
    const style = this.state.loading ? {} : { marginTop: 4 };
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
              onEventResize={this.onEventResize}
              className="calendar"
              style={{ height: '90vh' }}
              views={['month', 'agenda']}
              onSelectSlot={this.onDateSelected}
            />
          </div>
        </div>

        <Modal
          isOpen={this.state.modalIsOpen}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Modal"
        >
          {this.renderModalContent()}
        </Modal>
      </>
    );
  }
}

export default App;
