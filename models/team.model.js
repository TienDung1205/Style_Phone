const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  tenDoi: String
}, {
  timestamps: true
});

const Team = mongoose.model('Team', teamSchema, "teams");
module.exports = Team;