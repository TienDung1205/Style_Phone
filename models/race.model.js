const mongoose = require('mongoose');

const raceSchema = new mongoose.Schema({
  tenChang: String,
  ngayDua: Date,
  status: String,
  position: Number,
  chieuDai: Number,
  soVongDua: Number,
  diaDiem: String
}, {
  timestamps: true
});

const Race = mongoose.model('Race', raceSchema, "races");
module.exports = Race;