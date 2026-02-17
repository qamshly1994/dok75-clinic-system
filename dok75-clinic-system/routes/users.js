const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { superAdminOnly } = require('../middleware/roles');

// جميع المسارات تتطلب توثيق وصلاحية مشرف
router.use(protect);
router.use(superAdminOnly);

// إنشاء مستخدم جديد
router.post('/', userController.createUser);

// عرض جميع المستخدمين
router.get('/', userController.getAllUsers);

// تغيير حالة المستخدم (تفعيل/تعطيل)
router.patch('/:id/toggle-status', userController.toggleUserStatus);

// حذف مستخدم
router.delete('/:id', userController.deleteUser);

module.exports = router;
