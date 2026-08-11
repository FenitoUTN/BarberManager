const notificationModel = require('../models/notification.model');

async function list(req, res, next) {
  try {
    const [notificaciones, noLeidas] = await Promise.all([
      notificationModel.listByUser(req.user.id),
      notificationModel.countUnread(req.user.id),
    ]);
    return res.json({ notificaciones, noLeidas });
  } catch (error) {
    return next(error);
  }
}

async function markRead(req, res, next) {
  try {
    await notificationModel.markAsRead(req.params.id, req.user.id);
    return res.json({ message: 'Notificación marcada como leída' });
  } catch (error) {
    return next(error);
  }
}

async function markAllRead(req, res, next) {
  try {
    await notificationModel.markAllAsRead(req.user.id);
    return res.json({ message: 'Notificaciones marcadas como leídas' });
  } catch (error) {
    return next(error);
  }
}

module.exports = { list, markRead, markAllRead };
