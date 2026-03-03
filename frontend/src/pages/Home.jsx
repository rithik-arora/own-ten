import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { Home as HomeIcon, Users, Scale } from 'lucide-react'

const Home = () => {
  const { isAuthenticated } = useAuth()

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 }
    }
  }

  const heroVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.6 }
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Subtle noise texture */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJmIj48ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iLjc0IiBudW1PY3RhdmVzPSIzIiAvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNmKSIgb3BhY2l0eT0iMC4wNCIgLz48L3N2Zz4=')] opacity-20 pointer-events-none"></div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="space-y-20"
        >
          {/* Hero Section */}
          <motion.div variants={heroVariants} className="relative">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/30 via-purple-900/20 to-pink-900/30 rounded-3xl blur-3xl"></div>
            
            <div className="relative bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">
              {/* Grid overlay */}
              <div className="absolute inset-0 bg-grid-white/5 [mask-image:linear-gradient(0deg,transparent,black)]"></div>
              
              <div className="relative text-center py-20 md:py-28 px-4">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-4xl md:text-6xl font-extrabold mb-6"
                >
                  <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Owner-Tenant Dispute Resolution
                  </span>
                </motion.h1>
                
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-xl md:text-2xl text-zinc-400 max-w-3xl mx-auto mb-10 leading-relaxed"
                >
                  A modern platform for resolving disputes between property owners and tenants
                </motion.p>
                
                {!isAuthenticated && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-col sm:flex-row justify-center gap-4"
                  >
                    <Link
                      to="/register"
                      className="group inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-full bg-indigo-600 text-white hover:bg-indigo-700 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-indigo-500/25"
                    >
                      Get Started
                      <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                    </Link>
                    <Link
                      to="/login"
                      className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold rounded-full bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700 hover:scale-105 transition-all duration-300"
                    >
                      Sign In
                    </Link>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Features Section */}
          <motion.div variants={itemVariants} className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<HomeIcon size={32} className="text-indigo-400" />}
              title="For Owners"
              description="Manage your properties and resolve disputes efficiently with our platform."
              delay={0.5}
            />
            <FeatureCard
              icon={<Users size={32} className="text-purple-400" />}
              title="For Tenants"
              description="Report issues and communicate with your property owner seamlessly."
              delay={0.6}
            />
            <FeatureCard
              icon={<Scale size={32} className="text-pink-400" />}
              title="Fair Resolution"
              description="Transparent dispute resolution process with admin oversight."
              delay={0.7}
            />
          </motion.div>

          {/* Stats Section (optional, adds credibility) */}
          <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <StatCard value="500+" label="Disputes Resolved" />
            <StatCard value="1000+" label="Properties" />
            <StatCard value="24/7" label="Support" />
            <StatCard value="98%" label="Satisfaction" />
          </motion.div>
        </motion.div>
      </div>
    </div>
  )
}

const FeatureCard = ({ icon, title, description, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ y: -8, borderColor: '#6366f1' }}
    className="group bg-zinc-900/50 backdrop-blur-sm border border-zinc-800 rounded-2xl p-8 hover:bg-zinc-800/50 transition-all duration-300"
  >
    <div className="w-14 h-14 bg-indigo-500/10 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-2xl font-bold text-white mb-3">{title}</h3>
    <p className="text-zinc-400 leading-relaxed">{description}</p>
  </motion.div>
)

const StatCard = ({ value, label }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className="text-center p-6 bg-zinc-900/30 border border-zinc-800 rounded-xl"
  >
    <div className="text-2xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
      {value}
    </div>
    <div className="text-sm text-zinc-500 mt-1">{label}</div>
  </motion.div>
)

export default Home