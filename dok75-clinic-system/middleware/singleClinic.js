/**
 * ============================================
 * وسيط العيادة الواحدة (Single Clinic)
 * يضمن أن جميع العمليات تتم على عيادة واحدة
 * الموقع: /middleware/singleClinic.js
 * ============================================
 */

const { Clinic } = require('../models');

// التأكد من وجود عيادة واحدة فقط
const ensureSingleClinic = async (req, res, next) => {
    try {
        // جلب العيادة الوحيدة أو إنشاؤها
        let clinic = await Clinic.findOne({ where: { id: process.env.SINGLE_CLINIC_ID || 1 } });
        
        if (!clinic) {
            // إنشاء العيادة الافتراضية
            clinic = await Clinic.create({
                id: process.env.SINGLE_CLINIC_ID || 1,
                name: process.env.SINGLE_CLINIC_NAME || 'مركز DOK75 الطبي',
                address: 'المركز الرئيسي',
                phone: process.env.DEV_PHONE || '0995973668',
                is_active: true
            });
            console.log('✅ تم إنشاء العيادة الوحيدة');
        }
        
        // إضافة معرف العيادة للطلب
        req.clinicId = clinic.id;
        next();
    } catch (error) {
        console.error('❌ خطأ في وسيط العيادة:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// إجبار جميع الطلبات على استخدام نفس العيادة
const enforceSingleClinic = (req, res, next) => {
    // إضافة clinic_id تلقائياً للطلبات التي تحتاجه
    if (req.method === 'POST' || req.method === 'PUT') {
        if (!req.body.clinic_id) {
            req.body.clinic_id = parseInt(process.env.SINGLE_CLINIC_ID || '1');
        }
    }
    next();
};

module.exports = { ensureSingleClinic, enforceSingleClinic };
