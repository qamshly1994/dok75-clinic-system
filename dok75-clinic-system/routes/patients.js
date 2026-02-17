const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patientController');
const { protect } = require('../middleware/auth');
const { doctorOnly, receptionistOnly } = require('../middleware/roles');

// جميع المسارات تتطلب توثيق
router.use(protect);

// إضافة مريض جديد (للاستقبال والدكتور)
router.post('/', patientController.createPatient);

// عرض مرضى الدكتور فقط (للدكتور)
router.get('/my-patients', doctorOnly, patientController.getDoctorPatients);

// عرض جميع المرضى (للاستقبال)
router.get('/all', receptionistOnly, patientController.getAllPatients);

// عرض ملف مريض كامل
router.get('/:id/record', patientController.getPatientFullRecord);

// البحث عن مريض
router.get('/search/:query', patientController.searchPatients);

module.exports = router;
