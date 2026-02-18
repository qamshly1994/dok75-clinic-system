const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');
const { protect } = require('../middleware/auth');
const { doctorOnly } = require('../middleware/roles');

// جميع المسارات تتطلب توثيق
router.use(protect);

// إنشاء زيارة جديدة (للدكتور فقط)
router.post('/', doctorOnly, visitController.createVisit);

// عرض زيارات مريض محدد
router.get('/patient/:patientId', visitController.getPatientVisits);

// عرض زيارة محددة
router.get('/:id', visitController.getVisitById);

// تحديث زيارة (للدكتور الذي أنشأها)
router.put('/:id', doctorOnly, visitController.updateVisit);

module.exports = router;
