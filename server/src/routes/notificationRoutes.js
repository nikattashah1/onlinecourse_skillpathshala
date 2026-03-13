const express = require('express');
const router = express.Router();
const { auth, authorizeRoles } = require('../middleware/authMiddleware');
const notificationController = require('../controllers/notificationController');

router.get('/me', auth, notificationController.getMyNotifications);
router.put('/:id/read', auth, notificationController.markAsRead);
router.delete('/:id', auth, notificationController.deleteNotification);

// admin / instructor can create notifications to any user
router.post('/', auth, authorizeRoles('admin', 'instructor'), notificationController.createNotification);

// instructor / admin: send announcement to all students in a course
router.post(
  '/announce',
  auth,
  authorizeRoles('instructor', 'admin'),
  notificationController.sendCourseAnnouncement
);

module.exports = router;

