import React, { Fragment, useState } from 'react';
import PropTypes from 'prop-types';

import Grid from '@material-ui/core/Grid';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Delete from '@material-ui/icons/Delete';
import axios from 'axios';

SelectEventTemplateModal.propTypes = {
  onEventTemplateSelected: PropTypes.func.isRequired,
  eventTemplates: PropTypes.array.isRequired,
  closeModal: PropTypes.func.isRequired,
};

export default function SelectEventTemplateModal(props) {
  const items = props.eventTemplates.map((item, index) => {
    return (
      <Grid key={index} container justify="space-between">
        <Button onClick={() => props.onEventTemplateSelected(item)}>
          {item.name}
        </Button>
      </Grid>
    );
  });

  return (
    <div className="templateModal">
      <h2>Выберите шаблон</h2>
      <Grid container spacing={2} justify="flex-start" direction="row">
        {items}
      </Grid>
      <Grid item xs={12}>
        <Button onClick={props.closeModal}>Отмена</Button>
      </Grid>
    </div>
  );
}
