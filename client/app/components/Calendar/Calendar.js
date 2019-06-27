import React, { PureComponent } from 'react';
import Calendar from 'react-big-calendar';
import moment from 'moment';
import withDragAndDrop from 'react-big-calendar/lib/addons/dragAndDrop';
import Patients from './Patients';
import Buttons from './Buttons';

import './calendar.css';
import 'react-big-calendar/lib/addons/dragAndDrop/styles.css';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const localizer = Calendar.momentLocalizer(moment);
const DnDCalendar = withDragAndDrop(Calendar);

class App extends PureComponent {
  state = {
    events: [
      {
        start: new Date(),
        end: new Date(moment().add(1, 'days')),
        title: 'Some title',
      },
    ],

    selectedPatient: null,
  };

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
    this.setState({ selectedPatient: patient });
  };

  render() {
    return (
      <div className="App">
        <Patients onPatientChange={this.onPatientChange} />
        <Buttons />
        <DnDCalendar
          defaultDate={new Date()}
          defaultView="month"
          events={this.state.events}
          localizer={localizer}
          onEventDrop={this.onEventDrop}
          onEventResize={this.onEventResize}
          className="calendar"
          style={{ height: '90vh' }}
          views={['month', 'agenda']}
        />
      </div>
    );
  }
}

export default App;
