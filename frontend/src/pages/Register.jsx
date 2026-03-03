import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  UserPlus,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'TENANT'
  })
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
    setValidationErrors({})
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setValidationErrors({})

    // Client-side validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }

    setLoading(true)

    const result = await register(
      formData.name,
      formData.email,
      formData.password,
      formData.role
    )

    if (result.success) {
      const redirect = searchParams.get('redirect') || '/dashboard'
      // Check for invite token in sessionStorage
      const inviteToken = sessionStorage.getItem('inviteToken')
      if (inviteToken) {
        navigate(`/accept-invite/${inviteToken}`)
      } else {
        navigate(redirect)
      }
    } else {
      if (result.errors) {
        const errors = {}
        result.errors.forEach((err) => {
          errors[err.param] = err.msg
        })
        setValidationErrors(errors)
      }
      setError(result.message || 'Registration failed')
    }

    setLoading(false)
  }

  // Animation variants
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
      {/* Subtle noise texture */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBudW1PY3RhdmVzPSIzIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC4wNCIgLz48L3N2Zz4=')] opacity-20 pointer-events-none"></div>

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
              <UserPlus className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Create Account
            </h1>
            <p className="text-zinc-400 mt-2">Join our platform today</p>
          </div>

          {/* Error message */}
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
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                Name
              </label>
              <motion.input
                whileFocus={{ scale: 1.01, borderColor: '#6366f1' }}
                whileHover={{ borderColor: '#4f46e5' }}
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="John Doe"
              />
              {validationErrors.name && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm mt-1 flex items-center gap-1"
                >
                  <AlertCircle size={14} />
                  {validationErrors.name}
                </motion.p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4 text-indigo-400" />
                Email
              </label>
              <motion.input
                whileFocus={{ scale: 1.01, borderColor: '#6366f1' }}
                whileHover={{ borderColor: '#4f46e5' }}
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="you@example.com"
              />
              {validationErrors.email && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm mt-1 flex items-center gap-1"
                >
                  <AlertCircle size={14} />
                  {validationErrors.email}
                </motion.p>
              )}
            </div>

            {/* Role */}
            <div>
              <label htmlFor="role" className="block text-sm font-medium text-zinc-300 mb-2">
                Role
              </label>
              <motion.select
                whileFocus={{ scale: 1.01, borderColor: '#6366f1' }}
                whileHover={{ borderColor: '#4f46e5' }}
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="TENANT">Tenant</option>
                <option value="OWNER">Owner</option>
                <option value="ADMIN">Admin</option>
              </motion.select>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-indigo-400" />
                Password
              </label>
              <div className="relative">
                <motion.input
                  whileFocus={{ scale: 1.01, borderColor: '#6366f1' }}
                  whileHover={{ borderColor: '#4f46e5' }}
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {validationErrors.password && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm mt-1 flex items-center gap-1"
                >
                  <AlertCircle size={14} />
                  {validationErrors.password}
                </motion.p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-indigo-400" />
                Confirm Password
              </label>
              <div className="relative">
                <motion.input
                  whileFocus={{ scale: 1.01, borderColor: '#6366f1' }}
                  whileHover={{ borderColor: '#4f46e5' }}
                  type={showConfirmPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all pr-10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-white"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Registering...
                </>
              ) : (
                'Create Account'
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <p className="mt-6 text-center text-zinc-400">
            Already have an account?{' '}
            <Link
              to="/login"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Register