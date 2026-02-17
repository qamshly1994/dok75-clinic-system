const express = require('express');
const router = express.Router();
const questionnaireController = require('../controllers/questionnaireController');
const { protect } = require('../middleware/auth');
const { doctorOnly } = require('../middleware/roles');

// جميع المسارات تتطلب توثيق وصلاحية دكتور
router.use(protect);
router.use(doctorOnly);

// إضافة استبيان جديد
router.post('/', questionnaireController.createQuestionnaire);

// عرض استبيانات مريض
router.get('/patient/:patientId', questionnaireController.getPatientQuestionnaires);

module.exports = router;
