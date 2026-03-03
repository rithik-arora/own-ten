import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { disputeService } from '../services/disputeService'
import { propertyService } from '../services/propertyService'
import { AlertCircle, Loader2 } from 'lucide-react'

const CreateDispute = () => {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [formData, setFormData] = useState({
    propertyId: '',
    title: '',
    description: '',
    category: 'OTHER',
    priority: 'MEDIUM'
  })

  const [properties, setProperties] = useState([])
  const [loading, setLoading] = useState(false)
  const [loadingProperties, setLoadingProperties] = useState(true)
  const [error, setError] = useState('')
  const [validationErrors, setValidationErrors] = useState({})

  useEffect(() => {
    fetchProperties()
  }, [])

  const fetchProperties = async () => {
  try {
    setLoadingProperties(true)

    const response = await propertyService.getProperties()
    console.log("PROPERTY RESPONSE:", response)

    // backend returns: { success:true, properties:[...] }
    const allProperties = response.properties || []

    let availableProperties = []

    if (user?.role === "TENANT") {
      // tenantId is STRING not object
      availableProperties = allProperties.filter(
        (p) => p.tenantId === user.id
      )
    }

    if (user?.role === "OWNER") {
      availableProperties = allProperties.filter(
        (p) => p.ownerId === user.id && p.tenantId
      )
    }

    setProperties(availableProperties)

    if (availableProperties.length === 0) {
      setError(
        user?.role === "TENANT"
          ? "You must be assigned to a property first"
          : "You need a property with tenant assigned"
      )
    }
  } catch (err) {
    console.error(err)
    setError("Failed to fetch properties")
  } finally {
    setLoadingProperties(false)
  }
}

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
    setLoading(true)
    setError('')

    try {
      await disputeService.createDispute(formData)
      navigate('/disputes')
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create dispute')
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
      transition: { duration: 0.5 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  }

  if (loadingProperties) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white px-4 py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl mx-auto"
      >
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Create Dispute
        </h1>

        {error && (
          <motion.div
            variants={itemVariants}
            className="bg-red-900/50 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-6 flex items-center gap-2"
          >
            <AlertCircle size={18} />
            {error}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-5">
          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Select Property
            </label>
            <select
              name="propertyId"
              value={formData.propertyId}
              onChange={handleChange}
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Select property</option>
              {properties.map(p => (
                <option key={p._id} value={p._id}>
                  {p.address} - {p.city}
                </option>
              ))}
            </select>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Title</label>
            <input
              name="title"
              placeholder="Enter dispute title"
              value={formData.title}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Description</label>
            <textarea
              name="description"
              placeholder="Describe the dispute in detail"
              value={formData.description}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              rows={4}
              required
            />
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="MAINTENANCE">Maintenance</option>
              <option value="PAYMENT">Payment</option>
              <option value="BEHAVIOR">Behavior</option>
              <option value="LEASE_VIOLATION">Lease Violation</option>
              <option value="OTHER">Other</option>
            </select>
          </motion.div>

          <motion.div variants={itemVariants}>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Priority</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </motion.div>

          <motion.button
            variants={itemVariants}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Creating...
              </>
            ) : (
              'Create Dispute'
            )}
          </motion.button>
        </form>
      </motion.div>
    </div>
  )
}

export default CreateDispute