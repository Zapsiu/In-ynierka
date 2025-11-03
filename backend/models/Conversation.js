const { Schema, model, Types } = require('mongoose');

const conversationSchema = new Schema({
  ownerUserId: { type: Types.ObjectId, ref: 'User', required: true }, 
  staffIds: [{ type: Types.ObjectId, ref: 'User' }], 
  title: { type: String, default: 'Wiadomość do obsługi' }
}, { timestamps: true });

module.exports = model('Conversation', conversationSchema);
