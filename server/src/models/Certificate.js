const mongoose = require('mongoose');

const CertificateSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    completionDate: { type: Date, default: Date.now },
    certificateCode: { type: String, unique: true },
    // Optional uploaded certificate file (PDF/image) for admin-issued certificates
    fileUrl: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Certificate', CertificateSchema);

