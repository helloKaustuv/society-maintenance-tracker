const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { cloudinary, isCloudinaryConfigured } = require('../config/cloudinary');

// Ensure local uploads directory exists for fallback
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Memory storage so we can either stream to Cloudinary or write to local disk
const storage = multer.memoryStorage();

// File filter for allowed image extensions and mime types
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (JPG, PNG, WebP, GIF) up to 5MB are allowed.'));
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5 MB max
  },
  fileFilter
});

/**
 * Middleware that processes the uploaded image buffer:
 * - Uploads to Cloudinary if configured
 * - Otherwise saves buffer to local /uploads/ directory and sets URL
 */
const processPhotoUpload = async (req, res, next) => {
  if (!req.file) {
    return next();
  }

  try {
    if (isCloudinaryConfigured) {
      // Upload stream to Cloudinary
      const uploadStream = () => {
        return new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              folder: 'society_maintenance',
              transformation: [{ width: 1200, crop: 'limit' }, { quality: 'auto' }]
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result);
            }
          );
          stream.end(req.file.buffer);
        });
      };

      const result = await uploadStream();
      req.fileUrl = result.secure_url;
      console.log('[Upload] Uploaded image to Cloudinary:', req.fileUrl);
      return next();
    }

    // Local Disk Fallback
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(req.file.originalname) || '.jpg';
    const filename = `complaint-${uniqueSuffix}${ext}`;
    const filePath = path.join(uploadDir, filename);

    fs.writeFileSync(filePath, req.file.buffer);
    const host = req.get('host');
    const protocol = req.protocol;
    req.fileUrl = `${protocol}://${host}/uploads/${filename}`;
    console.log('[Upload] Saved image locally to:', req.fileUrl);
    next();
  } catch (error) {
    console.error('[Upload Middleware Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process and upload image: ' + error.message
    });
  }
};

module.exports = {
  upload,
  processPhotoUpload
};
