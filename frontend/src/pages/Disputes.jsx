import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { disputeService } from '../services/disputeService'
import { 
  AlertCircle, 
  Clock, 
  CheckCircle, 
  Flame,
  Filter,
  X,
  Plus
} from 'lucide-react'

const Disputes = () => {
  const { user } = useAuth()
  const [disputes, setDisputes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: ''
  })
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchDisputes()
  }, [filters])

  const fetchDisputes = async () => {
    try {
      setLoading(true)
      const response = await disputeService.getDisputes(filters)
      setDisputes(response.data.disputes)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch disputes')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    })
  }

  const clearFilters = () => {
    setFilters({
      status: '',
      category: '',
      priority: ''
    })
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

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 100
      }
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

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="max-w-7xl mx-auto">
        {/* Header with animated gradient */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Disputes
            </h1>
            <p className="text-zinc-400 mt-1">Manage and track all disputes</p>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Link
              to="/disputes/new"
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Dispute
            </Link>
          </motion.div>
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

        {/* Filter toggle button for mobile */}
        <div className="mb-4 sm:hidden">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? 'Hide Filters' : 'Show Filters'}
          </button>
        </div>

        {/* Filters */}
        <motion.div
          initial={false}
          animate={{ height: showFilters ? 'auto' : 'auto' }}
          className={`${!showFilters && 'hidden sm:block'}`}
        >
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-xl p-6 mb-8 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4 sm:hidden">
              <h3 className="font-semibold">Filters</h3>
              <button onClick={() => setShowFilters(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-zinc-300 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  name="status"
                  value={filters.status}
                  onChange={handleFilterChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="ESCALATED">Escalated</option>
                  <option value="RESOLVED">Resolved</option>
                </select>
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-zinc-300 mb-2">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Categories</option>
                  <option value="MAINTENANCE">Maintenance</option>
                  <option value="PAYMENT">Payment</option>
                  <option value="BEHAVIOR">Behavior</option>
                  <option value="LEASE_VIOLATION">Lease Violation</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-zinc-300 mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  name="priority"
                  value={filters.priority}
                  onChange={handleFilterChange}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Priorities</option>
                  <option value="URGENT">Urgent</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
              <div className="flex items-end">
                <button
                  onClick={clearFilters}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors border border-zinc-700"
                >
                  Clear Filters
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {disputes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-zinc-900 border border-zinc-800 rounded-xl text-center py-16 px-4"
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-7xl mb-4"
            >
              ⚖️
            </motion.div>
            <h3 className="text-2xl font-semibold text-white mb-2">No disputes found</h3>
            <p className="text-zinc-400 mb-6">
              {Object.values(filters).some(f => f) 
                ? 'No disputes match your filters'
                : 'Get started by creating your first dispute'}
            </p>
            <Link
              to="/disputes/new"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors"
            >
              <Plus className="w-5 h-5" />
              Create Dispute
            </Link>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <AnimatePresence>
              {disputes.map((dispute) => (
                <motion.div
                  key={dispute._id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01, transition: { duration: 0.2 } }}
                  layout
                >
                  <Link
                    to={`/disputes/${dispute._id}`}
                    className="block bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-xl p-6 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-300 group"
                  >
                    <div className="flex flex-col lg:flex-row justify-between items-start gap-4">
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-indigo-400 transition-colors">
                          {dispute.title}
                        </h3>
                        <p className="text-zinc-400 mb-3 line-clamp-2">
                          {dispute.description}
                        </p>
                        <div className="flex flex-wrap gap-2 items-center text-sm text-zinc-500">
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>
                            Property: {dispute.propertyId?.address || 'N/A'}
                          </span>
                          <span className="text-zinc-700">•</span>
                          <span className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-purple-500 rounded-full"></span>
                            Against: {dispute.againstUser?.name || 'N/A'}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-row lg:flex-col items-center lg:items-end gap-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(
                            dispute.status
                          )}`}
                        >
                          {getStatusIcon(dispute.status)}
                          {dispute.status.replace('_', ' ')}
                        </span>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            dispute.priority
                          )}`}
                        >
                          {dispute.priority}
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pt-4 mt-4 border-t border-zinc-800">
                      <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-500">
                        <span>
                          Category: <span className="text-zinc-300 font-medium">{getCategoryLabel(dispute.category)}</span>
                        </span>
                        <span>
                          Created: <span className="text-zinc-300">{new Date(dispute.createdAt).toLocaleDateString()}</span>
                        </span>
                      </div>
                      <motion.span
                        whileHover={{ x: 5 }}
                        className="text-indigo-400 group-hover:text-indigo-300 font-medium text-sm mt-2 sm:mt-0 flex items-center gap-1"
                      >
                        View Details
                        <span className="text-lg">→</span>
                      </motion.span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  )
}

export default Disputes