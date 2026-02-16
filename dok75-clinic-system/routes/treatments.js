/**
 * ============================================
 * مسارات الخدمات (Treatments)
 * ============================================
 */

const express = require('express');
const router = express.Router();
const treatmentController = require('../controllers/treatmentController');
const { protect } = require('../middleware/auth');
const { superAdminOnly } = require('../middleware/roles');

// جميع المسارات تتطلب توثيق
router.use(protect);

// إنشاء خدمة/علاج جديد (للسوبر أدمن فقط)
router.post('/', superAdminOnly, treatmentController.createTreatment);

// عرض جميع الخدمات
router.get('/', treatmentController.getAllTreatments);

// عرض خدمة محددة
router.get('/:id', treatmentController.getTreatmentById);

// تحديث بيانات خدمة (للسوبر أدمن فقط)
router.put('/:id', superAdminOnly, treatmentController.updateTreatment);

// حذف خدمة (للسوبر أدمن فقط)
router.delete('/:id', superAdminOnly, treatmentController.deleteTreatment);

// عرض خدمات قسم محدد
router.get('/department/:departmentId', treatmentController.getTreatmentsByDepartment);

module.exports = router;
