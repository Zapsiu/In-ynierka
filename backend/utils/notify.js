const Notification = require("../models/Notification");

async function createNotification({ userId, type, message, meta = {}, io }) {
  const doc = await Notification.create({
    user: userId,
    type,
    message,
    meta
  });

  if (io) {
    io.to(`user:${userId}`).emit("notification", {
      id: String(doc._id),
      type,
      message,
      meta,
      createdAt: doc.createdAt,
      read: doc.read
    });
  }

  return doc;
}

module.exports = { createNotification };
