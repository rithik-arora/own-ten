import express from 'express'
import multer from 'multer'

import {
  uploadEvidence,
  getEvidenceByDispute,
  streamEvidenceFile
} from '../controllers/evidence.controller.js'

import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()

/* ---------------------------
   MULTER CONFIG (MEMORY)
---------------------------- */

const storage = multer.memoryStorage()

const upload = multer({
  storage,

  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB max
  },

  fileFilter: (req, file, cb) => {
    const mimetype = file.mimetype || ''

    const isImage = mimetype.startsWith('image/')
    const isPdf = mimetype === 'application/pdf'
    const isVideoMp4 = mimetype === 'video/mp4'

    if (!isImage && !isPdf && !isVideoMp4) {
      return cb(new Error('Invalid file type'), false)
    }

    cb(null, true)
  }
})

/* ---------------------------
   ROUTES
---------------------------- */

// Upload evidence
router.post(
  '/upload',
  protect,
  upload.single('file'),
  uploadEvidence
)

// Stream (view / download) — MUST be before :id route
router.get(
  '/stream',
  protect,
  (req, res, next) => {
    // Disable browser cache for streams
    res.setHeader('Cache-Control', 'no-store')
    next()
  },
  streamEvidenceFile
)

// List evidence
router.get(
  '/:disputeId',
  protect,
  getEvidenceByDispute
)

export default router


