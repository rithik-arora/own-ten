import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Copy, CheckCircle } from 'lucide-react'
import { propertyService } from '../services/propertyService'

const InviteTenant = ({ propertyId, onClose }) => {
  const [loading, setLoading] = useState(false)
  const [inviteLink, setInviteLink] = useState('')
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [copied, setCopied] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSendInvite = async () => {
    if (!email) {
      setError('Enter tenant email')
      return
    }

    try {
      setLoading(true)
      setError('')

      const res = await propertyService.generateInviteLink(propertyId, email)

      // ✅ FIXED
      setInviteLink(res.data.inviteLink)

      setSent(true)
    } catch (err) {
      console.log("INVITE ERROR:", err)
      setError(err.response?.data?.message || 'Failed to send invite')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-white">Invite Tenant</h2>
          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="bg-red-900/50 p-3 rounded mb-3 text-red-300">
            {error}
          </div>
        )}

        {!sent ? (
          <>
            <input
              type="email"
              placeholder="Tenant email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 mb-4 text-white"
            />

            <button
              onClick={handleSendInvite}
              disabled={loading}
              className="w-full bg-indigo-600 py-2 rounded-lg text-white"
            >
              {loading ? "Sending..." : "Send Invite Email"}
            </button>
          </>
        ) : (
          <>
            <div className="bg-green-900/30 p-3 rounded mb-3">
              Email sent successfully 🎉
            </div>

            <div className="bg-zinc-800 p-3 rounded flex gap-2">
              <input value={inviteLink} readOnly className="flex-1 bg-transparent text-white"/>
              <button onClick={handleCopyLink}>
                {copied ? <CheckCircle size={18}/> : <Copy size={18}/>}
              </button>
            </div>
          </>
        )}
      </motion.div>
    </motion.div>
  )
}

export default InviteTenant