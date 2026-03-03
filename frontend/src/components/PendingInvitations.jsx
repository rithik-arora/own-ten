import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { joinRequestService } from '../services/joinRequestService'
import { useSocket } from '../hooks/useSocket'
import toast from 'react-hot-toast'
import { Clock, AlertCircle, Loader2 } from 'lucide-react'

const PendingInvitations = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { socket } = useSocket()

  const load = async (checkApproval = false) => {
    try {
      setLoading(true)
      setError('')

      const res = await joinRequestService.getMyJoinRequests()
      const all = res.data.requests || []

      // show only pending
      const pending = all.filter(r => r.status === 'PENDING')
      setRequests(pending)

      // ⭐ check for new approval ONLY when realtime update
      if (checkApproval) {
        const approved = all.find(r => r.status === 'APPROVED')

        if (approved) {
          const lastApproved = localStorage.getItem('lastApprovedRequest')

          if (lastApproved !== approved._id) {
            localStorage.setItem('lastApprovedRequest', approved._id)

            toast.success('Owner approved your request 🎉')
            navigate(`/properties/${approved.propertyId._id}`)
          }
        }
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load(false) // first load → DO NOT redirect
  }, [])

  // realtime socket update
  useEffect(() => {
    if (!socket) return

    socket.on('join_request:updated', () => {
      load(true) // only now check approval
    })

    return () => {
      socket.off('join_request:updated')
    }
  }, [socket])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { type: 'spring', stiffness: 100 }
    }
  }

  if (loading) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
        <div className="flex justify-center py-8">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Pending Invitations
        </h3>
        <span className="text-sm text-zinc-400 bg-zinc-800 px-2 py-1 rounded-full">
          {requests.length} pending
        </span>
      </div>

      {error && (
        <div className="bg-red-900/50 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-4 flex items-center gap-2 text-sm">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {requests.length === 0 ? (
        <p className="text-sm text-zinc-400">No pending invitations</p>
      ) : (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-3"
        >
          <AnimatePresence>
            {requests.map((r) => (
              <motion.div
                key={r._id}
                variants={itemVariants}
                className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:bg-zinc-800 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-semibold text-white">
                      {r.propertyId?.address}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock size={14} className="text-yellow-400" />
                      <span className="text-xs text-yellow-400 bg-yellow-900/30 px-2 py-0.5 rounded-full border border-yellow-800">
                        Waiting for owner approval
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </motion.div>
  )
}

export default PendingInvitations