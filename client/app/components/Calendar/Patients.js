import React, { PureComponent } from 'react';

export default class PatientsList extends PureComponent {
  state = {
    searchTerm: '',
    selectedPatient: null,
  };

  onSelectPatient = patient => {
    this.props.onPatientChange(patient);
    this.setState({ selectedPatient: patient.name, searchTerm: '' });
  };

  renderPatient = patient => {
    const classes = [
      'patient-card',
      patient.name === this.state.selectedPatient && 'patient-card__selected',
    ]
      .filter(Boolean)
      .join(' ');

    const onSelect = () => this.onSelectPatient(patient);

    return (
      <div className={classes} key={patient._id} onClick={onSelect}>
        <b>{patient.name}</b>
        <p>{patient.phone}</p>
      </div>
    );
  };

  onSearchTermChange = e => {
    this.setState({ searchTerm: e.target.value });
  };

  render() {
    const patients = this.props.patients
      .filter(patient =>
        patient.name.toLowerCase().includes(this.state.searchTerm.toLowerCase())
      )
      .map(this.renderPatient);

    return (
      <div className="left-side">
        <input
          className="search-bar"
          type="text"
          value={this.state.searchTerm}
          onChange={this.onSearchTermChange}
          placeholder="Искать пациента"
        />
        {patients}
      </div>
    );
  }
}
