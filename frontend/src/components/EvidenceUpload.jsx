import { useEffect, useMemo, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { evidenceService } from '../services/evidenceService'
import { Eye, Download, Upload, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

const prettySize = (bytes) => {
  if (!bytes && bytes !== 0) return ''
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let i = 0

  while (size >= 1024 && i < units.length - 1) {
    size /= 1024
    i++
  }

  return `${size.toFixed(i === 0 ? 0 : 1)} ${units[i]}`
}

const EvidenceUpload = ({ disputeId }) => {
  const inputRef = useRef(null)

  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [evidence, setEvidence] = useState([])
  const [loadingList, setLoadingList] = useState(true)

  // Match backend validation: image/*, application/pdf, video/mp4
  const acceptAttr = useMemo(() => '.jpg,.jpeg,.png,.pdf,.mp4', [])

  /* ==========================
     FETCH EVIDENCE
  ========================== */

  const fetchEvidence = async () => {
    try {
      setLoadingList(true)
      setError('')

      const res = await evidenceService.getEvidenceByDispute(disputeId)
      setEvidence(res.data.evidence || [])
    } catch {
      setError('Failed to load evidence')
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    if (disputeId) fetchEvidence()
  }, [disputeId])

  /* ==========================
     VIEW FILE (STABLE)
  ========================== */

  const handleView = async (url) => {
    try {
      setError('')

      const response = await evidenceService.streamEvidence({ url })

      if (!response.ok) {
        throw new Error('View failed')
      }

      const blob = await response.blob()

      const blobUrl = URL.createObjectURL(blob)

      // Let browser handle PDF/image/video inline
      window.open(blobUrl, '_blank', 'noopener')

      // DO NOT revoke immediately (PDF needs time)
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl)
      }, 5 * 60 * 1000) // 5 minutes safe window
    } catch (err) {
      console.error(err)
      setError('Failed to open file')
    }
  }

  /* ==========================
     DOWNLOAD FILE (STABLE)
  ========================== */

  const handleDownload = async (url, filename) => {
    try {
      setError('')

      const response = await evidenceService.streamEvidence({ url })

      if (!response.ok) {
        throw new Error('Download failed')
      }

      const blob = await response.blob()

      const blobUrl = URL.createObjectURL(blob)

      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename || 'file'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      URL.revokeObjectURL(blobUrl)
    } catch (err) {
      console.error(err)
      setError('Download failed')
    }
  }

  /* ==========================
     UPLOAD
  ========================== */

  const handleUpload = async (file) => {
    try {
      setError('')
      setSuccess('')
      setUploading(true)
      setProgress(0)

      await evidenceService.uploadEvidence({
        disputeId,
        file,
        onProgress: ({ percent }) => setProgress(percent)
      })

      setSuccess('Uploaded successfully')
      fetchEvidence()
    } catch {
      setError('Upload failed')
    } finally {
      setUploading(false)
      setTimeout(() => setSuccess(''), 2000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-zinc-900 border border-zinc-800 rounded-xl p-6"
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
          Evidence
        </h2>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => inputRef.current.click()}
          disabled={uploading}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg text-sm transition-colors disabled:opacity-50"
        >
          <Upload size={16} />
          {uploading ? 'Uploading...' : 'Upload'}
        </motion.button>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={acceptAttr}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) handleUpload(file)
          e.target.value = ''
        }}
      />

      {/* Upload Progress */}
      <AnimatePresence>
        {uploading && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
              <motion.div
                className="bg-indigo-500 h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error / Success */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-900/50 border border-red-800 text-red-300 px-3 py-2 rounded-lg mb-4 flex items-center gap-2 text-sm"
          >
            <AlertCircle size={16} />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-900/50 border border-green-800 text-green-300 px-3 py-2 rounded-lg mb-4 flex items-center gap-2 text-sm"
          >
            <CheckCircle size={16} />
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      <hr className="border-zinc-800 my-4" />

      {/* Evidence List */}
      {loadingList ? (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
        </div>
      ) : evidence.length === 0 ? (
        <p className="text-zinc-400 text-center py-4">No evidence uploaded</p>
      ) : (
        <div className="space-y-3">
          {evidence.map((ev, index) => (
            <motion.div
              key={ev._id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4 hover:bg-zinc-800 transition-colors"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <p className="font-medium text-white break-words">{ev.originalName}</p>
                  <p className="text-xs text-zinc-400 mt-1">
                    {ev.fileType?.toUpperCase()} • {prettySize(ev.size)}
                  </p>
                </div>

                <div className="flex gap-3 flex-shrink-0">
                  <button
                    onClick={() => handleView(ev.fileUrl)}
                    className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                  >
                    <Eye size={16} />
                    View
                  </button>
                  <a
                    href={ev.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    download
                    className="flex items-center gap-1 text-zinc-400 hover:text-white text-sm transition-colors"
                  >
                    <Download size={16} />
                    Download
                  </a>
                </div>
              </div>

              {/* Inline preview based on file type */}
              <div className="mt-3">
                {ev.fileType === 'image' && (
                  <img
                    src={ev.fileUrl}
                    alt={ev.originalName}
                    className="max-h-64 w-auto rounded-lg border border-zinc-800"
                  />
                )}
                {ev.fileType === 'pdf' && (
                  <iframe
                    src={ev.fileUrl}
                    title={ev.originalName}
                    className="w-full h-64 rounded-lg border border-zinc-800 bg-white"
                  />
                )}
                {ev.fileType === 'video' && (
                  <video
                    src={ev.fileUrl}
                    controls
                    className="w-full max-h-72 rounded-lg border border-zinc-800"
                  />
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

export default EvidenceUpload
