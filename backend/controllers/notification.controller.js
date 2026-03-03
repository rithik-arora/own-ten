import mongoose from 'mongoose';
import { createNotification, formatNotification } from './notification.helper.js';
import Notification from '../models/Notification.model.js';
import { getIO } from '../config/socket.js';

export const getNotifications = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 50);
    const skip = parseInt(req.query.skip, 10) || 0;
    const isReadFilter = req.query.isRead;

    const query = { user: req.user.id };
    if (isReadFilter === 'true') query.isRead = true;
    if (isReadFilter === 'false') query.isRead = false;

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments({ user: req.user.id, isRead: false })
    ]);

    res.status(200).json({
      success: true,
      data: {
        notifications: notifications.map(formatNotification),
        unreadCount
      }
    });
  } catch (error) {
    next(error);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid notification id'
      });
    }

    const notification = await Notification.findOne({
      _id: id,
      user: req.user.id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    if (!notification.isRead) {
      notification.isRead = true;
      await notification.save();
    }

    res.status(200).json({
      success: true,
      data: { notification: formatNotification(notification) }
    });
  } catch (error) {
    next(error);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { $set: { isRead: true } }
    );

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    next(error);
  }
};

export const createAndDispatchNotification = async (payload) => {
  const notification = await createNotification(payload);
  const io = getIO();
  if (io) {
    io.to(`user_${payload.userId}`).emit('notification:new', formatNotification(notification));
  }
  return notification;
};
