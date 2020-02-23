import React, { useState } from 'react';
import PropTypes from 'prop-types';

import TextField from '@material-ui/core/TextField';
import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import axios from 'axios';

DeletePatientModal.propTypes = {
  closeModal: PropTypes.func.isRequired,
  patientId: PropTypes.string.isRequired,
  setLoading: PropTypes.func.isRequired,
  onPatientRemoved: PropTypes.func.isRequired,
};

export default function DeletePatientModal(props) {
  const onDeletePatient = () => {
    const token = localStorage.getItem('token');
    props.setLoading(true);
    axios
      .delete(`/api/patients/${props.patientId}`, { headers: { token: token } })
      .then(() => {
        props.onPatientRemoved(props.patientId);
      })
      .catch(er => alert(er))
      .finally(() => {
        props.setLoading(false);
        props.closeModal();
      });
  };
  return (
    <>
      <h2>Вы уверены, что хотите удалить пациента?</h2>

      <Grid item xs={12}>
        <Button onClick={onDeletePatient} color="secondary">
          Удалить
        </Button>
        <Button onClick={props.closeModal}>Отмена</Button>
      </Grid>
    </>
  );
}
