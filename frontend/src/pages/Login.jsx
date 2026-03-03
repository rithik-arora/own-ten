import { useState, useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Mail, Lock, LogIn, AlertCircle } from 'lucide-react'

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    if (isAuthenticated) {
      const redirect = searchParams.get('redirect') || '/dashboard'
      navigate(redirect)
    }
  }, [isAuthenticated, navigate, searchParams])

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await login(formData.email, formData.password)

    if (result.success) {
      const redirect = searchParams.get('redirect') || '/dashboard'
      const inviteToken = sessionStorage.getItem('inviteToken')

      if (inviteToken) {
        navigate(`/accept-invite/${inviteToken}`)
      } else {
        navigate(redirect)
      }
    } else {
      setError(result.message || 'Login failed')
    }

    setLoading(false)
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 opacity-20 pointer-events-none"></div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        className="max-w-md w-full"
      >
        <div className="bg-zinc-900/80 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 shadow-2xl">
          
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mx-auto mb-4 flex items-center justify-center"
            >
              <LogIn className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Welcome Back
            </h1>
            <p className="text-zinc-400 mt-2">Sign in to your account</p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-900/50 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center gap-2"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400" />
                Email
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="you@example.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400" />
                Password
              </label>
              <motion.input
                whileFocus={{ scale: 1.01 }}
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="••••••••"
              />

              {/* ✅ Forgot Password Link */}
              <div className="flex justify-end mt-2">
                <Link
                  to="/forgot-password"
                  className="text-sm text-indigo-400 hover:text-indigo-300 transition"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50"
            >
              {loading ? "Logging in..." : "Sign In"}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-zinc-400">
            Don't have an account?{' '}
            <Link
              to="/register"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Register here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login