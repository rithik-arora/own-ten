import Message from '../models/Message.model.js';
import Dispute from '../models/Dispute.model.js';
import Activity from '../models/Activity.model.js';

// @desc    Get messages for a dispute
// @route   GET /api/messages/dispute/:disputeId
// @access  Private
export const getMessages = async (req, res, next) => {
  try {
    const { disputeId } = req.params;
    const { limit = 50, before } = req.query;

    // Verify dispute exists and user has access
    const dispute = await Dispute.findById(disputeId)
      .populate('createdBy')
      .populate('againstUser');

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    // Check authorization
    const isCreator = dispute.createdBy._id.toString() === req.user.id;
    const isAgainst = dispute.againstUser._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    // Check if owner of the property
    let isPropertyOwner = false;
    if (req.user.role === 'OWNER') {
      const Property = (await import('../models/Property.model.js')).default;
      const property = await Property.findById(dispute.propertyId);
      isPropertyOwner = property?.ownerId.toString() === req.user.id;
    }

    if (!isCreator && !isAgainst && !isAdmin && !isPropertyOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access messages for this dispute'
      });
    }

    // Build query
    const query = { disputeId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    // Get messages
    const messages = await Message.find(query)
      .populate('senderId', 'name email role')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .then(msgs => msgs.reverse()); // Reverse to get chronological order

    res.status(200).json({
      success: true,
      count: messages.length,
      data: { messages }
    });
  } catch (error) {
    next(error);
  }
};

// Note: real-time chat messages are created via Socket.IO in config/socket.js.
// We still want them in the timeline, so we listen there and create Activity entries.

