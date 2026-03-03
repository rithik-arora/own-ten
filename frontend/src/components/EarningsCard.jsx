import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { paymentService } from '../services/paymentService'

const EarningsCard = () => {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')

        const res = await paymentService.getOwnerPayments()

        // ✅ CORRECT
        setData(res.data)

      } catch (err) {
        console.log("EARNINGS ERROR:", err)
        setError(err.response?.data?.message || 'Failed to load earnings')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Earnings
        </h2>
        <div className="flex justify-center items-center py-4">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        </div>
      </motion.div>
    )
  }

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Earnings
        </h2>
        <div className="bg-red-900/50 border border-red-800 text-red-300 px-4 py-3 rounded-lg flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          <p className="text-sm">{error}</p>
        </div>
      </motion.div>
    )
  }

  if (!data) return null

  const { totalEarned, recentPayments } = data

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
    >
      <h2 className="text-xl font-semibold mb-4 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
        Earnings
      </h2>

      {/* TOTAL */}
      <div className="mb-6">
        <p className="text-sm text-zinc-400">Total Earned</p>
        <p className="text-4xl font-bold text-indigo-400">
          ₹{Number(totalEarned || 0).toLocaleString()}
        </p>
      </div>

      {/* RECENT PAYMENTS */}
      <div>
        <p className="text-sm font-semibold text-white mb-3">Recent Payments</p>

        {!recentPayments?.length ? (
          <p className="text-sm text-zinc-500">No payments yet</p>
        ) : (
          <ul className="space-y-3">
            {recentPayments.map((p, index) => (
              <motion.li
                key={p._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex justify-between items-center p-3 bg-zinc-800/50 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <div>
                  <p className="font-semibold text-indigo-400">
                    ₹{Number(p.amount).toLocaleString()}
                  </p>
                  <p className="text-sm text-zinc-400">
                    {p.propertyId?.address || 'Property'}
                  </p>
                </div>
                <span className="text-sm text-zinc-500">
                  {new Date(p.createdAt).toLocaleDateString()}
                </span>
              </motion.li>
            ))}
          </ul>
        )}
      </div>
    </motion.div>
  )
}

export default EarningsCard