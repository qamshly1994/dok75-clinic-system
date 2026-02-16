/**
 * ============================================
 * مسارات العيادات (Clinics)
 * ============================================
 */

const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinicController');
const { protect } = require('../middleware/auth');
const { superAdminOnly } = require('../middleware/roles');

// جميع المسارات تتطلب توثيق
router.use(protect);

// إنشاء عيادة جديدة (للسوبر أدمن فقط)
router.post('/', superAdminOnly, clinicController.createClinic);

// عرض جميع العيادات
router.get('/', clinicController.getAllClinics);

// عرض عيادة محددة
router.get('/:id', clinicController.getClinicById);

// تحديث بيانات عيادة (للسوبر أدمن فقط)
router.put('/:id', superAdminOnly, clinicController.updateClinic);

// حذف عيادة (للسوبر أدمن فقط)
router.delete('/:id', superAdminOnly, clinicController.deleteClinic);

// تغيير حالة العيادة (تفعيل/تعطيل)
router.patch('/:id/toggle-status', superAdminOnly, clinicController.toggleClinicStatus);

// عرض أقسام عيادة محددة
router.get('/:id/departments', clinicController.getClinicDepartments);

// عرض أطباء عيادة محددة
router.get('/:id/doctors', clinicController.getClinicDoctors);

module.exports = router;
