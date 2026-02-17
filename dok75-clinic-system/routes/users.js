
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roles');

// جميع المسارات تتطلب توثيق
router.use(protect);

// إنشاء مستخدم جديد (للمشرف فقط)
router.post('/', adminOnly, userController.createUser);

// عرض جميع المستخدمين (للمشرف فقط)
router.get('/', adminOnly, userController.getAllUsers);

// عرض مستخدم محدد (للمشرف فقط)
router.get('/:id', adminOnly, userController.getUserById);

// تحديث بيانات مستخدم (للمشرف فقط)
router.put('/:id', adminOnly, userController.updateUser);

// تغيير حالة المستخدم (للمشرف فقط)
router.patch('/:id/toggle-status', adminOnly, userController.toggleUserStatus);

// حذف مستخدم (للمشرف فقط)
router.delete('/:id', adminOnly, userController.deleteUser);

// إحصائيات المستخدمين (للمشرف فقط)
router.get('/stats/summary', adminOnly, userController.getUserStats);

module.exports = router;
