import express from 'express'
import { body } from 'express-validator'
import multer from 'multer'

import {
  createProperty,
  getProperties,
  getPublicProperties,
  getProperty,
  updateProperty,
  deleteProperty,
  removeTenant,
  leaveProperty,
  uploadPropertyImage
} from '../controllers/property.controller.js'

import {
  createInvitation,
  joinWithToken
} from '../controllers/invitation.controller.js'

import { protect, authorize } from '../middleware/auth.middleware.js'
import { cache } from '../middleware/cache.middleware.js'

const router = express.Router()

/* =====================================================
   MULTER CONFIG
===================================================== */
const upload = multer({
  dest: 'uploads/' // temp folder before cloudinary upload
})

/* =====================================================
   VALIDATION
===================================================== */
const propertyValidation = [
  body('address').trim().notEmpty().withMessage('Address is required'),
  body('city').trim().notEmpty().withMessage('City is required'),
  body('state').trim().notEmpty().withMessage('State is required'),
  body('rentAmount')
    .isFloat({ min: 0 })
    .withMessage('Rent amount must be a positive number'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  body('status')
    .optional()
    .isIn(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE'])
    .withMessage('Invalid status')
]

/* =====================================================
   AUTH
===================================================== */
router.use(protect)

/* =====================================================
   CREATE PROPERTY
===================================================== */
router.post(
  '/',
  authorize('OWNER', 'ADMIN'),
  propertyValidation,
  createProperty
)

/* =====================================================
   GET PROPERTIES
===================================================== */
// Owner / tenant properties (authenticated) - cache for 30 seconds
router.get('/', cache('properties', 30), getProperties)

/* =====================================================
   PUBLIC PROPERTIES (TENANT)
===================================================== */
// Public properties list - cache for 60 seconds
router.get('/public', authorize('TENANT'), cache('public', 60), getPublicProperties)

/* =====================================================
   UPLOAD PROPERTY IMAGE 🔥
===================================================== */
router.post(
  '/:id/upload-image',
  authorize('OWNER'),
  upload.single('image'),
  uploadPropertyImage
)

/* =====================================================
   SINGLE PROPERTY
===================================================== */
// Single property details - cache for 60 seconds
router.get('/:id', cache('property', 60), getProperty)

/* =====================================================
   UPDATE PROPERTY
===================================================== */
router.put(
  '/:id',
  authorize('OWNER', 'ADMIN'),
  propertyValidation,
  updateProperty
)

/* =====================================================
   DELETE PROPERTY
===================================================== */
router.delete('/:id', authorize('OWNER', 'ADMIN'), deleteProperty)

/* =====================================================
   INVITES
===================================================== */
router.post('/:id/invite', authorize('OWNER', 'ADMIN'), createInvitation)
router.post('/accept-invite/:token', authorize('TENANT'), joinWithToken)

/* =====================================================
   TENANT ACTIONS
===================================================== */
router.post('/:id/remove-tenant', authorize('OWNER'), removeTenant)
router.post('/:id/leave', authorize('TENANT'), leaveProperty)

export default router