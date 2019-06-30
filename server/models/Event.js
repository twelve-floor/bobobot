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
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient'
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  parentEvent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event'
  },
  sent: {
    type: Boolean
  },
});

module.exports = mongoose.model('Event', EventSchema);
