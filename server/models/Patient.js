const mongoose = require('mongoose');
require('mongoose-type-email');

const PatientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    trim: true,
    index: true,
    unique: true,
    sparse: true,
  },
});

module.exports = mongoose.model('Patient', PatientSchema);
