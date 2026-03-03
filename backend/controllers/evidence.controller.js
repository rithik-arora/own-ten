import axios from 'axios';
import { pipeline } from 'node:stream/promises';
import Dispute from '../models/Dispute.model.js';
import Property from '../models/Property.model.js';
import Evidence from '../models/Evidence.model.js';
import cloudinary from '../config/cloudinary.js';
import { createAndDispatchNotification } from './notification.controller.js';
import { createActivity } from './activity.helper.js';

/*Authorization Helper */

const isAuthorizedForDispute = async ({ dispute, user }) => {
  const isCreator = dispute.createdBy?.toString() === user.id;
  const isAgainst = dispute.againstUser?.toString() === user.id;
  const isAdmin = user.role === 'ADMIN';

  let isPropertyOwner = false;

  if (user.role === 'OWNER') {
    const property = await Property.findById(dispute.propertyId).select('ownerId');
    isPropertyOwner = property?.ownerId?.toString() === user.id;
  }

  return isCreator || isAgainst || isAdmin || isPropertyOwner;
};

/* Cloudinary Upload Helper*/

const uploadBufferToCloudinary = ({
  buffer,
  originalName,
  disputeId,
  mimetype
}) => {

  const folder = `own-ten/disputes/${disputeId}/evidence`;

  const isPDF = mimetype === 'application/pdf';

  const options = {
    folder,
    resource_type: isPDF ? 'raw' : 'auto',
    use_filename: true,
    unique_filename: false,
    filename_override: originalName,
    overwrite: false
  };

  return new Promise((resolve, reject) => {

    const uploadStream = cloudinary.uploader.upload_stream(
      options,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );

    uploadStream.end(buffer);
  });
};

/* Upload Evidence Controller*/

export const uploadEvidence = async (req, res, next) => {
  try {
    const { disputeId } = req.body;

    if (!disputeId) {
      return res.status(400).json({
        success: false,
        message: 'disputeId is required'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'File is required'
      });
    }

    const dispute = await Dispute.findById(disputeId).select(
      'propertyId createdBy againstUser'
    );

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    const authorized = await isAuthorizedForDispute({
      dispute,
      user: req.user
    });

    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    // Upload to Cloudinary
    const result = await uploadBufferToCloudinary({
      buffer: req.file.buffer,
      originalName: req.file.originalname,
      disputeId,
      mimetype: req.file.mimetype
    });

    // Normalize fileType (used by frontend rendering)
    // Values: image | pdf | video | doc
    // NOTE: keep this stable for production.
    let fileType = 'doc';
    if (req.file.mimetype?.startsWith('image/')) fileType = 'image';
    else if (req.file.mimetype === 'application/pdf') fileType = 'pdf';
    else if (req.file.mimetype?.startsWith('video/')) fileType = 'video';

    const evidence = await Evidence.create({
      disputeId,
      uploadedBy: req.user.id,
      fileUrl: result.secure_url,
      publicId: result.public_id,
      fileType,
      originalName: req.file.originalname,
      size: req.file.size
    });

    const populated = await Evidence.findById(evidence._id)
      .populate('uploadedBy', 'name email role');

    try {
      const recipients = [
        dispute.createdBy?.toString(),
        dispute.againstUser?.toString()
      ].filter(id => id && id !== req.user.id);

      for (const userId of recipients) {
        await createAndDispatchNotification({
          userId,
          disputeId,
          type: 'EVIDENCE_UPLOADED',
          title: 'New evidence uploaded',
          message: `${req.user.name} uploaded ${req.file.originalname}`,
          metadata: {
            fileType,
            fileName: req.file.originalname,
            evidenceId: evidence._id
          }
        });
      }
    } catch (notifyErr) {
      console.error('Notification error (uploadEvidence):', notifyErr?.message || notifyErr);
    }

    // Activity: evidence uploaded
    await createActivity({
      disputeId,
      userId: req.user.id,
      type: 'EVIDENCE',
      description: `${req.user.name} uploaded evidence: ${req.file.originalname}`,
      metadata: {
        evidenceId: evidence._id,
        fileType,
        fileName: req.file.originalname
      }
    });

    res.status(201).json({
      success: true,
      data: {
        evidence: populated
      }
    });

  } catch (error) {
    console.error(error);
    next(error);
  }
};

/*  Get Evidence By Dispute */

export const getEvidenceByDispute = async (req, res, next) => {
  try {
    const { disputeId } = req.params;

    const dispute = await Dispute.findById(disputeId).select(
      'propertyId createdBy againstUser'
    );

    if (!dispute) {
      return res.status(404).json({
        success: false,
        message: 'Dispute not found'
      });
    }

    const authorized = await isAuthorizedForDispute({
      dispute,
      user: req.user
    });

    if (!authorized) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized'
      });
    }

    const evidence = await Evidence.find({ disputeId })
      .populate('uploadedBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: {
        evidence
      }
    });

  } catch (error) {
    next(error);
  }
};

export const streamEvidenceFile = async (req, res) => {
  try {
    const { url } = req.query

    if (!url) {
      return res.status(400).json({ message: 'File URL missing' })
    }

    /* -------------------------
       URL VALIDATION (SECURITY)
    -------------------------- */

    let parsedUrl

    try {
      parsedUrl = new URL(url)
    } catch {
      return res.status(400).json({ message: 'Invalid file URL' })
    }

    if (parsedUrl.protocol !== 'https:') {
      return res.status(400).json({ message: 'Invalid file URL protocol' })
    }

    // Only allow Cloudinary
    if (!parsedUrl.hostname.endsWith('cloudinary.com')) {
      return res.status(400).json({ message: 'Unsupported file host' })
    }

    /* -------------------------
       ABORT CONTROLLER
    -------------------------- */

    const controller = new AbortController()

    req.on('close', () => {
      controller.abort()
    })

    /* -------------------------
       FETCH FROM CLOUDINARY
    -------------------------- */

    const cloudResponse = await axios.get(url, {
      responseType: 'stream',
      timeout: 30000,
      signal: controller.signal,
      maxBodyLength: Infinity,
      maxContentLength: Infinity,
      validateStatus: () => true,
      headers: {
        'User-Agent': 'own-ten-evidence-proxy'
      }
    })

    if (!cloudResponse || !cloudResponse.status) {
      return res.status(502).json({ message: 'Upstream response missing' })
    }

    if (cloudResponse.status >= 400) {
      return res.status(cloudResponse.status).json({
        message: 'Upstream file request failed'
      })
    }

    /* -------------------------
       HEADERS FOR BROWSER
    -------------------------- */

    const contentType =
      cloudResponse.headers['content-type'] || 'application/octet-stream'

    const contentLength = cloudResponse.headers['content-length']

    res.setHeader('Content-Type', contentType)

    // INLINE = view in browser (pdf/image/video)
    res.setHeader('Content-Disposition', 'inline')

    if (contentLength) {
      res.setHeader('Content-Length', contentLength)
    }

    res.setHeader('X-Content-Type-Options', 'nosniff')
    res.setHeader('Cache-Control', 'no-store')

    /* -------------------------
       STREAM PIPE 
    -------------------------- */

    await pipeline(cloudResponse.data, res)

  } catch (error) {

    // Client closed tab — safe ignore
    if (error?.name === 'CanceledError' || error?.code === 'ERR_CANCELED') {
      return
    }

    console.error('STREAM ERROR:', error)

    return res.status(500).json({
      message: 'File streaming failed'
    })
  }
}
