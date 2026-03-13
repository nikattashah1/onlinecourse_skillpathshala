const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: '' }
  },
  { timestamps: true }
);

ReviewSchema.index({ courseId: 1, studentId: 1 }, { unique: true });

module.exports = mongoose.model('Review', ReviewSchema);

