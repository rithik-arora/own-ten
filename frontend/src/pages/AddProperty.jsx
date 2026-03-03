import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { propertyService } from '../services/propertyService'
import { Home, MapPin, Building, DollarSign, Loader2 } from 'lucide-react'

const AddProperty = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    address: '',
    city: '',
    state: '',
    rentAmount: '',
    status: 'AVAILABLE'
  })
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState({})
  const [loading, setLoading] = useState(false)

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
    setLoading(true)

    try {
      const propertyData = {
        ...formData,
        rentAmount: parseFloat(formData.rentAmount)
      }

      await propertyService.createProperty(propertyData)
      navigate('/properties')
    } catch (err) {
      if (err.response?.data?.errors) {
        const errors = {}
        err.response.data.errors.forEach((error) => {
          errors[error.param || error.path] = error.msg
        })
        setValidationErrors(errors)
      }
      setError(err.response?.data?.message || 'Failed to create property')
    } finally {
      setLoading(false)
    }
  }

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 py-8 lg:py-12"
    >
      <div className="max-w-2xl mx-auto">
        {/* Header with icon */}
        <motion.div variants={itemVariants} className="mb-8 flex items-start gap-4">
          <div className="p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl">
            <Home className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Add New Property
            </h1>
            <p className="text-zinc-400 mt-1">Fill in the details to list your property</p>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          variants={itemVariants}
          className="bg-gradient-to-br from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-6 md:p-8 shadow-xl"
        >
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-900/50 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center gap-2"
            >
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
              {error}
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Address */}
            <motion.div variants={itemVariants}>
              <label htmlFor="address" className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-indigo-400" />
                Address *
              </label>
              <motion.input
                whileFocus={{ scale: 1.01, borderColor: '#6366f1' }}
                whileHover={{ borderColor: '#4f46e5' }}
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="123 Main Street"
              />
              {validationErrors.address && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm mt-1 flex items-center gap-1"
                >
                  <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                  {validationErrors.address}
                </motion.p>
              )}
            </motion.div>

            {/* City & State */}
            <div className="grid md:grid-cols-2 gap-4">
              <motion.div variants={itemVariants}>
                <label htmlFor="city" className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-400" />
                  City *
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01, borderColor: '#6366f1' }}
                  whileHover={{ borderColor: '#4f46e5' }}
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="New York"
                />
                {validationErrors.city && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-sm mt-1 flex items-center gap-1"
                  >
                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                    {validationErrors.city}
                  </motion.p>
                )}
              </motion.div>

              <motion.div variants={itemVariants}>
                <label htmlFor="state" className="block text-sm font-medium text-zinc-300 mb-2">
                  State *
                </label>
                <motion.input
                  whileFocus={{ scale: 1.01, borderColor: '#6366f1' }}
                  whileHover={{ borderColor: '#4f46e5' }}
                  type="text"
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  required
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="NY"
                />
                {validationErrors.state && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-sm mt-1 flex items-center gap-1"
                  >
                    <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                    {validationErrors.state}
                  </motion.p>
                )}
              </motion.div>
            </div>

            {/* Rent Amount */}
            <motion.div variants={itemVariants}>
              <label htmlFor="rentAmount" className="block text-sm font-medium text-zinc-300 mb-2 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-indigo-400" />
                Monthly Rent Amount *
              </label>
              <motion.input
                whileFocus={{ scale: 1.01, borderColor: '#6366f1' }}
                whileHover={{ borderColor: '#4f46e5' }}
                type="number"
                id="rentAmount"
                name="rentAmount"
                value={formData.rentAmount}
                onChange={handleChange}
                required
                min="0"
                step="0.01"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                placeholder="1500.00"
              />
              {validationErrors.rentAmount && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-red-400 text-sm mt-1 flex items-center gap-1"
                >
                  <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                  {validationErrors.rentAmount}
                </motion.p>
              )}
            </motion.div>

            {/* Status */}
            <motion.div variants={itemVariants}>
              <label htmlFor="status" className="block text-sm font-medium text-zinc-300 mb-2">
                Status
              </label>
              <motion.select
                whileFocus={{ scale: 1.01, borderColor: '#6366f1' }}
                whileHover={{ borderColor: '#4f46e5' }}
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="AVAILABLE">Available</option>
                <option value="OCCUPIED">Occupied</option>
                <option value="MAINTENANCE">Maintenance</option>
              </motion.select>
            </motion.div>

            {/* Buttons */}
            <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4 pt-4">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold py-3 px-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Property'
                )}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => navigate('/properties')}
                className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors border border-zinc-700"
              >
                Cancel
              </motion.button>
            </motion.div>
          </form>
        </motion.div>

        {/* Decorative element */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center text-xs text-zinc-600"
        >
          All fields marked with * are required
        </motion.div>
      </div>
    </motion.div>
  )
}

export default AddProperty