import React, { useState } from 'react';
import PropTypes from 'prop-types';

import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import axios from 'axios';
import InputMask from 'react-input-mask';

AddPatientModal.propTypes = {
  setLoading: PropTypes.func.isRequired,
  closeModal: PropTypes.func.isRequired,
  patientAdded: PropTypes.func.isRequired,
};

export default function AddPatientModal(props) {
  const [newPatientName, changePatientName] = useState('');
  const [newPatientPhone, changePatientPhone] = useState('');

  const onUpdateName = e => {
    changePatientName(e.target.value);
  };

  const onUpdatePhone = e => {
    changePatientPhone(e.target.value);
  };

  const onAddPatient = () => {
    if (!newPatientName || !newPatientPhone) {
      alert('Введите имя и номер телефона');
      return;
    }
    const phoneClean = newPatientPhone.replace(/ |_/g, '');
    if (phoneClean.length !== 12) {
      alert('Введите правильный телефон');
      return;
    }
    const token = localStorage.getItem('token');
    props.setLoading(true);
    axios
      .post(
        '/api/patients',
        { name: newPatientName, phoneNumber: phoneClean },
        { headers: { token: token } }
      )
      .then(res => {
        if (res.data != null) {
          props.patientAdded(res.data);
        } else {
          alert('Пациент уже добавлен');
          props.closeModal();
        }
      })
      .catch(er => alert(er))
      .finally(() => props.setLoading(false));
  };

  return (
    <>
      <h2>Добавить пациента</h2>
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <TextField
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
          <div className="MuiInputBase-root MuiInput-root MuiInput-underline MuiInputBase-fullWidth MuiInput-fullWidth MuiInputBase-formControl MuiInput-formControl">
            <InputMask
              placeholder="Номер телефона"
              className="MuiInputBase-input MuiOutlinedInput-input"
              mask="+7 999 999 9999"
              value={newPatientPhone}
              onChange={onUpdatePhone}
            />
          </div>
        </Grid>
        <Grid item xs={12}>
          <Button onClick={onAddPatient} color="primary">
            Добавить
          </Button>
          <Button onClick={props.closeModal}>Отмена</Button>
        </Grid>
      </Grid>
    </>
  );
}
