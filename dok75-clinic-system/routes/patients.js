/**
 * ============================================
 * مسارات المرضى (Patients)
 * ============================================
 */

const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect } = require('../middleware/auth');

// جميع المسارات تتطلب توثيق
router.use(protect);

// إنشاء مريض جديد
router.post('/', patientController.createPatient);

// عرض جميع المرضى (مع فلترة حسب الصلاحيات)
router.get('/', patientController.getAllPatients);

// عرض مريض محدد
router.get('/:id', patientController.getPatientById);

// تحديث بيانات مريض
router.put('/:id', patientController.updatePatient);

// حذف مريض
router.delete('/:id', patientController.deletePatient);

// البحث عن مريض
router.get('/search/:query', patientController.searchPatients);

// عرض مواعيد مريض
router.get('/:id/appointments', patientController.getPatientAppointments);

module.exports = router;
