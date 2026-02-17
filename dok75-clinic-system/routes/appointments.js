const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const { receptionistOnly } = require('../middleware/roles');

// جميع المسارات تتطلب توثيق
router.use(protect);

// حجز موعد جديد (للاستقبال فقط)
router.post('/', receptionistOnly, appointmentController.createAppointment);

// عرض مواعيد اليوم (للاستقبال)
router.get('/today', receptionistOnly, appointmentController.getTodayAppointments);

// عرض مواعيد دكتور معين
router.get('/doctor/:doctorId', appointmentController.getDoctorAppointments);

// تحديث حالة الموعد
router.patch('/:id/status', appointmentController.updateAppointmentStatus);

module.exports = router;
