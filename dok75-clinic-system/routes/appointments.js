const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { protect } = require('../middleware/auth');
const { receptionistOnly, doctorOnly, appointmentBelongsToDoctor } = require('../middleware/roles');

// جميع المسارات تتطلب توثيق
router.use(protect);

// إنشاء موعد جديد (للاستقبال والدكتور)
router.post('/', (req, res, next) => {
    if (req.user.role === 'doctor' || req.user.role === 'receptionist' || req.user.role === 'admin') {
        return appointmentController.createAppointment(req, res);
    }
    return res.status(403).json({ error: 'غير مصرح' });
});

// عرض جميع المواعيد
router.get('/', appointmentController.getAllAppointments);

// عرض مواعيد اليوم
router.get('/today', appointmentController.getTodayAppointments);

// عرض مواعيد طبيب محدد
router.get('/doctor/:doctorId', appointmentController.getDoctorAppointments);

// عرض موعد محدد
router.get('/:id', appointmentController.getAppointmentById);

// تحديث موعد (للاستقبال والدكتور)
router.put('/:id', appointmentBelongsToDoctor, appointmentController.updateAppointment);

// إلغاء موعد (للاستقبال والدكتور)
router.patch('/:id/cancel', appointmentBelongsToDoctor, appointmentController.cancelAppointment);

// حذف موعد (للاستقبال فقط)
router.delete('/:id', receptionistOnly, appointmentController.deleteAppointment);

// إحصائيات المواعيد
router.get('/stats/summary', appointmentController.getAppointmentStats);

module.exports = router;
