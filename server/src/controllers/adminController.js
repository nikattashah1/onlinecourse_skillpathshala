const User = require('../models/User');
const Course = require('../models/Course');
const Payment = require('../models/Payment');
const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');
const Certificate = require('../models/Certificate');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Review = require('../models/Review');

exports.getDashboardStats = async (req, res) => {
  try {
    const [
      usersCount, coursesCount, paymentsCount, enrollmentsCount,
      certificatesCount, completedEnrollmentsCount, submissionsCount
    ] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Payment.countDocuments({ status: 'success' }),
      Enrollment.countDocuments(),
      Certificate.countDocuments(),
      Enrollment.countDocuments({ completed: true }),
      Submission.countDocuments()
    ]);
    res.json({ 
      usersCount, coursesCount, paymentsCount, enrollmentsCount,
      certificatesCount, completedEnrollmentsCount, submissionsCount
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch stats', error: error.message });
  }
};

exports.approveInstructor = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { approved: true, role: 'instructor' },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to approve instructor', error: error.message });
  }
};

exports.manageUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users', error: error.message });
  }
};

exports.manageCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate('instructor', 'name');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
  }
};

exports.setCoursePublishStatus = async (req, res) => {
  try {
    const { published } = req.body;
    const course = await Course.findByIdAndUpdate(
      req.params.id,
      { isPublished: !!published },
      { new: true }
    ).populate('instructor', 'name');

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update publish status', error: error.message });
  }
};

exports.sendSystemAlert = async (req, res) => {
  try {
    const { target, message, courseId, courseName, fileUrl } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    const formattedMessage = `[${req.user.name}: ${message}]`;

    let users = [];
    let usedCourseId = undefined;
    if (target === 'students') {
      users = await User.find({ role: 'student' }).select('_id');
    } else if (target === 'instructors') {
      users = await User.find({ role: 'instructor' }).select('_id');
    } else if (target === 'all') {
      users = await User.find({ role: { $in: ['student', 'instructor'] } }).select('_id');
    } else if (target === 'enrolled') {
      let resolvedCourseId = courseId;
      if (!resolvedCourseId && courseName) {
        const course = await Course.findOne({ title: courseName }).select('_id');
        resolvedCourseId = course?._id;
      }
      if (!resolvedCourseId) {
        return res.status(400).json({ message: 'Missing courseId (or valid courseName)' });
      }
      usedCourseId = resolvedCourseId;
      const enrollments = await Enrollment.find({ courseId: resolvedCourseId }).select('studentId');
      users = enrollments.map(e => ({ _id: e.studentId }));
    } else {
      return res.status(400).json({ message: 'Invalid target or missing courseId' });
    }

    const docs = users.map((u) => ({
      userId: u._id,
      courseId: target === 'enrolled' ? usedCourseId : undefined,
      message: formattedMessage,
      fileUrl
    }));
    if (docs.length > 0) {
      await Notification.insertMany(docs);
    }
    
    res.json({ message: `Alert sent to ${docs.length} users.` });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send alert', error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findByIdAndDelete(req.params.id);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const assignments = await Assignment.find({ courseId: course._id }).select('_id');
    const assignmentIds = assignments.map((a) => a._id);
    if (assignmentIds.length > 0) {
      await Submission.deleteMany({ assignmentId: { $in: assignmentIds } });
    }
    await Assignment.deleteMany({ courseId: course._id });
    await Enrollment.deleteMany({ courseId: course._id });
    await Certificate.deleteMany({ courseId: course._id });
    await Notification.deleteMany({ courseId: course._id });
    await Review.deleteMany({ courseId: course._id });

    res.json({ message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete course' });
  }
};

