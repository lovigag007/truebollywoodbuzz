const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'misc';
    if (file.fieldname === 'poster') folder = 'posters';
    else if (file.fieldname === 'banner') folder = 'banners';
    else if (file.fieldname === 'still') folder = 'stills';

    const uploadPath = path.join(process.env.UPLOAD_PATH || './uploads', folder);
    ensureDir(uploadPath);
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const isValid = allowedTypes.test(path.extname(file.originalname).toLowerCase()) &&
    allowedTypes.test(file.mimetype);
  if (isValid) cb(null, true);
  else cb(new Error('Only image files (jpg, png, webp) are allowed'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 },
});

module.exports = upload;
