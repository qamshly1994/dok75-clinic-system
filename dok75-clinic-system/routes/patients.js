const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect } = require('../middleware/auth');
const { receptionistOnly, doctorOnly, patientBelongsToDoctor } = require('../middleware/roles');

// جميع المسارات تتطلب توثيق
router.use(protect);

// إضافة مريض جديد (الكل)
router.post('/', patientController.createPatient);

// عرض جميع المرضى (للاستقبال والمشرف)
router.get('/all', receptionistOnly, patientController.getAllPatients);

// عرض مرضى الدكتور فقط (للدكتور)
router.get('/my-patients', doctorOnly, patientController.getDoctorPatients);

// عرض مريض محدد
router.get('/:id', patientBelongsToDoctor, patientController.getPatientById);

// تحديث بيانات مريض (للاستقبال والدكتور)
router.put('/:id', patientBelongsToDoctor, patientController.updatePatient);

// البحث عن مريض
router.get('/search/:query', patientController.searchPatients);

// إحصائيات المرضى
router.get('/stats/summary', patientController.getPatientStats);

module.exports = router;
