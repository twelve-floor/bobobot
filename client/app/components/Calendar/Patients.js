import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import TextField from '@material-ui/core/TextField';
import Card from '@material-ui/core/Card';
import CardHeader from '@material-ui/core/CardHeader';
import IconButton from '@material-ui/core/IconButton';
import MoreVertIcon from '@material-ui/icons/MoreVert';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import { ADD_EVENT, CHOOSE_EVENTS_TEMPLATE } from './constants';

export default class PatientsList extends PureComponent {
  state = {
    searchTerm: '',
    selectedId: 0,
    anchorEl: null,
  };

  onSelectPatient = patient => {
    if (this.props.clickable) {
      this.props.onPatientChange(patient);
      this.setState({ selectedId: patient._id, searchTerm: '' });
    }
  };

  renderPatient = patient => {
    const style =
      patient._id === this.state.selectedId
        ? { backgroundColor: 'floralwhite', cursor: 'pointer' }
        : { cursor: 'pointer' };

    const onSelect = () => this.onSelectPatient(patient);

    return (
      <Card style={style} key={patient._id} onClick={onSelect}>
        <CardHeader
          action={
            <IconButton
              aria-label="Settings"
              onClick={this.openMenu}
              disabled={!this.props.clickable}
            >
              <MoreVertIcon />
            </IconButton>
          }
          title={patient.name}
          subheader={patient.phoneNumber}
        />
      </Card>
    );
  };

  onSearchTermChange = e => {
    this.setState({ searchTerm: e.target.value });
  };

  openMenu = e => {
    if (this.state.selectedId !== 0) {
      this.setState({ anchorEl: e.currentTarget });
    }
  };

  handleClose = () => {
    this.setState({ anchorEl: null });
  };

  onAddEvent = () => {
    this.setState({ anchorEl: null });
    this.props.changeModalType(ADD_EVENT);
    this.props.makeCalendarSelectable();
  };

  onAddMultipleEvents = () => {
    this.setState({ anchorEl: null });
    this.props.changeModalType(CHOOSE_EVENTS_TEMPLATE);
  };

  render() {
    const patients = this.props.patients
      .filter(patient =>
        patient.name.toLowerCase().includes(this.state.searchTerm.toLowerCase())
      )
      .map(this.renderPatient);

    return (
      <div className="patients-container">
        <TextField
          variant="outlined"
          fullWidth
          label="Искать пациента"
          value={this.state.searchTerm}
          onChange={this.onSearchTermChange}
        />

        {patients}
        <Menu
          id="simple-menu"
          anchorEl={this.state.anchorEl}
          keepMounted
          open={Boolean(this.state.anchorEl)}
          onClose={this.handleClose}
        >
          <MenuItem onClick={this.onAddEvent}>Добавить событие</MenuItem>
          <MenuItem onClick={this.onAddMultipleEvents}>
            Добавить группу событий
          </MenuItem>
          <MenuItem onClick={this.handleClose}>Изменить</MenuItem>
          <MenuItem onClick={this.handleClose}>Удалить</MenuItem>
        </Menu>
      </div>
    );
  }
}

PatientsList.propTypes = {
  makeCalendarSelectable: PropTypes.func.isRequired,
  changeModalType: PropTypes.func.isRequired,
  onPatientChange: PropTypes.func.isRequired,
  patients: PropTypes.array.isRequired,
  clickable: PropTypes.bool.isRequired,
};
