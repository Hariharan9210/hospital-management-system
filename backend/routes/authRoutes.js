const express = require('express');
const router = express.Router();
const { register, login, getMe, getDashboardStats,adminCreateUser } = require('../controllers/authController');
const { protect, authorize } = require('../middleware/authMiddleware');
const { validateRegister, validateLogin } = require('../middleware/validationMiddleware');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.get('/dashboard-stats', protect, authorize('admin'), getDashboardStats);

// Admin only - create doctor or admin accounts
router.post('/admin/create-user', protect, authorize('admin'), adminCreateUser);

module.exports = router;