const { Schema, model, Types } = require('mongoose');

const messageSchema = new Schema({
  conversationId: { type: Types.ObjectId, ref: 'Conversation', required: true },
  senderId: { type: Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true },
  readBy: [{ type: Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

module.exports = model('Message', messageSchema);
