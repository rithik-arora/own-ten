import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { adminService } from '../services/adminService'

const StatusPill = ({ status }) => {
  const cls = useMemo(() => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-900/30 text-blue-300 border border-blue-800'
      case 'IN_PROGRESS':
        return 'bg-yellow-900/30 text-yellow-300 border border-yellow-800'
      case 'ESCALATED':
        return 'bg-red-900/30 text-red-300 border border-red-800'
      case 'RESOLVED':
        return 'bg-green-900/30 text-green-300 border border-green-800'
      default:
        return 'bg-zinc-800 text-zinc-300 border border-zinc-700'
    }
  }, [status])

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${cls}`}>
      {status?.replace('_', ' ')}
    </span>
  )
}

const AdminDisputes = () => {
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(10)
  const [disputes, setDisputes] = useState([])
  const [pagination, setPagination] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [newStatus, setNewStatus] = useState('OPEN')
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)

  const load = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await adminService.getDisputes({ page, limit, status: status || undefined })
      setDisputes(response.data.disputes || [])
      setPagination(response.data.pagination)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load disputes')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, status])

  const openModal = (dispute) => {
    setSelected(dispute)
    setNewStatus(dispute.status)
    setNote('')
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setSelected(null)
    setNote('')
  }

  const confirmForceStatus = async () => {
    if (!selected) return
    if (!note.trim() || note.trim().length < 3) {
      setError('Please provide an override reason (min 3 characters)')
      return
    }

    try {
      setSaving(true)
      setError('')
      await adminService.forceDisputeStatus(selected._id, newStatus, note.trim())
      setDisputes((prev) => prev.map((d) => (d._id === selected._id ? { ...d, status: newStatus } : d)))
      closeModal()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to force status')
    } finally {
      setSaving(false)
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
          <AlertCircle className="w-5 h-5" />
          {error}
        </motion.div>
      )}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
        <div>
          <p className="text-lg font-semibold text-white">Dispute Moderation</p>
          <p className="text-sm text-zinc-400">Force status with a required reason</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-zinc-400">Status</label>
          <select
            value={status}
            onChange={(e) => {
              setPage(1)
              setStatus(e.target.value)
            }}
            className="bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All</option>
            <option value="OPEN">OPEN</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="ESCALATED">ESCALATED</option>
            <option value="RESOLVED">RESOLVED</option>
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {disputes.length === 0 ? (
          <div className="py-6 text-center text-sm text-zinc-400">No disputes found</div>
        ) : (
          disputes.map((d, index) => (
            <motion.div
              key={d._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="border border-zinc-800 rounded-lg p-4 bg-zinc-900 hover:bg-zinc-800 transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-white">{d.title}</h3>
                    <StatusPill status={d.status} />
                  </div>
                  <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{d.description}</p>
                  <div className="text-sm text-zinc-500 mt-2">
                    <span className="font-semibold text-zinc-300">Property:</span> {d.propertyId?.address || 'N/A'} •{' '}
                    <span className="font-semibold text-zinc-300">Created By:</span> {d.createdBy?.name || 'N/A'} •{' '}
                    <span className="font-semibold text-zinc-300">Against:</span> {d.againstUser?.name || 'N/A'}
                  </div>
                </div>

                <div className="flex gap-2 md:flex-col md:items-end">
                  <Link
                    to={`/disputes/${d._id}`}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-1.5 px-3 rounded-lg text-sm transition-colors border border-zinc-700"
                  >
                    View
                  </Link>
                  <button
                    onClick={() => openModal(d)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-1.5 px-3 rounded-lg text-sm transition-colors"
                  >
                    Force Status
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
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

      {/* Confirmation Modal */}
      <AnimatePresence>
        {modalOpen && selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-zinc-900 border border-zinc-800 rounded-xl shadow-xl w-full max-w-lg"
            >
              <div className="px-5 py-4 border-b border-zinc-800">
                <p className="text-lg font-semibold text-white">Confirm Admin Override</p>
                <p className="text-sm text-zinc-400 mt-1">
                  Dispute: <span className="font-semibold text-white">{selected.title}</span>
                </p>
              </div>
              <div className="px-5 py-4 space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-1">New Status</label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="OPEN">OPEN</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="ESCALATED">ESCALATED</option>
                    <option value="RESOLVED">RESOLVED</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-zinc-300 mb-1">Override Reason</label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    rows={4}
                    maxLength={500}
                    placeholder="Why are you overriding the status?"
                  />
                  <p className="text-xs text-zinc-500 mt-1">{note.length}/500</p>
                </div>
              </div>
              <div className="px-5 py-4 border-t border-zinc-800 flex justify-end gap-2">
                <button
                  className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors border border-zinc-700"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
                  onClick={confirmForceStatus}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Confirm Override'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default AdminDisputes