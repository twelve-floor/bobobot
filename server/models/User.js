const mongoose = require('mongoose');
require('mongoose-type-email');


const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
      type: mongoose.SchemaTypes.Email,
      required: true,
      unique: true
  }
});

module.exports = mongoose.model('User', UserSchema);