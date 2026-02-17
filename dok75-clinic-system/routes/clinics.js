const express = require('express');
const router = express.Router();
const clinicController = require('../controllers/clinicController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/roles');

// جميع المسارات تتطلب توثيق وصلاحية أدمن
router.use(protect);
router.use(adminOnly);

// إنشاء عيادة جديدة
router.post('/', clinicController.createClinic);

// عرض جميع العيادات
router.get('/', clinicController.getAllClinics);

// عرض عيادة محددة
router.get('/:id', clinicController.getClinicById);

// تحديث بيانات عيادة
router.put('/:id', clinicController.updateClinic);

// حذف عيادة
router.delete('/:id', clinicController.deleteClinic);

module.exports = router;
