const express = require('express');
const router = express.Router();
const questionnaireController = require('../controllers/questionnaireController');
const { protect } = require('../middleware/auth');

// جميع المسارات تتطلب توثيق
router.use(protect);

// إنشاء استبيان جديد
router.post('/', questionnaireController.createQuestionnaire);

// عرض استبيانات مريض
router.get('/patient/:patientId', questionnaireController.getPatientQuestionnaires);

module.exports = router;
