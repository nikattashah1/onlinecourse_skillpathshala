const express = require('express');
const router = express.Router();
const { auth, authorizeRoles } = require('../middleware/authMiddleware');
const adminController = require('../controllers/adminController');

router.get('/stats', auth, authorizeRoles('admin'), adminController.getDashboardStats);
router.get('/users', auth, authorizeRoles('admin'), adminController.manageUsers);
router.get('/courses', auth, authorizeRoles('admin'), adminController.manageCourses);
router.put('/instructors/:id/approve', auth, authorizeRoles('admin'), adminController.approveInstructor);

// publish / unpublish courses
router.put(
  '/courses/:id/publish',
  auth,
  authorizeRoles('admin'),
  adminController.setCoursePublishStatus
);

// admin alerts
router.post('/alert', auth, authorizeRoles('admin'), adminController.sendSystemAlert);

// admin delete
router.delete('/users/:id', auth, authorizeRoles('admin'), adminController.deleteUser);
router.delete('/courses/:id', auth, authorizeRoles('admin'), adminController.deleteCourse);

module.exports = router;

