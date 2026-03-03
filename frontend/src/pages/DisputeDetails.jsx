import { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { disputeService } from '../services/disputeService'
import Chat from '../components/Chat'
import EvidenceUpload from '../components/EvidenceUpload'
import DisputeTimeline from '../components/DisputeTimeline'
import PayDisputeFeeButton from '../components/PayDisputeButton'
import {
  ArrowLeft,
  AlertCircle,
  Clock,
  CheckCircle,
  Flame,
  Home,
  User,
  Calendar,
  Edit3,
  FileText,
  Shield,
  DollarSign
} from 'lucide-react'

const DisputeDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [dispute, setDispute] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    note: ''
  })

  useEffect(() => {
    fetchDispute()
  }, [id])

  const fetchDispute = async () => {
    try {
      setLoading(true)
      const response = await disputeService.getDispute(id)
      setDispute(response.data.dispute)
      setStatusUpdate({ status: response.data.dispute.status, note: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch dispute')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (e) => {
    e.preventDefault()
    setUpdatingStatus(true)
    setError('')

    try {
      await disputeService.updateDisputeStatus(id, statusUpdate.status, statusUpdate.note)
      fetchDispute()
      setStatusUpdate({ status: statusUpdate.status, note: '' })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'OPEN': return <AlertCircle className="w-3 h-3 mr-1" />
      case 'IN_PROGRESS': return <Clock className="w-3 h-3 mr-1" />
      case 'ESCALATED': return <Flame className="w-3 h-3 mr-1" />
      case 'RESOLVED': return <CheckCircle className="w-3 h-3 mr-1" />
      default: return null
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-900/30 text-blue-300 border border-blue-800'
      case 'IN_PROGRESS':
        return 'bg-yellow-900/30 text-yellow-300 border border-yellow-800'
      case 'ESCALATED':
        return 'bg-red-900/30 text-red-300 border border-red-800'
      case 'RESOLVED':
        return 'bg-green-900/30 text-green-300 border border-green-800'
      default:
        return 'bg-zinc-800 text-zinc-300 border border-zinc-700'
    }
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-900/30 text-red-300 border border-red-800'
      case 'HIGH':
        return 'bg-orange-900/30 text-orange-300 border border-orange-800'
      case 'MEDIUM':
        return 'bg-yellow-900/30 text-yellow-300 border border-yellow-800'
      case 'LOW':
        return 'bg-green-900/30 text-green-300 border border-green-800'
      default:
        return 'bg-zinc-800 text-zinc-300 border border-zinc-700'
    }
  }

  const getCategoryLabel = (category) => {
    const labels = {
      MAINTENANCE: 'Maintenance',
      PAYMENT: 'Payment',
      BEHAVIOR: 'Behavior',
      LEASE_VIOLATION: 'Lease Violation',
      OTHER: 'Other'
    }
    return labels[category] || category
  }

  const canUpdateStatus = user?.role === 'OWNER' || user?.role === 'ADMIN'

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (error && !dispute) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen bg-black flex items-center justify-center px-4"
      >
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Dispute Not Found</h2>
          <p className="text-zinc-400 mb-6">{error}</p>
          <Link
            to="/disputes"
            className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
          >
            Back to Disputes
          </Link>
        </div>
      </motion.div>
    )
  }

  if (!dispute) return null

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 py-8 lg:py-12"
    >
      <div className="max-w-6xl mx-auto">
        {/* Back button */}
        <motion.button
          variants={itemVariants}
          onClick={() => navigate('/disputes')}
          className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to Disputes
        </motion.button>

        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col lg:flex-row justify-between items-start gap-4 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
              {dispute.title}
            </h1>
            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center ${getStatusColor(dispute.status)}`}>
                {getStatusIcon(dispute.status)}
                {dispute.status.replace('_', ' ')}
              </span>
              <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getPriorityColor(dispute.priority)}`}>
                {dispute.priority}
              </span>
              <span className="px-3 py-1.5 rounded-full text-xs font-medium bg-purple-900/30 text-purple-300 border border-purple-800">
                {getCategoryLabel(dispute.category)}
              </span>
            </div>
          </div>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-red-900/50 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5" />
            {error}
          </motion.div>
        )}

        {/* Main content grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column - main details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <motion.div variants={itemVariants} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <FileText className="text-indigo-400" size={20} />
                Description
              </h2>
              <p className="text-zinc-300 whitespace-pre-wrap leading-relaxed">
                {dispute.description}
              </p>
            </motion.div>

            {/* DISPUTE FEE PAYMENT (TENANT ONLY) */}
            {user?.role === 'TENANT' && dispute.status !== 'RESOLVED' && (
              <motion.div variants={itemVariants} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="text-indigo-400" size={20} />
                  Dispute Fee
                </h2>
                <p className="text-zinc-400 mb-4">
                  Pay dispute fee to continue this dispute process.
                </p>
                <PayDisputeFeeButton
                  propertyId={dispute.propertyId?._id}
                  disputeId={dispute._id}
                />
              </motion.div>
            )}

            {/* Evidence */}
            <motion.div variants={itemVariants}>
              <EvidenceUpload disputeId={dispute._id} />
            </motion.div>

            {/* Status History */}
            {dispute.statusHistory && dispute.statusHistory.length > 0 && (
              <motion.div variants={itemVariants} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Clock className="text-indigo-400" size={20} />
                  Status History
                </h2>
                <div className="space-y-4">
                  {dispute.statusHistory.slice().reverse().map((history, index) => (
                    <div key={index} className="flex items-start gap-4 pb-4 border-b border-zinc-800 last:border-0">
                      <div className="flex-shrink-0">
                        <div className={`w-3 h-3 rounded-full ${getStatusColor(history.status).split(' ')[0]}`}></div>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                          <div>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(history.status)}`}>
                              {getStatusIcon(history.status)}
                              {history.status.replace('_', ' ')}
                            </span>
                            <p className="text-sm text-zinc-400 mt-1">
                              Changed by {history.changedBy?.name || 'Unknown'}
                            </p>
                          </div>
                          <span className="text-xs text-zinc-500">
                            {new Date(history.changedAt).toLocaleString()}
                          </span>
                        </div>
                        {history.note && (
                          <p className="text-sm text-zinc-300 mt-2 italic bg-zinc-800/50 p-3 rounded-lg">
                            "{history.note}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right column - sidebar */}
          <div className="space-y-6">
            {/* Property Information */}
            <motion.div variants={itemVariants} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Home className="text-indigo-400" size={20} />
                Property
              </h2>
              <div className="space-y-3">
                <div>
                  <p className="text-zinc-400 text-sm">Address</p>
                  <p className="font-medium">
                    {dispute.propertyId?.address || 'N/A'}
                  </p>
                  <p className="text-zinc-300 text-sm">
                    {dispute.propertyId?.city}, {dispute.propertyId?.state}
                  </p>
                </div>
                <Link
                  to={`/properties/${dispute.propertyId?._id}`}
                  className="inline-flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                >
                  View Property
                  <ArrowLeft size={14} className="rotate-180" />
                </Link>
              </div>
            </motion.div>

            {/* Parties */}
            <motion.div variants={itemVariants} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <User className="text-indigo-400" size={20} />
                Parties
              </h2>
              <div className="space-y-4">
                <div>
                  <p className="text-xs text-zinc-500 uppercase mb-1">Created By</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-indigo-500/20 rounded-full flex items-center justify-center">
                      <User size={16} className="text-indigo-400" />
                    </div>
                    <div>
                      <p className="font-medium">{dispute.createdBy?.name}</p>
                      <p className="text-sm text-zinc-400">{dispute.createdBy?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-xs border border-zinc-700">
                        {dispute.createdBy?.role}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-zinc-800 pt-4">
                  <p className="text-xs text-zinc-500 uppercase mb-1">Against</p>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-red-500/20 rounded-full flex items-center justify-center">
                      <Shield size={16} className="text-red-400" />
                    </div>
                    <div>
                      <p className="font-medium">{dispute.againstUser?.name}</p>
                      <p className="text-sm text-zinc-400">{dispute.againstUser?.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 bg-zinc-800 text-zinc-300 rounded text-xs border border-zinc-700">
                        {dispute.againstUser?.role}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Update Status (Owner/Admin only) */}
            {canUpdateStatus && dispute.status !== 'RESOLVED' && (
              <motion.div variants={itemVariants} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <Edit3 className="text-indigo-400" size={20} />
                  Update Status
                </h2>
                <form onSubmit={handleStatusUpdate} className="space-y-3">
                  <div>
                    <select
                      value={statusUpdate.status}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, status: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="OPEN">Open</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="ESCALATED">Escalated</option>
                      <option value="RESOLVED">Resolved</option>
                    </select>
                  </div>
                  <div>
                    <textarea
                      value={statusUpdate.note}
                      onChange={(e) => setStatusUpdate({ ...statusUpdate, note: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      rows={3}
                      placeholder="Optional note..."
                      maxLength={500}
                    />
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    disabled={updatingStatus || statusUpdate.status === dispute.status}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updatingStatus ? 'Updating...' : 'Update Status'}
                  </motion.button>
                </form>
              </motion.div>
            )}

            {/* Metadata */}
            <motion.div variants={itemVariants} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="text-indigo-400" size={20} />
                Details
              </h2>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-zinc-500 uppercase">Created</p>
                  <p className="font-medium text-sm">
                    {new Date(dispute.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase">Last Updated</p>
                  <p className="font-medium text-sm">
                    {new Date(dispute.updatedAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Timeline + Chat */}
        <motion.div variants={itemVariants} className="mt-8">
          <DisputeTimeline disputeId={dispute._id} />
        </motion.div>
        <motion.div variants={itemVariants} className="mt-6">
          <Chat disputeId={dispute._id} />
        </motion.div>
      </div>
    </motion.div>
  )
}

export default DisputeDetails