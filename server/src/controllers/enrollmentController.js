const Enrollment = require('../models/Enrollment');
const Payment = require('../models/Payment');
const Course = require('../models/Course');
const Submission = require('../models/Submission');
const Certificate = require('../models/Certificate');
const Notification = require('../models/Notification');
const Assignment = require('../models/Assignment');

const generateCode = () => {
  return 'CERT-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now();
};

const notifyUser = async (userId, message, courseId) => {
  try {
    await Notification.create({ userId, message, courseId });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Notification error:', err.message);
  }
};

const isFullyCompletedForCertificate = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({ studentId, courseId });
  if (!enrollment || !enrollment.completed || Number(enrollment.progress || 0) < 100) {
    return false;
  }

  const assignments = await Assignment.find({ courseId }).select('_id').lean();
  if (assignments.length === 0) {
    return true;
  }

  const assignmentIds = assignments.map((a) => a._id);
  const submissions = await Submission.find({ studentId, assignmentId: { $in: assignmentIds } })
    .select('assignmentId grade')
    .lean();

  const subMap = new Map(submissions.map((s) => [String(s.assignmentId), s]));
  for (const aid of assignmentIds) {
    const sub = subMap.get(String(aid));
    if (!sub) return false; // not submitted
    if (sub.grade === undefined || sub.grade === null) return false; // not graded
  }
  return true;
};

exports.enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const payment = await Payment.findOne({
      studentId: req.user._id,
      courseId,
      status: 'success'
    });
    if (!payment && course.price > 0) {
      return res.status(400).json({ message: 'Payment required before enrollment' });
    }

    const enrollment = await Enrollment.create({
      studentId: req.user._id,
      courseId
    });

    res.status(201).json(enrollment);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Already enrolled' });
    }
    res.status(500).json({ message: 'Enrollment failed', error: error.message });
  }
};

exports.updateProgress = async (req, res) => {
  try {
    const { enrollmentId } = req.params;
    const { progress, completed } = req.body;
    const enrollment = await Enrollment.findOneAndUpdate(
      { _id: enrollmentId, studentId: req.user._id },
      { progress, completed },
      { new: true }
    );
    if (!enrollment) return res.status(404).json({ message: 'Enrollment not found' });

    // Auto-issue certificate only when full completion conditions are met:
    // progress=100, completed=true, all assignments submitted and graded
    const fullyCompleted = await isFullyCompletedForCertificate(req.user._id, enrollment.courseId);
    if (fullyCompleted) {
      let certificate = await Certificate.findOne({
        studentId: req.user._id,
        courseId: enrollment.courseId
      });
      if (!certificate) {
        certificate = await Certificate.create({
          studentId: req.user._id,
          courseId: enrollment.courseId,
          completionDate: new Date(),
          certificateCode: generateCode()
        });
      }
    }

    res.json(enrollment);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update progress', error: error.message });
  }
};

exports.getMyEnrollmentStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const enr = await Enrollment.findOne({ studentId: req.user._id, courseId }).lean();
    res.json({
      enrolled: !!enr,
      completed: !!enr?.completed,
      progress: Number(enr?.progress || 0)
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch enrollment status' });
  }
};

