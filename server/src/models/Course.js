const mongoose = require('mongoose');

const LessonSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    videoUrl: { type: String },
    description: { type: String },
    notesUrl: { type: String },
    order: { type: Number, default: 0 }
  },
  { _id: false }
);

const ModuleSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    order: { type: Number, default: 0 },
    lessons: [LessonSchema]
  },
  { _id: false }
);

const CourseSchema = new mongoose.Schema(
  {
    // Global sequential ID (1,2,3...) across all instructors
    courseNumber: { type: Number, unique: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    instructor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    price: { type: Number, default: 0 },
    category: { type: String, default: 'General' },
    thumbnailUrl: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    },
    lessonsCount: { type: Number, default: 0 },
    // Dynamic rating fields (computed from real reviews)
    ratingAvg: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    duration: { type: String, default: '4h 00m' },
    modules: [ModuleSchema],
    // legacy flat content, kept for backward compatibility if needed
    content: [LessonSchema],
    isPublished: { type: Boolean, default: false }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Course', CourseSchema);

