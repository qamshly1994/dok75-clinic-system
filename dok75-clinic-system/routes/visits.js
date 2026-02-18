const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');
const { protect } = require('../middleware/auth');

// جميع المسارات تتطلب توثيق
router.use(protect);

// إنشاء زيارة جديدة
router.post('/', visitController.createVisit);                   // السطر 8

// عرض زيارات مريض محدد
router.get('/patient/:patientId', visitController.getPatientVisits); // السطر 10

// عرض زيارة محددة
router.get('/:id', visitController.getVisitById);                // السطر 12

// تحديث زيارة
router.put('/:id', visitController.updateVisit);                 // السطر 14

module.exports = router;
