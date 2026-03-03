import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { adminService } from '../services/adminService'

const AdminUsers = () => {
  const [role, setRole] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [users, setUsers] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [updatingId, setUpdatingId] = useState(null)

  const load = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await adminService.getUsers({ page, limit, role: role || undefined })
      setUsers(response.data.users || [])
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, role])

  const toggleStatus = async (user) => {
    const nextStatus = !user.isActive
    const ok = window.confirm(`Are you sure you want to ${nextStatus ? 'unblock' : 'block'} this user?`)
    if (!ok) return

    try {
      setUpdatingId(user._id)
      await adminService.updateUserStatus(user._id, nextStatus)
      setUsers((prev) => prev.map((u) => (u._id === user._id ? { ...u, isActive: nextStatus } : u)))
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update user status')
    } finally {
      setUpdatingId(null)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-10">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  return (
    <div className="bg-black text-white">
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-900/50 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-4 text-sm flex items-center gap-2"
        >
          <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
          {error}
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <p className="text-lg font-semibold text-white">User Management</p>
          <p className="text-sm text-zinc-400">Block / Unblock accounts</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-400">Role</label>
          <select
            value={role}
            onChange={(e) => {
              setPage(1)
              setRole(e.target.value)
            }}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All</option>
            <option value="OWNER">OWNER</option>
            <option value="TENANT">TENANT</option>
            <option value="ADMIN">ADMIN</option>
          </select>
        </div>
      </div>

      <div className="overflow-x-auto border border-zinc-800 rounded-lg">
        <table className="min-w-full bg-zinc-900">
          <thead className="bg-zinc-800">
            <tr>
              <th className="text-left text-xs font-semibold text-zinc-300 px-4 py-3">Name</th>
              <th className="text-left text-xs font-semibold text-zinc-300 px-4 py-3">Email</th>
              <th className="text-left text-xs font-semibold text-zinc-300 px-4 py-3">Role</th>
              <th className="text-left text-xs font-semibold text-zinc-300 px-4 py-3">Status</th>
              <th className="text-right text-xs font-semibold text-zinc-300 px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            <AnimatePresence>
              {users.map((u, index) => (
                <motion.tr
                  key={u._id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-zinc-800/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-white font-medium">{u.name}</td>
                  <td className="px-4 py-3 text-sm text-zinc-300">{u.email}</td>
                  <td className="px-4 py-3 text-sm">
                    <span className="px-2 py-0.5 rounded bg-indigo-900/30 text-indigo-300 border border-indigo-800 text-xs font-semibold">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    {u.isActive ? (
                      <span className="px-2 py-0.5 rounded bg-green-900/30 text-green-300 border border-green-800 text-xs font-semibold">
                        ACTIVE
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded bg-red-900/30 text-red-300 border border-red-800 text-xs font-semibold">
                        BLOCKED
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => toggleStatus(u)}
                      disabled={updatingId === u._id}
                      className={`text-sm font-semibold px-3 py-1.5 rounded-lg transition-colors ${
                        u.isActive
                          ? 'bg-red-600 hover:bg-red-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      } disabled:opacity-50`}
                    >
                      {updatingId === u._id ? '...' : u.isActive ? 'Block' : 'Unblock'}
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {pagination && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-zinc-400">
            Page {pagination.page} of {pagination.pages} • Total {pagination.total}
          </p>
          <div className="flex gap-2">
            <button
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-1.5 px-3 rounded-lg text-sm transition-colors border border-zinc-700 disabled:opacity-50"
              disabled={pagination.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Prev
            </button>
            <button
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-1.5 px-3 rounded-lg text-sm transition-colors border border-zinc-700 disabled:opacity-50"
              disabled={pagination.page >= pagination.pages}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminUsers