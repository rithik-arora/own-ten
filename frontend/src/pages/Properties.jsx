import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { propertyService } from '../services/propertyService'

const Properties = () => {
  const { user } = useAuth()

  const [myProperties, setMyProperties] = useState([])
  const [publicProperties, setPublicProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) fetchProperties()
  }, [user])

  const fetchProperties = async () => {
    try {
      setLoading(true)

      if (user.role === 'TENANT') {
        const myRes = await propertyService.getProperties()
        setMyProperties(myRes.properties || [])

        const publicRes = await propertyService.getPublicProperties()
        setPublicProperties(publicRes.data?.properties || [])
      } else {
        const res = await propertyService.getProperties()
        setMyProperties(res.properties || [])
      }
    } finally {
      setLoading(false)
    }
  }

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

  const PropertyCard = (property) => (
    <motion.div
      key={property._id}
      variants={itemVariants}
      whileHover={{ y: -8, borderColor: '#6366f1' }}
      className="group bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden hover:bg-zinc-800 transition-all duration-300"
    >
      {property.images?.length > 0 && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={property.images[0].url}
            alt="Property"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        </div>
      )}
      <div className="p-5">
        <h3 className="text-lg font-semibold text-white mb-1 line-clamp-1">
          {property.address}
        </h3>
        <p className="text-zinc-400 text-sm mb-2">
          {property.city}, {property.state}
        </p>
        <p className="text-indigo-400 font-bold text-xl mb-4">
          ₹{property.rentAmount.toLocaleString()}
          <span className="text-sm font-normal text-zinc-500">/month</span>
        </p>
        <Link
          to={`/properties/${property._id}`}
          className="inline-block w-full text-center bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition-colors"
        >
          View Details
        </Link>
      </div>
    </motion.div>
  )

  return (
    <div className="min-h-screen bg-black text-white px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      {/* Subtle noise texture */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBudW1PY3RhdmVzPSIzIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC4wNCIgLz48L3N2Zz4=')] opacity-20 pointer-events-none"></div>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-7xl mx-auto relative z-10"
      >
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Properties
        </h1>

        {/* OWNER / ADMIN */}
        {(user.role === 'OWNER' || user.role === 'ADMIN') && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {myProperties.map(PropertyCard)}
          </motion.div>
        )}

        {/* TENANT */}
        {user.role === 'TENANT' && (
          <>
            {myProperties.length > 0 && (
              <>
                <motion.h2
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-2xl font-semibold text-white mb-4"
                >
                  My Property
                </motion.h2>
                <motion.div
                  variants={containerVariants}
                  initial="hidden"
                  animate="visible"
                  className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10"
                >
                  {myProperties.map(PropertyCard)}
                </motion.div>
              </>
            )}

            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="text-2xl font-semibold text-white mb-4"
            >
              Available Properties
            </motion.h2>
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {publicProperties.map(PropertyCard)}
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  )
}

export default Properties