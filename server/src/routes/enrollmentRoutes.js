const express = require('express');
const router = express.Router();
const { auth, authorizeRoles } = require('../middleware/authMiddleware');
const enrollmentController = require('../controllers/enrollmentController');

router.post('/', auth, authorizeRoles('student'), enrollmentController.enrollInCourse);
router.put('/:enrollmentId/progress', auth, authorizeRoles('student'), enrollmentController.updateProgress);
router.get(
  '/status/:courseId',
  auth,
  authorizeRoles('student'),
  enrollmentController.getMyEnrollmentStatus
);

module.exports = router;

