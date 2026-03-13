const Payment = require('../models/Payment');
const Course = require('../models/Course');

// Simulated payment gateway: marks payment as success immediately
exports.createPayment = async (req, res) => {
  try {
    const { courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: 'Course not found' });

    const payment = await Payment.create({
      studentId: req.user._id,
      courseId,
      amount: course.price,
      status: 'success',
      transactionId: 'TXN-' + Date.now()
    });

    res.status(201).json(payment);
  } catch (error) {
    res.status(500).json({ message: 'Payment failed', error: error.message });
  }
};

exports.getPaymentsForStudent = async (req, res) => {
  try {
    const payments = await Payment.find({ studentId: req.user._id }).populate('courseId');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch payments', error: error.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find().populate('studentId', 'name').populate('courseId', 'title');
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch all payments', error: error.message });
  }
};

