const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Notification = require('../models/Notification');

const notifyUser = async (userId, message, courseId) => {
  try {
    await Notification.create({ userId, message, courseId });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Notification error:', err.message);
  }
};

exports.createAssignment = async (req, res) => {
  try {
    const assignment = await Assignment.create(req.body);

    // notify enrolled students about new assignment
    if (assignment.courseId) {
      const enrollments = await Enrollment.find({ courseId: assignment.courseId });
      const course = await Course.findById(assignment.courseId).select('title');
      const courseTitle = course ? course.title : 'a course';
      await Promise.all(
        enrollments.map((e) =>
          notifyUser(e.studentId, `[${courseTitle}: New assignment "${assignment.title}" posted]`, assignment.courseId)
        )
      );
    }
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ message: 'Create assignment failed', error: error.message });
  }
};

exports.listAssignmentsByCourse = async (req, res) => {
  try {
    const assignments = await Assignment.find({ courseId: req.params.courseId });
    res.json(assignments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch assignments', error: error.message });
  }
};

exports.submitAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const { answers, fileUrl } = req.body;

     // enforce due date
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }
    if (assignment.dueDate && new Date() > new Date(assignment.dueDate)) {
      return res.status(400).json({ message: 'Submission closed. Due date has passed.' });
    }

    const submission = await Submission.create({
      studentId: req.user._id,
      assignmentId,
      answers,
      fileUrl
    });
    // notify instructor about new submission
    if (assignment) {
      const course = await Course.findById(assignment.courseId).select('instructor title');
      if (course && course.instructor) {
        await notifyUser(course.instructor, `[${course.title}: New submission for "${assignment.title}"]`, assignment.courseId);
      }
    }
    res.status(201).json(submission);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already submitted' });
    }
    res.status(500).json({ message: 'Submit failed', error: error.message });
  }
};

exports.gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grade, feedback } = req.body;
    const submission = await Submission.findByIdAndUpdate(
      submissionId,
      { grade, feedback },
      { new: true }
    );
    if (!submission) return res.status(404).json({ message: 'Submission not found' });

    const assignment = await Assignment.findById(submission.assignmentId);
    if (assignment && grade >= 1) { // Any positive grade marks completion for demo purposes
      await Enrollment.findOneAndUpdate(
        { studentId: submission.studentId, courseId: assignment.courseId },
        { completed: true, progress: 100 }
      );
      await notifyUser(submission.studentId, `[${assignment.title}: Graded with ${grade}] You are now eligible for a certificate!`, assignment.courseId);
    } else {
      await notifyUser(submission.studentId, `[${assignment ? assignment.title : 'Assignment'}: Graded with ${grade}]`, assignment?.courseId);
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: 'Grading failed', error: error.message });
  }
};

exports.getMySubmissionForAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const submission = await Submission.findOne({
      assignmentId,
      studentId: req.user._id
    });
    res.json(submission || null);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch submission', error: error.message });
  }
};

exports.listSubmissionsForAssignment = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const submissions = await Submission.find({ assignmentId }).populate(
      'studentId',
      'name email'
    );
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch submissions', error: error.message });
  }
};


