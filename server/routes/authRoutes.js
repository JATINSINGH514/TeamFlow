const express = require('express');
const { signupUser, loginUser, getUserProfile, getAllUsers } = require('../controllers/authController.js');
const { protect } = require('../middleware/authMiddleware.js');

const router = express.Router();

router.post('/signup', signupUser);
router.post('/login', loginUser);
router.get('/profile', protect, getUserProfile);
router.get('/users', protect, getAllUsers);

module.exports = router;
