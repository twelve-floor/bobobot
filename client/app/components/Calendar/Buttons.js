import React, { PureComponent } from 'react';
import Modal from 'react-modal';
import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import axios from 'axios';

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

export default class Buttons extends PureComponent {
  constructor() {
    super();

    this.state = {
      modalIsOpen: false,
      modalContentType: 'ADD_PATIENT',
      newPatientName: '',
      newPatientPhone: '',
      loading: false,
    };
  }

  afterOpenModal = () => {
    // references are now sync'd and can be accessed.
    // this.subtitle.style.color = '#f00';
  };

  closeModal = () => {
    this.setState({ modalIsOpen: false });
  };

  onUpdateName = e => {
    this.setState({ newPatientName: e.target.value });
  };

  onUpdatePhone = e => {
    this.setState({ newPatientPhone: e.target.value });
  };

  openAddPatientModal = () => {
    this.setState({ modalIsOpen: true, modalContentType: 'ADD_PATIENT' });
  };

  onAddPatient = () => {
    const { newPatientName, newPatientPhone } = this.state;
    if (!newPatientName || !newPatientPhone) {
      alert('Введите имя и номер телефона');
      return;
    }
    const token = localStorage.getItem('token');
    this.setState({ loading: true });
    axios
      .post(
        '/api/patients',
        { name: newPatientName, phoneNumber: newPatientPhone },
        { headers: { token: token } }
      )
      .then(res => {
        this.props.patientAdded(res.data);
        this.setState({ modalIsOpen: false, loading: false });
      })
      .catch(er => alert(er));
  };

  renderModalContent = () => {
    if (this.state.modalContentType === 'ADD_PATIENT') {
      return (
        <>
          <h2>Добавить пациента</h2>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="name"
                label="Имя"
                name="name"
                data-lpignore="true"
                value={this.state.newPatientName}
                onChange={this.onUpdateName}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                variant="outlined"
                required
                fullWidth
                id="phone"
                label="Телефон"
                name="phone"
                data-lpignore="true"
                value={this.state.newPatientPhone}
                onChange={this.onUpdatePhone}
              />
            </Grid>
            <Grid item xs={12}>
              <Button onClick={this.onAddPatient}>Добавить</Button>
              <Button onClick={this.closeModal}>Отмена</Button>
            </Grid>
          </Grid>
        </>
      );
    }
  };

  render() {
    return (
      <div className="button-container">
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
          contentLabel="Example Modal"
        >
          {this.renderModalContent()}
          {this.state.loading && <CircularProgress />}
        </Modal>
        <Button onClick={this.openAddPatientModal}>Добавить пациента</Button>
        <Button>Событие</Button>
        <Button>Группа событий</Button>
        <Button>Шаблон группы событий</Button>
      </div>
    );
  }
}
