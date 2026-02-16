/**
 * ============================================
 * مسارات المستخدمين (Users)
 * ============================================
 */

const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { superAdminOnly, selfOrAdmin } = require('../middleware/roles');

// جميع المسارات تتطلب توثيق
router.use(protect);

// إنشاء مستخدم جديد (للسوبر أدمن فقط)
router.post('/', superAdminOnly, userController.createUser);

// عرض جميع المستخدمين (للسوبر أدمن فقط)
router.get('/', superAdminOnly, userController.getAllUsers);

// عرض مستخدم محدد
router.get('/:id', selfOrAdmin, userController.getUserById);

// تحديث بيانات مستخدم
router.put('/:id', superAdminOnly, userController.updateUser);

// حذف مستخدم (للسوبر أدمن فقط)
router.delete('/:id', superAdminOnly, userController.deleteUser);

// تغيير حالة المستخدم (تفعيل/تعطيل)
router.patch('/:id/toggle-status', superAdminOnly, userController.toggleUserStatus);

module.exports = router;
