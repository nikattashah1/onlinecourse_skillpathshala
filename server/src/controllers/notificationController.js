const Notification = require('../models/Notification');
const Enrollment = require('../models/Enrollment');
const Course = require('../models/Course');

exports.createNotification = async (req, res) => {
  try {
    const { userId, message, courseId } = req.body;
    const notification = await Notification.create({ userId, message, courseId });
    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Create notification failed', error: error.message });
  }
};

exports.sendCourseAnnouncement = async (req, res) => {
  try {
    const { courseId, message } = req.body;
    if (!courseId || !message) {
      return res.status(400).json({ message: 'courseId and message are required' });
    }

    const course = await Course.findById(courseId).select('title instructor');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const isInstructor = course.instructor && course.instructor.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';
    if (!isInstructor && !isAdmin) {
      return res.status(403).json({ message: 'Not allowed to send announcement for this course' });
    }

    const formattedMessage = `[${req.user.name}: ${message}]`;

    const enrollments = await Enrollment.find({ courseId });
    const docs = enrollments.map((e) => ({
      userId: e.studentId,
      courseId,
      message: formattedMessage
    }));
    if (docs.length > 0) {
      await Notification.insertMany(docs);
    }
    res.status(201).json({ count: docs.length });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send announcement', error: error.message });
  }
};

exports.getMyNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch notifications', error: error.message });
  }
};

exports.markAsRead = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { read: true },
      { new: true }
    );
    if (!notification) return res.status(404).json({ message: 'Notification not found' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Failed to mark as read', error: error.message });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const notification = await Notification.findOneAndDelete({
      _id: id,
      userId: req.user._id
    });
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete notification', error: error.message });
  }
};

