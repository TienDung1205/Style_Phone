const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  tayDuaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Racer'
  },
  doiDuaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  },
  changDuaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Race'
  },
  ngayDangKy: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

const Registration = mongoose.model('Registration', registrationSchema, "registrations");
module.exports = Registration;
