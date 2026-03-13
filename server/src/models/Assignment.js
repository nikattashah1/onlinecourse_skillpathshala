const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    type: { type: String, enum: ['text', 'mcq'], default: 'text' },
    options: [String],
    correctAnswer: String
  },
  { _id: false }
);

const AssignmentSchema = new mongoose.Schema(
  {
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    title: { type: String, required: true },
    description: { type: String },
    fileUrl: { type: String },
    questions: [QuestionSchema],
    dueDate: { type: Date, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Assignment', AssignmentSchema);

