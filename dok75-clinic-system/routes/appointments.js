/**
 * ============================================
 * مسارات المواعيد (Appointments)
 * ============================================
 */

const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');

// جميع المسارات تتطلب توثيق
router.use(protect);

// إنشاء موعد جديد
router.post('/', appointmentController.createAppointment);

// عرض جميع المواعيد (مع فلترة)
router.get('/', appointmentController.getAllAppointments);

// عرض موعد محدد
router.get('/:id', appointmentController.getAppointmentById);

// تحديث موعد
router.put('/:id', appointmentController.updateAppointment);

// تغيير حالة الموعد
router.patch('/:id/status', appointmentController.updateAppointmentStatus);

// إلغاء موعد
router.delete('/:id', appointmentController.cancelAppointment);

// عرض مواعيد طبيب محدد
router.get('/doctor/:doctorId', appointmentController.getDoctorAppointments);

// عرض مواعيد يوم محدد
router.get('/date/:date', appointmentController.getAppointmentsByDate);

// عرض مواعيد مريض محدد
router.get('/patient/:patientId', appointmentController.getPatientAppointments);

module.exports = router;
