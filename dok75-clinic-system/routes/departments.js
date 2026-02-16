/**
 * ============================================
 * مسارات الأقسام (Departments)
 * ============================================
 */

const express = require('express');
const router = express.Router();
const departmentController = require('../controllers/departmentController');
const { protect } = require('../middleware/auth');
const { superAdminOnly } = require('../middleware/roles');

// جميع المسارات تتطلب توثيق
router.use(protect);

// إنشاء قسم جديد (للسوبر أدمن فقط)
router.post('/', superAdminOnly, departmentController.createDepartment);

// عرض جميع الأقسام
router.get('/', departmentController.getAllDepartments);

// عرض قسم محدد
router.get('/:id', departmentController.getDepartmentById);

// تحديث بيانات قسم (للسوبر أدمن فقط)
router.put('/:id', superAdminOnly, departmentController.updateDepartment);

// حذف قسم (للسوبر أدمن فقط)
router.delete('/:id', superAdminOnly, departmentController.deleteDepartment);

// تغيير حالة القسم
router.patch('/:id/toggle-status', superAdminOnly, departmentController.toggleDepartmentStatus);

// عرض التخصصات التابعة لقسم
router.get('/:id/specializations', departmentController.getDepartmentSpecializations);

module.exports = router;
