const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect } = require('../middleware/auth');
const { receptionistOnly, doctorOnly, patientBelongsToDoctor } = require('../middleware/roles');

// جميع المسارات تتطلب توثيق
router.use(protect);

// إضافة مريض جديد (الكل)
router.post('/', patientController.createPatient);

// عرض جميع المرضى (للاستقبال والمشرف) - السطر 10
router.get('/all', receptionistOnly, patientController.getAllPatients);

// عرض مرضى الدكتور فقط (للدكتور) - السطر 12
router.get('/my-patients', doctorOnly, patientController.getDoctorPatients);

// عرض مريض محدد - السطر 14
router.get('/:id', patientBelongsToDoctor, patientController.getPatientById);

// تحديث بيانات مريض (للاستقبال والدكتور) - السطر 16
router.put('/:id', patientBelongsToDoctor, patientController.updatePatient);

// البحث عن مريض - السطر 18
router.get('/search/:query', patientController.searchPatients);

// إحصائيات المرضى - السطر 20
router.get('/stats/summary', patientController.getPatientStats);

module.exports = router;
