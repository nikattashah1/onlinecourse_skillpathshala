const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');
const Notification = require('../models/Notification');
const Counter = require('../models/Counter');
const Assignment = require('../models/Assignment');
const Submission = require('../models/Submission');
const Certificate = require('../models/Certificate');
const Review = require('../models/Review');

exports.createCourse = async (req, res) => {
  try {
    if (!req.body.thumbnailUrl) {
      return res.status(400).json({ message: 'Thumbnail is required' });
    }
    const counter = await Counter.findOneAndUpdate(
      { key: 'courseNumber' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    const course = await Course.create({
      ...req.body,
      courseNumber: counter.seq,
      instructor: req.user._id
    });
    res.status(201).json(course);
  } catch (error) {
    res.status(500).json({ message: 'Create course failed', error: error.message });
  }
};

exports.listCourses = async (req, res) => {
  try {
    // Backfill missing global courseNumber (one-time migration behavior).
    const missing = await Course.find({ courseNumber: { $exists: false } })
      .sort({ createdAt: 1 })
      .select('_id')
      .lean();
    if (missing.length > 0) {
      const maxExisting = await Course.findOne({ courseNumber: { $exists: true } })
        .sort({ courseNumber: -1 })
        .select('courseNumber')
        .lean();
      const counter = await Counter.findOneAndUpdate(
        { key: 'courseNumber' },
        { $setOnInsert: { seq: 0 } },
        { new: true, upsert: true }
      );
      const start = Math.max(counter.seq || 0, maxExisting?.courseNumber || 0);
      const ops = missing.map((c, idx) => ({
        updateOne: {
          filter: { _id: c._id, courseNumber: { $exists: false } },
          update: { $set: { courseNumber: start + idx + 1 } }
        }
      }));
      if (ops.length > 0) {
        await Course.bulkWrite(ops);
        await Counter.findOneAndUpdate(
          { key: 'courseNumber' },
          { $set: { seq: start + ops.length } },
          { upsert: true }
        );
      }
    }

    const courses = await Course.find({ isPublished: true }).populate('instructor', 'name');
    res.json(courses);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch courses', error: error.message });
  }
};

// public course details: no modules/lessons
exports.getCourse = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate('instructor', 'name');
    if (!course) return res.status(404).json({ message: 'Course not found' });
    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch course', error: error.message });
  }
};

// protected lessons for enrolled students / instructor / admin
exports.getCourseLessons = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).populate('instructor', 'name');
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const isInstructor = course.instructor && course.instructor._id.equals(req.user._id);
    const isAdmin = req.user.role === 'admin';

    if (!isInstructor && !isAdmin) {
      const enrollment = await Enrollment.findOne({
        studentId: req.user._id,
        courseId: course._id
      });
      if (!enrollment) {
        return res
          .status(403)
          .json({ message: 'Course content is locked. Please enroll to access lessons.' });
      }
    }

    res.json({
      _id: course._id,
      title: course.title,
      description: course.description,
      modules: course.modules,
      content: course.content,
      instructor: course.instructor
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch lessons', error: error.message });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndUpdate(
      { _id: req.params.id, instructor: req.user._id },
      req.body,
      { new: true }
    );
    if (!course) return res.status(404).json({ message: 'Course not found or not owned by instructor' });
    
    // Notify enrolled students about course update
    try {
      const enrollments = await Enrollment.find({ courseId: course._id });
      const docs = enrollments.map((e) => ({
        userId: e.studentId,
        courseId: course._id,
        message: `Course "${course.title}" has been updated.`
      }));
      if (docs.length > 0) {
        await Notification.insertMany(docs);
      }
    } catch (notifErr) {
      console.error('Notification error on course update:', notifErr.message);
    }

    res.json(course);
  } catch (error) {
    res.status(500).json({ message: 'Update failed', error: error.message });
  }
};

exports.deleteCourse = async (req, res) => {
  try {
    const course = await Course.findOneAndDelete({
      _id: req.params.id,
      instructor: req.user._id
    });
    if (!course) return res.status(404).json({ message: 'Course not found or not owned by instructor' });

    // cascade cleanup to avoid broken references
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
    res.status(500).json({ message: 'Delete failed', error: error.message });
  }
};

exports.getMyCourses = async (req, res) => {
  try {
    const courses = await Course.find({ instructor: req.user._id }).lean();

    const courseIds = courses.map((c) => c._id);
    const counts = await Enrollment.aggregate([
      { $match: { courseId: { $in: courseIds } } },
      { $group: { _id: '$courseId', count: { $sum: 1 } } }
    ]);
    const countMap = new Map(counts.map((c) => [String(c._id), c.count]));

    const withCounts = courses.map((c) => ({
      ...c,
      enrollmentCount: countMap.get(String(c._id)) || 0
    }));

    res.json(withCounts);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch instructor courses', error: error.message });
  }
};

exports.getEnrolledCourses = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user._id }).populate('courseId');
    const valid = enrollments.filter((e) => !!e.courseId);
    const orphanIds = enrollments.filter((e) => !e.courseId).map((e) => e._id);
    if (orphanIds.length > 0) {
      await Enrollment.deleteMany({ _id: { $in: orphanIds } });
    }
    res.json(valid);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch enrollments', error: error.message });
  }
};

