const express = require('express');
const router = express.Router();
const visitController = require('../controllers/visitController');
const { protect } = require('../middleware/auth');
const { doctorOnly, doctorOwnPatient } = require('../middleware/roles');

// جميع المسارات تتطلب توثيق
router.use(protect);

// إنشاء زيارة جديدة (للدكتور فقط)
router.post('/', doctorOnly, visitController.createVisit);

// عرض جميع الزيارات (للأدمن)
router.get('/', (req, res, next) => {
    if (req.user.role === 'admin') {
        return visitController.getAllVisits(req, res);
    }
    return res.status(403).json({ error: 'غير مصرح' });
});

// عرض زيارات مريض محدد
router.get('/patient/:patientId', doctorOwnPatient, visitController.getPatientVisits);

// عرض زيارة محددة
router.get('/:id', visitController.getVisitById);

// تحديث زيارة (للدكتور الذي أنشأها)
router.put('/:id', doctorOnly, visitController.updateVisit);

// حذف زيارة (للأدمن فقط)
router.delete('/:id', (req, res, next) => {
    if (req.user.role === 'admin') {
        return visitController.deleteVisit(req, res);
    }
    return res.status(403).json({ error: 'غير مصرح' });
});

// إحصائيات الزيارات
router.get('/stats/summary', visitController.getVisitStats);

module.exports = router;
