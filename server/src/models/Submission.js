const mongoose = require('mongoose');

const SubmissionSchema = new mongoose.Schema(
 {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    fileUrl: String,
    answers: mongoose.Schema.Types.Mixed,
    grade: Number,
    feedback: String
  },
  { timestamps: true }
);

SubmissionSchema.index({ studentId: 1, assignmentId: 1 }, { unique: true });

module.exports = mongoose.model('Submission', SubmissionSchema);

