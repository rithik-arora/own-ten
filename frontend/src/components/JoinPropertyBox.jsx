import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { invitationService } from '../services/invitationService'
import { Link2, Loader2, CheckCircle, AlertCircle } from 'lucide-react'

const JoinPropertyBox = ({ onJoined }) => {
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const navigate = useNavigate()

  // ============================
  // Extract token from link OR direct token
  // ============================
  const extractToken = (value) => {
    // Example link: http://localhost:5173/accept-invite/abc123
    if (value.includes('/accept-invite/')) {
      return value.split('/accept-invite/')[1].trim()
    }
    return value.trim()
  }

  // ============================
  // Submit Handler
  // ============================
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!inputValue.trim()) {
      setMessage({
        type: 'error',
        text: 'Please paste invite link or token'
      })
      return
    }

    const cleanToken = extractToken(inputValue)

    if (!cleanToken) {
      setMessage({
        type: 'error',
        text: 'Invalid invite link or token'
      })
      return
    }

    try {
      setLoading(true)
      setMessage(null)

      const res = await invitationService.joinWithToken(cleanToken)

      setMessage({
        type: 'success',
        text: 'Joined property successfully. Redirecting...'
      })

      onJoined?.()

      const propertyId = res.data.data.propertyId

      setTimeout(() => {
        navigate(`/properties/${propertyId}`)
      }, 800)
    } catch (err) {
      setMessage({
        type: 'error',
        text: err.response?.data?.message || 'Failed to join property'
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
    >
      <h3 className="text-xl font-semibold mb-2 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
        Join a Property
      </h3>

      <p className="text-sm text-zinc-400 mb-4">
        Paste invite link or token shared by the property owner.
      </p>

      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`mb-4 px-4 py-3 rounded-lg flex items-center gap-2 text-sm ${
            message.type === 'success'
              ? 'bg-green-900/50 border border-green-800 text-green-300'
              : 'bg-red-900/50 border border-red-800 text-red-300'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle size={16} className="flex-shrink-0" />
          ) : (
            <AlertCircle size={16} className="flex-shrink-0" />
          )}
          {message.text}
        </motion.div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Link2 size={16} className="text-zinc-500" />
          </div>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Paste invite link or token"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
            disabled={loading}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Joining...
            </>
          ) : (
            'Join Property'
          )}
        </button>
      </form>
    </motion.div>
  )
}

export default JoinPropertyBox