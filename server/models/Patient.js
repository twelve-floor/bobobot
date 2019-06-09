const mongoose = require('mongoose');

const PatientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false,    
    unique: true,    
    lowercase: true
  }
});

module.exports = mongoose.model('Patient', PatientSchema);
