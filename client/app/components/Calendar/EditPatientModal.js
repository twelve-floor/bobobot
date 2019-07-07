import React, { useState } from 'react';
import PropTypes from 'prop-types';

import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import axios from 'axios';

EditPatientModal.propTypes = {
  setLoading: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  patientEdited: PropTypes.func.isRequired,
  patient: PropTypes.shape({
    name: PropTypes.string,
    phone: PropTypes.string,
    _id: PropTypes.string.isRequired,
  }).isRequired,
};

export default function EditPatientModal(props) {
  const [newPatientName, changePatientName] = useState(props.patient.name);
  const [newPatientPhone, changePatientPhone] = useState(
    props.patient.phoneNumber
  );

  const onUpdateName = e => {
    changePatientName(e.target.value);
  };

  const onUpdatePhone = e => {
    changePatientPhone(e.target.value);
  };

  const onEditPatient = () => {
    if (!newPatientName || !newPatientPhone) {
      alert('Введите имя и номер телефона');
      return;
    }
    const token = localStorage.getItem('token');
    props.setLoading(true);
    axios
      .put(
        `/api/patients/${props.patient._id}`,
        { name: newPatientName, phoneNumber: newPatientPhone },
        { headers: { token: token } }
      )
      .then(res => {
        props.patientEdited(res.data);
      })
      .catch(er => alert(er))
      .finally(() => props.setLoading(false));
  };

  return (
    <>
      <h2>Изменить пациента</h2>
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
            value={newPatientName}
            onChange={onUpdateName}
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
            value={newPatientPhone}
            onChange={onUpdatePhone}
          />
        </Grid>
        <Grid item xs={12}>
          <Button onClick={onEditPatient} color="primary">
            Сохранить
          </Button>
          <Button onClick={props.closeModal}>Отмена</Button>
        </Grid>
      </Grid>
    </>
  );
}
