const Certificate = require('../models/Certificate');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');

const generateCode = () => {
  return 'CERT-' + Math.random().toString(36).substring(2, 8).toUpperCase() + '-' + Date.now();
};

const isFullyCompletedForCertificate = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({ studentId, courseId });
  if (!enrollment || !enrollment.completed || Number(enrollment.progress || 0) < 100) {
    return false;
  }

  const assignments = await Assignment.find({ courseId }).select('_id').lean();
  if (assignments.length === 0) return true;

  const assignmentIds = assignments.map((a) => a._id);
  const submissions = await Submission.find({ studentId, assignmentId: { $in: assignmentIds } })
    .select('assignmentId grade')
    .lean();
  const subMap = new Map(submissions.map((s) => [String(s.assignmentId), s]));

  for (const aid of assignmentIds) {
    const sub = subMap.get(String(aid));
    if (!sub) return false;
    if (sub.grade === undefined || sub.grade === null) return false;
  }
  return true;
};

exports.issueCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;

    const ok = await isFullyCompletedForCertificate(req.user._id, courseId);
    if (!ok) {
      return res.status(400).json({
        message:
          'Course not fully completed yet (finish all lessons, submit all assignments, and wait for grading).'
      });
    }

    let existing = await Certificate.findOne({
      studentId: req.user._id,
      courseId
    }).populate('courseId', 'title');

    if (existing) {
      return res.json(existing);
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const certificate = await Certificate.create({
      studentId: req.user._id,
      courseId,
      completionDate: new Date(),
      certificateCode: generateCode()
    });

    const populated = await certificate.populate('courseId', 'title');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to issue certificate', error: error.message });
  }
};

// Admin-issued certificate for a specific student
exports.adminIssueCertificate = async (req, res) => {
  try {
    const { studentId, courseId } = req.body;
    if (!studentId || !courseId) {
      return res.status(400).json({ message: 'studentId and courseId are required' });
    }

    const ok = await isFullyCompletedForCertificate(studentId, courseId);
    if (!ok) {
      return res.status(400).json({
        message:
          'Student has not fully completed this course (finish all lessons, submit all assignments, and wait for grading).'
      });
    }

    let existing = await Certificate.findOne({
      studentId,
      courseId
    }).populate('courseId', 'title');

    if (existing) {
      return res.json(existing);
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const certificate = await Certificate.create({
      studentId,
      courseId,
      completionDate: new Date(),
      certificateCode: generateCode()
    });

    const populated = await certificate.populate('courseId', 'title');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Failed to issue certificate', error: error.message });
  }
};

exports.getMyCertificates = async (req, res) => {
  try {
    const certs = await Certificate.find({ studentId: req.user._id })
      .populate('courseId', 'title')
      .sort({ createdAt: -1 });
    res.json(certs);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch certificates', error: error.message });
  }
};

