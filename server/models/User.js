const mongoose = require('mongoose');
require('mongoose-type-email');

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: false,
  },
  telegramId: {
    type: String,
    required: true,
  },
  email: {
    type: mongoose.SchemaTypes.Email,
    required: true,
    unique: true,
  },
  passwordHash: {
    type: String,
    required: true,
  },
  patients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Patient' }],
});

module.exports = mongoose.model('User', UserSchema);
