const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
const User = require('../models/User');

function hasAccess(userId, conv) {
  const id = String(userId);
  return String(conv.ownerUserId) === id || conv.staffIds.map(String).includes(id);
}

router.use((req, res, next) => {
  const hdr = req.headers.authorization || '';
  const token = hdr.startsWith('Bearer ') ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'No token' });

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const userId = payload.sub || payload.id || payload._id;
    if (!userId) return res.status(401).json({ error: 'Invalid payload' });
    req.user = { id: userId, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid token' });
  }
});

router.post('/conversation', async (req, res) => {
  const { staffUsernames = [] } = req.body || {};
  const ownerUserId = req.user.id;

  let staffQuery;
  if (Array.isArray(staffUsernames) && staffUsernames.length > 0) {
    staffQuery = { username: { $in: staffUsernames }, role: { $in: ['judge','admin'] } };
  } else {
    staffQuery = { role: { $in: ['judge','admin'] } };
  }

  const staff = await User.find(staffQuery, '_id');
  const staffIds = staff.map(u => u._id);

  let conv = await Conversation.findOne({
    ownerUserId,
    staffIds: { $all: staffIds, $size: staffIds.length }
  });

  if (!conv) {
    conv = await Conversation.create({ ownerUserId, staffIds, title: 'Wiadomość do obsługi' });
  }

  res.json(conv);
});

router.get('/conversations', async (req, res) => {
  const { id, role } = req.user;
  const query = role === 'user' ? { ownerUserId: id } : { staffIds: id };

  const list = await Conversation.find(query)
    .populate('ownerUserId', 'firstName lastName username role')
    .sort({ updatedAt: -1 });

  const convIds = list.map(c => c._id);

  const unreadAgg = await Message.aggregate([
    {
      $match: {
        conversationId: { $in: convIds },
        readBy: { $ne: req.user.id }
      }
    },
    {
      $group: {
        _id: '$conversationId',
        count: { $sum: 1 }
      }
    }
  ]);

  const unreadMap = unreadAgg.reduce((acc, row) => {
    acc[String(row._id)] = row.count;
    return acc;
  }, {});

  const out = list.map(c => {
    const obj = c.toObject();
    obj.unreadCount = unreadMap[String(c._id)] || 0;
    return obj;
  });

  res.json(out);
});

router.get('/conversation/:id/messages', async (req, res) => {
  const conv = await Conversation.findById(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  if (!hasAccess(req.user.id, conv)) return res.status(403).json({ error: 'Forbidden' });

  const items = await Message.find({ conversationId: conv._id })
    .sort({ createdAt: 1 })
    .populate('senderId', 'username role firstName lastName');

  const normalized = items.map(m => ({
    _id: m._id,
    conversationId: m.conversationId,
    body: m.body,
    createdAt: m.createdAt,
    sender: {
      id: m.senderId?._id,
      username: m.senderId?.username,
      role: m.senderId?.role,
      firstName: m.senderId?.firstName,
      lastName: m.senderId?.lastName
    }
  }));
  res.json(normalized);
});

router.post('/conversation/:id/messages', async (req, res) => {
  const conv = await Conversation.findById(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  if (!hasAccess(req.user.id, conv)) return res.status(403).json({ error: 'Forbidden' });

  const body = (req.body?.body || '').trim();
  if (!body) return res.status(400).json({ error: 'Empty message' });

  const msg = await Message.create({
    conversationId: conv._id,
    senderId: req.user.id,
    body,
    readBy: [req.user.id]
  });

  conv.updatedAt = new Date();
  await conv.save();

  const populated = await Message.findById(msg._id)
    .populate('senderId', 'username role firstName lastName');

  const payload = {
    _id: populated._id,
    conversationId: populated.conversationId,
    body: populated.body,
    createdAt: populated.createdAt,
    sender: {
      id: populated.senderId?._id,
      username: populated.senderId?.username,
      role: populated.senderId?.role,
      firstName: populated.senderId?.firstName,
      lastName: populated.senderId?.lastName
    }
  };

  const io = req.app.get('io');
  if (io) {
    io.to(String(populated.conversationId)).emit('chat:message', payload);
  }

  res.json(payload);
});

router.post('/conversation/:id/read', async (req, res) => {
  const conv = await Conversation.findById(req.params.id);
  if (!conv) return res.status(404).json({ error: 'Conversation not found' });
  if (!hasAccess(req.user.id, conv)) return res.status(403).json({ error: 'Forbidden' });

  await Message.updateMany(
    { conversationId: conv._id, readBy: { $ne: req.user.id } },
    { $push: { readBy: req.user.id } }
  );

  const io = req.app.get('io');
  if (io) {
    io.to(String(conv._id)).emit('chat:read', {
      conversationId: conv._id,
      userId: req.user.id
    });
  }

  res.json({ ok: true });
});

module.exports = router;
