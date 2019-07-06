const mongoose = require('mongoose');
require('mongoose-type-email');

const EventTemplateSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  events: [{ name: String, dayOffset: Number }],
});

module.exports = mongoose.model('EventTemplate', EventTemplateSchema);
