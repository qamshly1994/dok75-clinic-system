/**
 * ============================================
 * مسارات الاستبيانات (Questionnaires)
 * حسب تخصصات العيادة
 * الموقع: /routes/questionnaires.js
 * ============================================
 */

const express = require('express');
const router = express.Router();
const questionnaireController = require('../controllers/questionnaireController');
const { protect } = require('../middleware/auth');
const { doctorOnly } = require('../middleware/roles');

// جميع المسارات تتطلب توثيق
router.use(protect);

// إنشاء استبيان جديد (للدكتور فقط)
router.post('/', doctorOnly, questionnaireController.createQuestionnaire);

// عرض استبيانات مريض معين
router.get('/patient/:patientId', questionnaireController.getPatientQuestionnaires);

// عرض استبيان محدد
router.get('/:id', questionnaireController.getQuestionnaireById);

// تحديث استبيان
router.put('/:id', doctorOnly, questionnaireController.updateQuestionnaire);

// عرض استبيانات قسم معين
router.get('/department/:departmentId', doctorOnly, questionnaireController.getDepartmentQuestionnaires);

module.exports = router;
