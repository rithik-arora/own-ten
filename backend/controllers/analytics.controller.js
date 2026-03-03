import mongoose from 'mongoose'
import Dispute from '../models/Dispute.model.js'
import Property from '../models/Property.model.js'
import User from '../models/User.model.js'
import Payment from '../models/Payment.model.js'

/* HELPER: DISPUTES PER MONTH*/
const buildDisputesPerMonthPipeline = (match) => [
  { $match: match },
  {
    $group: {
      _id: {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      },
      count: { $sum: 1 }
    }
  },
  { $sort: { '_id.year': 1, '_id.month': 1 } },
  {
    $project: {
      _id: 0,
      month: '$_id.month',
      count: 1
    }
  }
]

/* OWNER ANALYTICS */
export const getOwnerAnalytics = async (req, res, next) => {
  try {
    const ownerId = new mongoose.Types.ObjectId(req.user.id)

    /* ================= PROPERTIES ================= */
    const properties = await Property.find({ ownerId }).select('_id')
    const propertyIds = properties.map(p => p._id)

    /* ================= DISPUTES ================= */
    const baseMatch = { propertyId: { $in: propertyIds } }

    const [
      totalDisputes,
      openDisputes,
      resolvedDisputes,
      escalatedDisputes,
      disputesByStatus,
      disputesPerMonth
    ] = await Promise.all([
      Dispute.countDocuments(baseMatch),
      Dispute.countDocuments({ ...baseMatch, status: 'OPEN' }),
      Dispute.countDocuments({ ...baseMatch, status: 'RESOLVED' }),
      Dispute.countDocuments({ ...baseMatch, status: 'ESCALATED' }),

      Dispute.aggregate([
        { $match: baseMatch },
        { $group: { _id: '$status', count: { $sum: 1 } } },
        { $project: { _id: 0, status: '$_id', count: 1 } }
      ]),

      Dispute.aggregate(buildDisputesPerMonthPipeline(baseMatch))
    ])

    /* ================= PAYMENTS ================= */
    const [totalEarnedAgg, monthlyAgg, recent] = await Promise.all([
      Payment.aggregate([
        { $match: { ownerId, status: 'SUCCESS' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]),

      Payment.aggregate([
        { $match: { ownerId, status: 'SUCCESS' } },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            total: { $sum: '$amount' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } }
      ]),

      Payment.find({ ownerId, status: 'SUCCESS' })
        .populate('tenantId', 'name')
        .populate('propertyId', 'address')
        .sort({ createdAt: -1 })
        .limit(5)
    ])

    const totalEarned = totalEarnedAgg[0]?.total || 0

    res.json({
      success: true,
      data: {
        /* ===== EARNINGS ===== */
        totalEarned,
        monthlyEarnings: monthlyAgg,
        recentPayments: recent,

        /* ===== DISPUTES ===== */
        totalDisputes,
        openDisputes,
        resolvedDisputes,
        escalatedDisputes,
        disputesPerMonth,
        disputesByStatus
      }
    })
  } catch (err) {
    next(err)
  }
}

/* ADMIN ANALYTICS*/
export const getAdminAnalytics = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalProperties,
      totalDisputes,
      activeDisputes,
      resolvedDisputes,
      disputesPerMonth
    ] = await Promise.all([
      User.countDocuments(),
      Property.countDocuments(),
      Dispute.countDocuments(),
      Dispute.countDocuments({ status: { $in: ['OPEN', 'ESCALATED'] } }),
      Dispute.countDocuments({ status: 'RESOLVED' }),
      Dispute.aggregate(buildDisputesPerMonthPipeline({}))
    ])

    res.json({
      success: true,
      data: {
        totalUsers,
        totalProperties,
        totalDisputes,
        activeDisputes,
        resolvedDisputes,
        disputesPerMonth
      }
    })
  } catch (err) {
    next(err)
  }
}
