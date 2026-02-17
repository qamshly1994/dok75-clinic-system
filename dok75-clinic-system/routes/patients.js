const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect } = require('../middleware/auth');
const { adminOnly, doctorOnly, receptionistOnly, doctorOwnPatient } = require('../middleware/roles');

// جميع المسارات تتطلب توثيق
router.use(protect);

// إضافة مريض جديد (للاستقبال والدكتور)
router.post('/', receptionistOnly, patientController.createPatient);

// عرض جميع المرضى (للأدمن والاستقبال)
router.get('/', (req, res, next) => {
    if (req.user.role === 'doctor') {
        return patientController.getDoctorPatients(req, res);
    }
    return patientController.getAllPatients(req, res);
});

// عرض مريض محدد مع صلاحيات
router.get('/:id', doctorOwnPatient, patientController.getPatientById);

// تحديث بيانات مريض (للاستقبال والأدمن)
router.put('/:id', receptionistOnly, patientController.updatePatient);

// حذف مريض (للأدمن فقط)
router.delete('/:id', adminOnly, patientController.deletePatient);

// البحث عن مريض
router.get('/search/:query', patientController.searchPatients);

// سجل زيارات المريض
router.get('/:id/visits', doctorOwnPatient, patientController.getPatientVisits);

// إحصائيات المرضى
router.get('/stats/summary', patientController.getPatientStats);

module.exports = router;
