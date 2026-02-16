/**
 * ============================================
 * مسارات التخصصات (Specializations)
 * ============================================
 */

const express = require('express');
const router = express.Router();
const specializationController = require('../controllers/specializationController');
const { protect } = require('../middleware/auth');
const { superAdminOnly } = require('../middleware/roles');

// جميع المسارات تتطلب توثيق
router.use(protect);

// إنشاء تخصص جديد (للسوبر أدمن فقط)
router.post('/', superAdminOnly, specializationController.createSpecialization);

// عرض جميع التخصصات
router.get('/', specializationController.getAllSpecializations);

// عرض تخصص محدد
router.get('/:id', specializationController.getSpecializationById);

// تحديث بيانات تخصص (للسوبر أدمن فقط)
router.put('/:id', superAdminOnly, specializationController.updateSpecialization);

// حذف تخصص (للسوبر أدمن فقط)
router.delete('/:id', superAdminOnly, specializationController.deleteSpecialization);

// تغيير حالة التخصص
router.patch('/:id/toggle-status', superAdminOnly, specializationController.toggleSpecializationStatus);

module.exports = router;
