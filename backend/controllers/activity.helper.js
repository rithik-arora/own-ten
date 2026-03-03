import Activity from '../models/Activity.model.js';

export const createActivity = async ({ disputeId, userId, type, description, metadata = {} }) => {
  try {
    if (!disputeId || !userId || !type) {
      return;
    }

    await Activity.create({
      disputeId,
      userId,
      type,
      description: description?.slice(0, 500) || '',
      metadata
    });
  } catch (error) {
    // Do not block main flow on analytics/timeline failures
    console.error('Activity create error:', error?.message || error);
  }
};

