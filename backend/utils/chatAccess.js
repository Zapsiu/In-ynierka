function hasAccess(userId, conv) {
  const id = String(userId);
  return String(conv.ownerUserId) === id || conv.staffIds.map(String).includes(id);
}
module.exports = { hasAccess };
