import Notification from '../models/Notification.model.js';

export const createNotification = async ({
  userId,
  disputeId,
  type,
  title,
  message,
  metadata = {}
}) => {
  const notification = await Notification.create({
    user: userId,
    dispute: disputeId,
    type,
    title,
    message,
    metadata
  });

  return notification;
};

export const formatNotification = (notification) => ({
  id: notification._id,
  type: notification.type,
  title: notification.title,
  message: notification.message,
  dispute: notification.dispute,
  metadata: notification.metadata,
  isRead: notification.isRead,
  createdAt: notification.createdAt
});
