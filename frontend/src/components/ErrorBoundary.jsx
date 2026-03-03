import React from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle } from 'lucide-react'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black flex items-center justify-center px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-md w-full bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl p-8 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </motion.div>

            <h1 className="text-2xl font-bold text-white mb-2">
              Something went wrong
            </h1>
            <p className="text-zinc-400 mb-6">
              We're sorry, but something unexpected happened. Please try refreshing the page.
            </p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                this.setState({ hasError: false, error: null })
                window.location.reload()
              }}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-6 rounded-lg transition-colors"
            >
              Refresh Page
            </motion.button>
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary