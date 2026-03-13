const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/authMiddleware');

const router = express.Router();

// ensure uploads directory exists
// IMPORTANT: must match the static folder served in server/src/app.js:
// app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))
// From this file (server/src/routes/*), that folder is ../../uploads
const uploadRoot = path.join(__dirname, '..', '..', 'uploads');
if (!fs.existsSync(uploadRoot)) {
  fs.mkdirSync(uploadRoot, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadRoot);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname || '');
    cb(null, `${unique}${ext}`);
  }
});

const upload = multer({ storage });

// POST /api/uploads
// accepts single "file" field and returns a URL for later use
router.post('/', auth, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }
  const url = `/uploads/${req.file.filename}`;
  res.status(201).json({
    url,
    originalName: req.file.originalname
  });
});

module.exports = router;

