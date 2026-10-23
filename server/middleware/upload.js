const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Cloudinary storage for production
const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'smartgram-inspections',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1920, height: 1920, crop: 'limit', quality: 'auto' }]
  }
});

// Local storage fallback for development
const localStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fs = require('fs');
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `inspection-${uniqueSuffix}-${file.originalname}`);
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, PNG, and WebP images are allowed'), false);
  }
};

// Use Cloudinary if configured, otherwise fall back to local
const storage = process.env.CLOUDINARY_CLOUD_NAME ? cloudinaryStorage : localStorage;

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Video upload storage (always local disk for ffmpeg/OpenCV analysis)
const videoStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const fs = require('fs');
    const dir = './uploads';
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `video-${uniqueSuffix}-${file.originalname}`);
  }
});

const videoFileFilter = (req, file, cb) => {
  const allowed = [
    'video/mp4', 'video/webm', 'video/quicktime', 'video/x-matroska',
    'video/x-msvideo', 'video/avi', 'video/mpeg', 'application/octet-stream'
  ];
  if (allowed.includes(file.mimetype) || file.originalname.match(/\.(mp4|webm|mov|mkv|avi)$/i)) {
    cb(null, true);
  } else {
    cb(new Error('Only video files (MP4, WebM, MOV, AVI, MKV) are allowed'), false);
  }
};

const videoUpload = multer({
  storage: videoStorage,
  fileFilter: videoFileFilter,
  limits: { fileSize: 150 * 1024 * 1024 } // 150MB
});

const combinedFileFilter = (req, file, cb) => {
  cb(null, true);
};

const combinedUpload = multer({
  storage: localStorage,
  fileFilter: combinedFileFilter,
  limits: { fileSize: 150 * 1024 * 1024 }
});

module.exports = { upload, videoUpload, combinedUpload, cloudinary };

