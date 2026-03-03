import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { analyticsService } from '../services/analyticsService'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell
} from 'recharts'
import {
  TrendingUp, AlertCircle, CheckCircle, Flame,
  Calendar, DollarSign
} from 'lucide-react'

import EarningsCard from '../components/EarningsCard'

const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b']

const OwnerDashboard = () => {
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const res = await analyticsService.getOwnerAnalytics()

        // SAFE PARSE → prevents blank screen
        const apiData = res?.data?.data || res?.data || res
        setAnalytics(apiData)

      } catch (err) {
        console.log("ANALYTICS ERROR:", err)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

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

  if (!analytics) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-zinc-400">No analytics data available</div>
      </div>
    )
  }

  const {
    totalDisputes = 0,
    openDisputes = 0,
    resolvedDisputes = 0,
    escalatedDisputes = 0,
    avgResolutionTime = 0,
    disputesPerMonth = [],
    disputesByStatus = []
  } = analytics

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Subtle noise texture */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBudW1PY3RhdmVzPSIzIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC4wNCIgLz48L3N2Zz4=')] opacity-20 pointer-events-none"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto space-y-8 relative z-10"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Owner Dashboard
          </h1>
          <p className="text-zinc-400 mt-1">Analytics and insights for your properties</p>
        </motion.div>

        {/* Earnings Card */}
        <motion.div variants={itemVariants}>
          <EarningsCard />
        </motion.div>

        {/* Stats Grid */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<TrendingUp className="text-indigo-400" size={24} />}
            label="Total Disputes"
            value={totalDisputes}
          />
          <StatCard
            icon={<AlertCircle className="text-yellow-400" size={24} />}
            label="Open"
            value={openDisputes}
          />
          <StatCard
            icon={<CheckCircle className="text-green-400" size={24} />}
            label="Resolved"
            value={resolvedDisputes}
          />
          <StatCard
            icon={<Calendar className="text-purple-400" size={24} />}
            label="Avg Days"
            value={avgResolutionTime || '-'}
          />
        </motion.div>

        {/* Charts */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
              Disputes Per Month
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={disputesPerMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="month" stroke="#888" tick={{ fill: '#888' }} />
                <YAxis stroke="#888" tick={{ fill: '#888' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#333', color: '#fff' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[6,6,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Pie Chart */}
          <motion.div variants={itemVariants} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
              Status Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={disputesByStatus}
                  dataKey="count"
                  nameKey="status"
                  outerRadius={100}
                  label={(entry) => entry.status}
                  labelLine={{ stroke: '#888' }}
                >
                  {disputesByStatus.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f1f1f', borderColor: '#333', color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

const StatCard = ({ icon, label, value }) => (
  <motion.div
    whileHover={{ y: -4, borderColor: '#6366f1' }}
    className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 transition-all"
  >
    <div className="flex items-start justify-between">
      <div>
        <p className="text-zinc-400 text-sm">{label}</p>
        <p className="text-3xl font-bold text-white mt-1">{value}</p>
      </div>
      <div className="p-2 bg-zinc-800 rounded-lg">{icon}</div>
    </div>
  </motion.div>
)

export default OwnerDashboard