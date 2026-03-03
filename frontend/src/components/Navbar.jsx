import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import NotificationBell from './NotificationBell'

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="bg-black border-b border-zinc-800 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="text-2xl font-bold">
            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Own-Ten
            </span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center space-x-1 sm:space-x-4">
            {isAuthenticated ? (
              <>
                <NavLink to="/dashboard">Dashboard</NavLink>
                <NavLink to="/properties">Properties</NavLink>
                <NavLink to="/disputes">Disputes</NavLink>
                {user?.role === 'ADMIN' && (
                  <NavLink to="/admin">Admin</NavLink>
                )}
                <NotificationBell />
                <div className="flex items-center space-x-3 ml-2">
                  <span className="text-sm text-zinc-400 hidden md:inline-block">
                    {user?.name} ({user?.role})
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleLogout}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-1.5 px-3 rounded-lg text-sm transition-colors border border-zinc-700"
                  >
                    Logout
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                <NavLink to="/login">Login</NavLink>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Link
                    to="/register"
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1.5 px-4 rounded-lg text-sm transition-colors"
                  >
                    Register
                  </Link>
                </motion.div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

// NavLink component for consistent styling and animations
const NavLink = ({ to, children }) => (
  <motion.div whileHover={{ y: -2 }} whileTap={{ y: 0 }}>
    <Link
      to={to}
      className="text-zinc-300 hover:text-indigo-400 transition-colors px-2 py-1 text-sm sm:text-base"
    >
      {children}
    </Link>
  </motion.div>
)

export default Navbar