import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { adminService } from '../services/adminService'
import { analyticsService } from '../services/analyticsService'
import AdminUsers from '../components/AdminUsers'
import AdminDisputes from '../components/AdminDisputes'

import {
  Chart as ChartJS,
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js'

import { Bar, Line, Pie } from 'react-chartjs-2'

ChartJS.register(
  BarElement,
  LineElement,
  ArcElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
)

const AdminDashboard = () => {
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('users')

  useEffect(() => {
    const load = async () => {
      try {
        const statsRes = await adminService.getStats()
        const analyticsRes = await analyticsService.getAdminAnalytics()

        setStats(statsRes.data)
        setAnalytics(analyticsRes.data)
      } catch (err) {
        console.log(err)
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

  /* ================= CHART DATA ================= */
  const monthLabels =
    analytics?.disputesPerMonth?.map(m => `${m.month}/${m.year}`) || []

  const disputeCounts =
    analytics?.disputesPerMonth?.map(m => m.count) || []

  // Chart options for dark background
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#e5e7eb' } // zinc-300
      },
      tooltip: {
        backgroundColor: '#1f1f1f',
        titleColor: '#fff',
        bodyColor: '#d4d4d8'
      }
    },
    scales: {
      x: {
        ticks: { color: '#a1a1aa' }, // zinc-400
        grid: { color: '#3f3f46' } // zinc-700
      },
      y: {
        ticks: { color: '#a1a1aa' },
        grid: { color: '#3f3f46' }
      }
    }
  }

  const disputeBarData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Disputes',
        data: disputeCounts,
        backgroundColor: '#6366f1', // indigo-500
        borderRadius: 6
      }
    ]
  }

  const disputeLineData = {
    labels: monthLabels,
    datasets: [
      {
        label: 'Disputes Trend',
        data: disputeCounts,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        tension: 0.4,
        fill: true
      }
    ]
  }

  const pieData = {
    labels: ['Active', 'Resolved'],
    datasets: [
      {
        data: [
          analytics?.activeDisputes || 0,
          analytics?.resolvedDisputes || 0
        ],
        backgroundColor: ['#f59e0b', '#10b981']
      }
    ]
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Subtle noise texture */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBudW1PY3RhdmVzPSIzIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC4wNCIgLz48L3N2Zz4=')] opacity-20 pointer-events-none"></div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-7xl mx-auto relative z-10 space-y-8"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
          <p className="text-zinc-400 mt-1">Overview and management</p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard title="Total Users" value={stats?.totalUsers || 0} />
          <StatCard title="Properties" value={stats?.totalProperties || 0} />
          <StatCard title="Total Disputes" value={stats?.totalDisputes || 0} />
          <StatCard title="Open Disputes" value={stats?.openDisputes || 0} />
        </motion.div>

        {/* Analytics Charts */}
        <motion.div variants={itemVariants} className="grid lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
              Disputes Per Month
            </h2>
            <div className="h-64">
              <Bar data={disputeBarData} options={chartOptions} />
            </div>
          </div>

          {/* Line Chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
              Dispute Trend
            </h2>
            <div className="h-64">
              <Line data={disputeLineData} options={chartOptions} />
            </div>
          </div>

          {/* Pie Chart */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
              Dispute Status
            </h2>
            <div className="h-64 flex items-center justify-center">
              <Pie data={pieData} options={chartOptions} />
            </div>
          </div>

          {/* Quick Analytics */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
              Quick Analytics
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-4 bg-zinc-800 rounded-lg">
                <span className="text-zinc-400">Active Disputes</span>
                <span className="text-2xl font-bold text-yellow-400">{analytics?.activeDisputes}</span>
              </div>
              <div className="flex justify-between items-center p-4 bg-zinc-800 rounded-lg">
                <span className="text-zinc-400">Resolved Disputes</span>
                <span className="text-2xl font-bold text-green-400">{analytics?.resolvedDisputes}</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs Section */}
        <motion.div variants={itemVariants} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
          <div className="flex gap-3 mb-6">
            <TabButton active={tab === 'users'} onClick={() => setTab('users')}>
              Users
            </TabButton>
            <TabButton active={tab === 'disputes'} onClick={() => setTab('disputes')}>
              Disputes
            </TabButton>
          </div>

          <div className="mt-4">
            {tab === 'users' ? <AdminUsers /> : <AdminDisputes />}
          </div>
        </motion.div>
      </motion.div>
    </div>
  )
}

// Stat Card Component
const StatCard = ({ title, value }) => (
  <motion.div
    whileHover={{ y: -4, borderColor: '#6366f1' }}
    className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 transition-all"
  >
    <p className="text-zinc-400 text-sm">{title}</p>
    <p className="text-3xl font-bold text-white mt-2">{value}</p>
  </motion.div>
)

// Tab Button Component
const TabButton = ({ active, onClick, children }) => (
  <motion.button
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`px-5 py-2 rounded-lg font-medium transition-colors ${
      active
        ? 'bg-indigo-600 text-white'
        : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
    }`}
  >
    {children}
  </motion.button>
)

export default AdminDashboard