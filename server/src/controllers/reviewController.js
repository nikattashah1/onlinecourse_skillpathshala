const Review = require('../models/Review');
const Course = require('../models/Course');
const Enrollment = require('../models/Enrollment');

async function recalcCourseRating(courseId) {
  const stats = await Review.aggregate([
    { $match: { courseId } },
    { $group: { _id: '$courseId', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  const row = stats[0];
  await Course.findByIdAndUpdate(courseId, {
    ratingAvg: row ? Number(row.avg.toFixed(2)) : 0,
    ratingCount: row ? row.count : 0
  });
}

exports.listCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;
    const reviews = await Review.find({ courseId })
      .populate('studentId', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch reviews', error: error.message });
  }
};

exports.getMyReviewForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const review = await Review.findOne({ courseId, studentId: req.user._id });
    res.json(review || null);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch review', error: error.message });
  }
};

exports.upsertMyReviewForCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { rating, comment } = req.body;

    const r = Number(rating);
    if (!r || r < 1 || r > 5) {
      return res.status(400).json({ message: 'Rating must be between 1 and 5' });
    }

    const isEnrolled = await Enrollment.exists({ studentId: req.user._id, courseId });
    if (!isEnrolled) {
      return res
        .status(403)
        .json({ message: 'You must be enrolled in this course to rate or review.' });
    }

    const review = await Review.findOneAndUpdate(
      { courseId, studentId: req.user._id },
      { rating: r, comment: comment || '' },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );

    await recalcCourseRating(review.courseId);
    res.status(201).json(review);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Review already exists' });
    }
    res.status(500).json({ message: 'Failed to submit review', error: error.message });
  }
};

