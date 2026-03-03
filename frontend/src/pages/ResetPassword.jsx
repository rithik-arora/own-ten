import { useState } from 'react'
import axios from 'axios'
import toast from 'react-hot-toast'
import { useParams, useNavigate } from 'react-router-dom'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      await axios.post(`http://localhost:5000/api/auth/reset-password/${token}`, {
        password
      })

      toast.success('Password reset successful 🎉')

      setTimeout(() => {
        navigate('/login')
      }, 1500)

    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed')
    }

    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form onSubmit={submit} className="bg-zinc-900 p-8 rounded-lg w-96">

        <h2 className="text-xl mb-4">Reset Password</h2>

        <input
          type="password"
          placeholder="New password"
          className="w-full p-2 mb-4 bg-zinc-800"
          value={password}
          onChange={(e)=>setPassword(e.target.value)}
          required
        />

        <button className="w-full bg-indigo-600 py-2" disabled={loading}>
          {loading ? 'Updating...' : 'Reset Password'}
        </button>

      </form>
    </div>
  )
}

export default ResetPassword