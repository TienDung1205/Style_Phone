const mongoose = require('mongoose');

const racerSchema = new mongoose.Schema({
  hoTen: {
    type: String,
    required: true
  },
  ngaySinh: {
    type: Date,
    required: true
  },
  quocTich: {
    type: String,
    required: true
  },
  loaiXe: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  doiDuaId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team'
  }
}, {
  timestamps: true
});

const Racer = mongoose.model('Racer', racerSchema, "racers");
module.exports = Racer;
