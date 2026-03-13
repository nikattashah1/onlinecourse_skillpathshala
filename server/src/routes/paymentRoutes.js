const express = require('express');
const router = express.Router();
const { auth, authorizeRoles } = require('../middleware/authMiddleware');
const paymentController = require('../controllers/paymentController');

router.post('/', auth, authorizeRoles('student'), paymentController.createPayment);
router.get('/me', auth, authorizeRoles('student'), paymentController.getPaymentsForStudent);
router.get('/', auth, authorizeRoles('admin'), paymentController.getAllPayments);

module.exports = router;

