const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  teamName: { type: String, required: true, unique: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  contactInfo: String,
  robots: [String],
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  limit: { type: Number, required: true, default: 5 }
});

module.exports = mongoose.model('Team', TeamSchema);
