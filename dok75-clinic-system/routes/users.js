const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roles');

// جميع المسارات تتطلب توثيق وصلاحية أدمن
router.use(protect);
router.use(adminOnly);

// إنشاء مستخدم جديد
router.post('/', userController.createUser);

// عرض جميع المستخدمين
router.get('/', userController.getAllUsers);

// عرض مستخدم محدد
router.get('/:id', userController.getUserById);

// تحديث بيانات مستخدم
router.put('/:id', userController.updateUser);

// تغيير حالة المستخدم (تفعيل/تعطيل)
router.patch('/:id/toggle-status', userController.toggleUserStatus);

// حذف مستخدم
router.delete('/:id', userController.deleteUser);

// إحصائيات المستخدمين
router.get('/stats/summary', userController.getUserStats);

module.exports = router;
