const express = require('express');
const router = express.Router();
const { auth, authorizeRoles } = require('../middleware/authMiddleware');
const courseController = require('../controllers/courseController');
const reviewController = require('../controllers/reviewController');

// public
router.get('/', courseController.listCourses);
router.get('/:courseId/reviews', reviewController.listCourseReviews);
router.get('/:id', courseController.getCourse);

// protected lessons endpoint (requires enrollment / instructor / admin)
router.get('/:id/lessons', auth, courseController.getCourseLessons);

// student reviews (enrolled or certified)
router.get(
  '/:courseId/reviews/me',
  auth,
  authorizeRoles('student'),
  reviewController.getMyReviewForCourse
);
router.post(
  '/:courseId/reviews',
  auth,
  authorizeRoles('student'),
  reviewController.upsertMyReviewForCourse
);

// instructor
router.post('/', auth, authorizeRoles('instructor', 'admin'), courseController.createCourse);
router.get('/instructor/me', auth, authorizeRoles('instructor', 'admin'), courseController.getMyCourses);
router.put('/:id', auth, authorizeRoles('instructor', 'admin'), courseController.updateCourse);
router.delete('/:id', auth, authorizeRoles('instructor', 'admin'), courseController.deleteCourse);

// student enrollments listing
router.get('/student/me/enrollments', auth, authorizeRoles('student'), courseController.getEnrolledCourses);

module.exports = router;

