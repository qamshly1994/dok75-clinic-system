/**
 * ============================================
 * مسارات المصادقة (Authentication)
 * ============================================
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

// تسجيل الدخول
router.post('/login', authController.login);

// تسجيل الخروج
router.post('/logout', protect, authController.logout);

// الحصول على بيانات المستخدم الحالي
router.get('/me', protect, authController.getMe);

// تغيير كلمة المرور
router.put('/change-password', protect, authController.changePassword);

module.exports = router;
