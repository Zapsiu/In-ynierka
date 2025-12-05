// routes/chat.js
const express = require("express");
const router = express.Router();

const {
  authChat,
  createConversation,
  getConversations,
  getConversationMessages,
  postConversationMessage,
  markConversationRead
} = require("../controllers/chatController");

// globalny middleware autoryzacji dla całego routera (to co było w router.use)
router.use(authChat);

// POST /api/chat/conversation
router.post("/conversation", createConversation);

// GET /api/chat/conversations
router.get("/conversations", getConversations);

// GET /api/chat/conversation/:id/messages
router.get("/conversation/:id/messages", getConversationMessages);

// POST /api/chat/conversation/:id/messages
router.post("/conversation/:id/messages", postConversationMessage);

// POST /api/chat/conversation/:id/read
router.post("/conversation/:id/read", markConversationRead);

module.exports = router;
