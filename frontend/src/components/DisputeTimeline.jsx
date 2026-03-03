import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { disputeService } from '../services/disputeService'
import {
  FileText,
  RefreshCw,
  MessageSquare,
  FilePlus,
  CheckCircle,
  Loader2,
  AlertCircle
} from 'lucide-react'

const typeLabelMap = {
  CREATED: 'Dispute created',
  STATUS_CHANGED: 'Status changed',
  MESSAGE: 'Message',
  EVIDENCE: 'Evidence uploaded',
  RESOLVED: 'Dispute resolved'
}

const typeIconMap = {
  CREATED: <FileText size={16} className="text-blue-400" />,
  STATUS_CHANGED: <RefreshCw size={16} className="text-yellow-400" />,
  MESSAGE: <MessageSquare size={16} className="text-purple-400" />,
  EVIDENCE: <FilePlus size={16} className="text-green-400" />,
  RESOLVED: <CheckCircle size={16} className="text-emerald-400" />
}

const DisputeTimeline = ({ disputeId }) => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!disputeId) return
      try {
        setLoading(true)
        setError('')
        const res = await disputeService.getTimeline(disputeId)
        setActivities(res.data.activities || [])
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load timeline')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [disputeId])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 100 }
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-6"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
          Activity Timeline
        </h2>
        <div className="flex justify-center items-center py-8">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-6"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
          Activity Timeline
        </h2>
        <div className="bg-red-900/50 border border-red-800 text-red-300 px-4 py-3 rounded-lg flex items-center gap-2">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      </motion.div>
    )
  }

  if (!activities.length) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-6"
      >
        <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
          Activity Timeline
        </h2>
        <p className="text-zinc-400 text-sm">No activity recorded yet.</p>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mt-6"
    >
      <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
        <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
        Activity Timeline
      </h2>

      <div className="relative pl-6">
        {/* Vertical timeline line */}
        <div className="absolute left-2 top-2 bottom-2 w-px bg-zinc-700" />

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <AnimatePresence>
            {activities.map((activity, index) => (
              <motion.div
                key={activity._id || index}
                variants={itemVariants}
                className="relative"
              >
                {/* Timeline dot with icon */}
                <div className="absolute -left-6 top-1 w-5 h-5 rounded-full bg-zinc-800 border-2 border-zinc-700 flex items-center justify-center">
                  {typeIconMap[activity.type] || <FileText size={12} className="text-zinc-400" />}
                </div>

                <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700 hover:bg-zinc-800 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                    <div>
                      <p className="font-semibold text-white">
                        {typeLabelMap[activity.type] || activity.type}
                      </p>
                      {activity.description && (
                        <p className="text-sm text-zinc-300 mt-1">
                          {activity.description}
                        </p>
                      )}
                      {activity.userId && (
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-xs text-zinc-500">
                            By {activity.userId.name}
                          </span>
                          <span className="text-xs px-2 py-0.5 bg-zinc-700 rounded-full text-zinc-300">
                            {activity.userId.role}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-zinc-500 whitespace-nowrap">
                      {new Date(activity.createdAt).toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default DisputeTimeline