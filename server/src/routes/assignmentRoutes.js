const express = require('express');
const router = express.Router();
const { auth, authorizeRoles } = require('../middleware/authMiddleware');
const assignmentController = require('../controllers/assignmentController');

// instructor
router.post('/', auth, authorizeRoles('instructor', 'admin'), assignmentController.createAssignment);

// student / public per course
router.get('/course/:courseId', auth, assignmentController.listAssignmentsByCourse);

// student submission
router.post('/:assignmentId/submissions', auth, authorizeRoles('student'), assignmentController.submitAssignment);

// student: view own submission (grade + feedback)
router.get(
  '/:assignmentId/submissions/me',
  auth,
  authorizeRoles('student'),
  assignmentController.getMySubmissionForAssignment
);

// instructor grading
router.put(
  '/submissions/:submissionId/grade',
  auth,
  authorizeRoles('instructor', 'admin'),
  assignmentController.gradeSubmission
);

// instructor / admin: list all submissions for an assignment
router.get(
  '/:assignmentId/submissions',
  auth,
  authorizeRoles('instructor', 'admin'),
  assignmentController.listSubmissionsForAssignment
);

module.exports = router;

