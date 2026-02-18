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

// البحث عن مريض - يجب أن يأتي قبل /:id
router.get('/search/:query', patientController.searchPatients);

// إحصائيات المرضى - يجب أن تأتي قبل /:id
router.get('/stats/summary', patientController.getPatientStats);

// عرض مريض محدد - يأتي في النهاية
router.get('/:id', patientBelongsToDoctor, patientController.getPatientById);

// تحديث بيانات مريض (للاستقبال والدكتور)
router.put('/:id', patientBelongsToDoctor, patientController.updatePatient);

module.exports = router;
