const mongoose = require('mongoose');
require('mongoose-type-email');

const EventSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true
  },
  patient: {
    type: Number
  },
  doctor: {
    type: Number
  },
  parentEvent: {
    type: Number
  },
  sent: {
    type: Boolean
  },
});

module.exports = mongoose.model('Event', EventSchema);
