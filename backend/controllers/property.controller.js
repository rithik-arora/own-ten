import Property from '../models/Property.model.js'
import { validationResult } from 'express-validator'
import Dispute from '../models/Dispute.model.js'
import cloudinary from 'cloudinary'
import { invalidatePropertyCache } from '../middleware/cache.middleware.js'



/*CREATE PROPERTY */
export const createProperty = async (req, res, next) => {
  try {
    const { address, city, state, rentAmount, status, isPublic } = req.body

    const property = await Property.create({
      ownerId: req.user.id,
      address,
      city,
      state,
      rentAmount,
      status: status || 'AVAILABLE',
      isPublic: typeof isPublic === 'boolean' ? isPublic : true
    })

    try {
      // Invalidate cached property lists after creation
      await invalidatePropertyCache()
    } catch (cacheErr) {
      console.error('Property cache invalidation error (createProperty):', cacheErr?.message || cacheErr)
    }

    res.status(201).json({ success: true, data: { property } })
  } catch (err) {
    next(err)
  }
}

/*UPLOAD IMAGE*/
export const uploadPropertyImage = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)

    if (!property)
      return res.status(404).json({ success:false, message:'Property not found' })

    if (property.ownerId.toString() !== req.user.id)
      return res.status(403).json({ success:false, message:'Not authorized' })

    if (!req.file)
      return res.status(400).json({ success:false, message:'No file' })

    const result = await cloudinary.v2.uploader.upload(req.file.path, {
      folder: 'own-ten-properties'
    })

    property.images.push({
      url: result.secure_url,
      public_id: result.public_id
    })

    await property.save()

    res.json({ success:true })
  } catch (err) {
    next(err)
  }
}

/* ======================================================
   GET PUBLIC
====================================================== */
export const getPublicProperties = async (req, res, next) => {
  try {
    const properties = await Property.find({
      isPublic:true,
      status:'AVAILABLE',
      tenantId:null
    }).sort({ createdAt:-1 })

    res.json({ success:true, data:{ properties } })
  } catch (err) {
    next(err)
  }
}

/* ======================================================
   GET ALL
====================================================== */
export const getProperties = async (req, res, next) => {
  try {
    let properties = []

    if (req.user.role === 'ADMIN') {
      properties = await Property.find({})
    } 
    else if (req.user.role === 'OWNER') {
      properties = await Property.find({ ownerId:req.user.id })
    } 
    else {
      properties = await Property.find({ tenantId:req.user.id })
    }

    res.json({ success:true, properties })
  } catch (err) {
    next(err)
  }
}

/* ======================================================
   GET SINGLE
====================================================== */
export const getProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)
      .populate('ownerId','name email')
      .populate('tenantId','name email')

    if (!property)
      return res.status(404).json({ success:false })

    res.json({ success:true, data:{ property } })
  } catch (err) {
    next(err)
  }
}

/* ======================================================
   UPDATE
====================================================== */
export const updateProperty = async (req, res, next) => {
  try {
    const property = await Property.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new:true }
    )

    try {
      // Invalidate cached property data after update
      await invalidatePropertyCache()
    } catch (cacheErr) {
      console.error('Property cache invalidation error (updateProperty):', cacheErr?.message || cacheErr)
    }

    res.json({ success:true, data:{ property } })
  } catch (err) {
    next(err)
  }
}

/* ======================================================
   DELETE  🔥 THIS WAS MISSING
====================================================== */
export const deleteProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)

    if (!property)
      return res.status(404).json({ success:false })

    await property.deleteOne()

    try {
      // Invalidate cached property data after delete
      await invalidatePropertyCache()
    } catch (cacheErr) {
      console.error('Property cache invalidation error (deleteProperty):', cacheErr?.message || cacheErr)
    }

    res.json({ success:true })
  } catch (err) {
    next(err)
  }
}

/* ======================================================
   REMOVE TENANT
====================================================== */
export const removeTenant = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)

    property.tenantId = null
    property.status = 'AVAILABLE'
    await property.save()

    try {
      // Invalidate cached property data after tenant removal
      await invalidatePropertyCache()
    } catch (cacheErr) {
      console.error('Property cache invalidation error (removeTenant):', cacheErr?.message || cacheErr)
    }

    res.json({ success:true })
  } catch (err) {
    next(err)
  }
}

/* ======================================================
   LEAVE
====================================================== */
// export const leaveProperty = async (req, res, next) => {
//   try {
//     const property = await Property.findById(req.params.id)

//     property.tenantId = null
//     property.status = 'AVAILABLE'
//     await property.save()

//     try {
//       // Invalidate cached property data after tenant leaves
//       await invalidatePropertyCache()
//     } catch (cacheErr) {
//       console.error('Property cache invalidation error (leaveProperty):', cacheErr?.message || cacheErr)
//     }

//     res.json({ success:true })
//   } catch (err) {
//     next(err)
//   }
// }


export const leaveProperty = async (req, res, next) => {
  try {
    const property = await Property.findById(req.params.id)

    if (!property) {
      return res.status(404).json({
        success: false,
        message: 'Property not found'
      })
    }

    // 🔥 1️⃣ Archive all disputes for this property
    await Dispute.updateMany(
      {
        propertyId: property._id,
        isArchived: { $ne: true }
      },
      {
        $set: { isArchived: true }
      }
    )

    // 🔥 2️⃣ Remove tenant
    property.tenantId = null
    property.status = 'AVAILABLE'

    await property.save()

    // 🔥 3️⃣ Invalidate cache (your existing logic)
    try {
      await invalidatePropertyCache()
    } catch (cacheErr) {
      console.error('Property cache invalidation error (leaveProperty):', cacheErr?.message || cacheErr)
    }

    res.json({ success: true })

  } catch (err) {
    next(err)
  }
}
