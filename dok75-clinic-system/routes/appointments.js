const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const { doctorOnly, receptionistOnly, sameClinic } = require('../middleware/roles');

// جميع المسارات تتطلب توثيق
router.use(protect);

// إنشاء موعد جديد (للاستقبال فقط)
router.post('/', receptionistOnly, appointmentController.createAppointment);

// عرض جميع المواعيد (حسب الصلاحية)
router.get('/', appointmentController.getAllAppointments);

// عرض مواعيد اليوم
router.get('/today', appointmentController.getTodayAppointments);

// عرض مواعيد طبيب محدد
router.get('/doctor/:doctorId', appointmentController.getDoctorAppointments);

// عرض موعد محدد
router.get('/:id', appointmentController.getAppointmentById);

// تحديث موعد (للاستقبال)
router.put('/:id', receptionistOnly, appointmentController.updateAppointment);

// تغيير حالة الموعد (للدكتور والاستقبال)
router.patch('/:id/status', appointmentController.updateAppointmentStatus);

// إلغاء موعد (للاستقبال)
router.delete('/:id', receptionistOnly, appointmentController.cancelAppointment);

// إحصائيات المواعيد
router.get('/stats/summary', appointmentController.getAppointmentStats);

module.exports = router;
