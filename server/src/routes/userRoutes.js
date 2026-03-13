const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { auth, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/me', auth, userController.getProfile);
router.put('/me', auth, userController.updateProfile);
router.get('/', auth, authorizeRoles('admin'), userController.listUsers);

// public instructor profile
router.get('/:id', userController.getPublicProfile);

module.exports = router;

