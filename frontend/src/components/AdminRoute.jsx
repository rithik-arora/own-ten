import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'

const AdminRoute = ({ children }) => {
  const { user, isAuthenticated, loading } = useAuth()

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

  if (!isAuthenticated) return <Navigate to="/login" replace />

  if (user?.role !== 'ADMIN') return <Navigate to="/dashboard" replace />

  return children
}

export default AdminRoute