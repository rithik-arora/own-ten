import { useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email })

      // 🔥 ALWAYS SAME MESSAGE (security)
      setMsg('If this email exists, a reset link has been sent.')

    } catch (err) {
      setMsg('Something went wrong. Try again.')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={submit} className="bg-zinc-900 p-8 rounded-lg w-96">
        
        <h2 className="text-xl mb-4">Forgot Password</h2>

        <input
          type="email"
          placeholder="Enter email"
          className="w-full p-2 mb-4 bg-zinc-800"
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
        />

        <button
          className="w-full bg-indigo-600 py-2"
          disabled={loading}
        >
          {loading ? 'Sending...' : 'Send Reset Link'}
        </button>

        {msg && (
          <div className="mt-4 text-green-400 text-sm">
            {msg}
          </div>
        )}

        <Link to="/login" className="text-indigo-400 text-sm block mt-4">
          Back to login
        </Link>

      </form>
    </div>
  )
}

export default ForgotPassword