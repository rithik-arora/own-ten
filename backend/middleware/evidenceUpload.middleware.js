import multer from 'multer';
import path from 'path';

const MAX_BYTES = {
  image: 10 * 1024 * 1024, // 10MB
  pdf: 20 * 1024 * 1024, // 20MB
  video: 200 * 1024 * 1024, // 200MB
  doc: 20 * 1024 * 1024 // 20MB (docx)
};

const ALLOWED_EXT = new Set(['.jpg', '.jpeg', '.png', '.pdf', '.mp4', '.docx']);

export const detectEvidenceType = (file) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') return 'image';
  if (ext === '.pdf') return 'pdf';
  if (ext === '.mp4') return 'video';
  if (ext === '.docx') return 'doc';
  return null;
};

export const validateEvidenceFile = (file) => {
  const ext = path.extname(file.originalname || '').toLowerCase();
  if (!ALLOWED_EXT.has(ext)) {
    return { ok: false, message: 'Invalid file type. Allowed: jpg, png, pdf, mp4, docx' };
  }

  const type = detectEvidenceType(file);
  if (!type) {
    return { ok: false, message: 'Invalid file type' };
  }

  return { ok: true, type };
};

// Use memory storage so we can upload directly to Cloudinary
const upload = multer({
  storage: multer.memoryStorage(),
  // Max possible: 200MB (videos). We'll enforce tighter per-type limits after Multer.
  limits: { fileSize: MAX_BYTES.video },
  fileFilter: (req, file, cb) => {
    const { ok, message } = validateEvidenceFile(file);
    if (!ok) return cb(new Error(message));
    return cb(null, true);
  }
});

export const evidenceUploadSingle = (fieldName = 'file') => {
  const handler = upload.single(fieldName);
  return (req, res, next) => {
    handler(req, res, (err) => {
      if (!err) return next();

      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(413).json({
            success: false,
            message: 'File too large'
          });
        }
        return res.status(400).json({
          success: false,
          message: err.message || 'Upload failed'
        });
      }

      return res.status(400).json({
        success: false,
        message: err.message || 'Upload failed'
      });
    });
  };
};

export const enforcePerTypeSizeLimit = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: 'File is required'
    });
  }

  const { ok, type, message } = validateEvidenceFile(req.file);
  if (!ok) {
    return res.status(400).json({
      success: false,
      message
    });
  }

  const maxBytes = MAX_BYTES[type] ?? MAX_BYTES.video;
  if (req.file.size > maxBytes) {
    return res.status(413).json({
      success: false,
      message: `File too large for type '${type}'`
    });
  }

  req.evidenceFileType = type;
  next();
};







