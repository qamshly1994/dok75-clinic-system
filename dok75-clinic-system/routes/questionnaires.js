const express = require('express');
const router = express.Router();
const questionnaireController = require('../controllers/questionnaireController');
const { protect } = require('../middleware/auth');
const { doctorOnly } = require('../middleware/roles');

// جميع المسارات تتطلب توثيق
router.use(protect);

// إنشاء استبيان جديد
router.post('/', doctorOnly, questionnaireController.createQuestionnaire);

// عرض استبيانات مريض معين
router.get('/patient/:patientId', questionnaireController.getPatientQuestionnaires);

// عرض استبيان محدد
router.get('/:id', questionnaireController.getQuestionnaireById);

// تحديث استبيان
router.put('/:id', doctorOnly, questionnaireController.updateQuestionnaire);

module.exports = router;
