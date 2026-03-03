import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import JoinPropertyBox from '../components/JoinPropertyBox'
import PendingInvitations from '../components/PendingInvitations'

import {
  Home,
  Building2,
  FileWarning,
  PlusSquare,
  BarChart3,
  Mail,
  CalendarDays,
  User,
  ChevronRight
} from 'lucide-react'

const Dashboard = () => {
  const { user } = useAuth()

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
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

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-gradient-to-br from-[#0f172a] via-[#020617] to-black text-white p-4 sm:p-6 lg:p-8"
    >
      {/* Subtle noise texture */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBudW1PY3RhdmVzPSIzIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC4wNCIgLz48L3N2Zz4=')] opacity-20 pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* HEADER with role badge */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-10">
          <div>
            <h1 className="text-4xl lg:text-5xl font-bold tracking-tight">
              Welcome back,{' '}
              <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                {user?.name}
              </span>
            </h1>
            <p className="text-gray-400 mt-1 text-lg">
              Manage properties, payments and disputes
            </p>
          </div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-3 bg-white/5 backdrop-blur-sm px-5 py-2.5 rounded-2xl border border-white/10 self-start"
          >
            <User size={18} className="text-indigo-400" />
            <span className="text-sm font-medium">{user?.role}</span>
          </motion.div>
        </motion.div>

        {/* INFO CARDS */}
        <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-6 mb-10">
          <motion.div
            whileHover={{ y: -4, borderColor: '#6366f1' }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl transition-all"
          >
            <Mail className="mb-3 text-indigo-400" size={24} />
            <p className="text-gray-400 text-sm">Email</p>
            <p className="font-semibold text-lg">{user?.email}</p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4, borderColor: '#6366f1' }}
            className="bg-white/5 backdrop-blur-sm border border-white/10 p-6 rounded-2xl transition-all"
          >
            <CalendarDays className="mb-3 text-indigo-400" size={24} />
            <p className="text-gray-400 text-sm">Member Since</p>
            <p className="font-semibold text-lg">
              {new Date(user?.createdAt).toLocaleDateString()}
            </p>
          </motion.div>

          <motion.div
            whileHover={{ scale: 1.02 }}
            className="bg-gradient-to-br from-indigo-500 to-purple-600 p-6 rounded-2xl shadow-lg"
          >
            <p className="text-sm opacity-80">Role</p>
            <p className="text-3xl font-bold">{user?.role}</p>
          </motion.div>
        </motion.div>

        {/* QUICK ACTIONS */}
        <motion.div variants={itemVariants} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 mb-10">
          <h2 className="text-2xl font-semibold mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></span>
            Quick Actions
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <ActionCard
              to="/properties"
              icon={<Building2 size={24} />}
              title="Properties"
              desc="Manage your properties"
              color="from-blue-500 to-indigo-600"
            />

            <ActionCard
              to="/disputes"
              icon={<FileWarning size={24} />}
              title="Disputes"
              desc="Check active disputes"
              color="from-pink-500 to-red-600"
            />

            {user?.role === 'OWNER' && (
              <>
                <ActionCard
                  to="/properties/new"
                  icon={<PlusSquare size={24} />}
                  title="Add Property"
                  desc="Create new listing"
                  color="from-purple-500 to-indigo-600"
                />
                <ActionCard
                  to="/owner-dashboard"
                  icon={<BarChart3 size={24} />}
                  title="Analytics"
                  desc="View earnings & stats"
                  color="from-emerald-500 to-teal-600"
                />
              </>
            )}

            {/* If tenant, show placeholder to keep grid consistent */}
            {user?.role !== 'OWNER' && (
              <div className="lg:col-span-2"></div>
            )}
          </div>
        </motion.div>

        {/* TENANT SECTION */}
        {user?.role === 'TENANT' && (
          <motion.div variants={itemVariants} className="grid md:grid-cols-2 gap-6">
            <JoinPropertyBox />
            <PendingInvitations />
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

const ActionCard = ({ to, icon, title, desc, color }) => (
  <motion.div
    whileHover={{ scale: 1.03, y: -4 }}
    whileTap={{ scale: 0.98 }}
    variants={{
      hidden: { opacity: 0, y: 20 },
      visible: { opacity: 1, y: 0 }
    }}
  >
    <Link
      to={to}
      className={`block bg-gradient-to-br ${color} p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all`}
    >
      <div className="mb-4">{icon}</div>
      <h3 className="font-semibold text-lg mb-1">{title}</h3>
      <p className="text-sm opacity-90 flex items-center gap-1">
        {desc}
        <ChevronRight size={16} className="opacity-70 group-hover:translate-x-1 transition-transform" />
      </p>
    </Link>
  </motion.div>
)

export default Dashboard