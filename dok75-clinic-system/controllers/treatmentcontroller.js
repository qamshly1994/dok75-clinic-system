/**
 * ============================================
 * وحدة تحكم الخدمات (Treatment Controller)
 * ============================================
 */

const { Treatment, Department, Clinic, Specialization } = require('../models');

// ✅ إنشاء خدمة/علاج جديد
const createTreatment = async (req, res) => {
    try {
        const { name, description, price, duration, department_id, specialization_id, clinic_id } = req.body;

        // التحقق من وجود القسم
        const department = await Department.findByPk(department_id);
        if (!department) {
            return res.status(404).json({ error: 'القسم غير موجود' });
        }

        // إنشاء الخدمة
        const treatment = await Treatment.create({
            name,
            description,
            price,
            duration: duration || 30,
            department_id,
            specialization_id,
            clinic_id,
            is_active: true
        });

        res.status(201).json({
            success: true,
            message: 'تم إنشاء الخدمة بنجاح',
            treatment
        });

    } catch (error) {
        console.error('❌ خطأ في إنشاء الخدمة:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ عرض جميع الخدمات
const getAllTreatments = async (req, res) => {
    try {
        const treatments = await Treatment.findAll({
            where: { is_active: true },
            include: [
                { model: Department, as: 'department' },
                { model: Specialization, as: 'specialization' },
                { model: Clinic, as: 'clinic' }
            ],
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            count: treatments.length,
            treatments
        });
    } catch (error) {
        console.error('❌ خطأ في جلب الخدمات:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ عرض خدمة محددة
const getTreatmentById = async (req, res) => {
    try {
        const treatment = await Treatment.findByPk(req.params.id, {
            include: [
                { model: Department, as: 'department' },
                { model: Specialization, as: 'specialization' },
                { model: Clinic, as: 'clinic' }
            ]
        });

        if (!treatment) {
            return res.status(404).json({ error: 'الخدمة غير موجودة' });
        }

        res.json({ 
            success: true, 
            treatment 
        });
    } catch (error) {
        console.error('❌ خطأ في جلب الخدمة:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ تحديث بيانات خدمة
const updateTreatment = async (req, res) => {
    try {
        const treatment = await Treatment.findByPk(req.params.id);

        if (!treatment) {
            return res.status(404).json({ error: 'الخدمة غير موجودة' });
        }

        const { name, description, price, duration } = req.body;

        await treatment.update({
            name: name || treatment.name,
            description: description || treatment.description,
            price: price || treatment.price,
            duration: duration || treatment.duration
        });

        res.json({
            success: true,
            message: 'تم تحديث بيانات الخدمة بنجاح',
            treatment
        });
    } catch (error) {
        console.error('❌ خطأ في تحديث الخدمة:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ حذف خدمة
const deleteTreatment = async (req, res) => {
    try {
        const treatment = await Treatment.findByPk(req.params.id);

        if (!treatment) {
            return res.status(404).json({ error: 'الخدمة غير موجودة' });
        }

        await treatment.destroy();

        res.json({ 
            success: true, 
            message: 'تم حذف الخدمة بنجاح' 
        });
    } catch (error) {
        console.error('❌ خطأ في حذف الخدمة:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ عرض خدمات قسم محدد
const getTreatmentsByDepartment = async (req, res) => {
    try {
        const { departmentId } = req.params;

        const treatments = await Treatment.findAll({
            where: { department_id: departmentId, is_active: true },
            order: [['price', 'ASC']]
        });

        res.json({
            success: true,
            count: treatments.length,
            treatments
        });
    } catch (error) {
        console.error('❌ خطأ في جلب خدمات القسم:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

module.exports = {
    createTreatment,
    getAllTreatments,
    getTreatmentById,
    updateTreatment,
    deleteTreatment,
    getTreatmentsByDepartment
};
