const express = require('express');
const router = express.Router();
const { auth, authorizeRoles } = require('../middleware/authMiddleware');
const certificateController = require('../controllers/certificateController');

// student: list and self-issue after completion
router.get('/me', auth, authorizeRoles('student'), certificateController.getMyCertificates);
router.post('/', auth, authorizeRoles('student'), certificateController.issueCertificate);

// admin: issue certificate for a specific student (requires completed enrollment)
router.post(
  '/admin/issue',
  auth,
  authorizeRoles('admin'),
  certificateController.adminIssueCertificate
);

module.exports = router;

