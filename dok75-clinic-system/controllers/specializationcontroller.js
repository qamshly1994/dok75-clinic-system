/**
 * ============================================
 * وحدة تحكم التخصصات (Specialization Controller)
 * ============================================
 */

const { Specialization, Department } = require('../models');

// ✅ إنشاء تخصص جديد
const createSpecialization = async (req, res) => {
    try {
        const { name, description, department_id, price_range, duration } = req.body;

        // التحقق من وجود القسم
        const department = await Department.findByPk(department_id);
        if (!department) {
            return res.status(404).json({ error: 'القسم غير موجود' });
        }

        // إنشاء التخصص
        const specialization = await Specialization.create({
            name,
            description,
            department_id,
            price_range,
            duration: duration || 30,
            is_active: true
        });

        res.status(201).json({
            success: true,
            message: 'تم إنشاء التخصص بنجاح',
            specialization
        });

    } catch (error) {
        console.error('❌ خطأ في إنشاء التخصص:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ عرض جميع التخصصات
const getAllSpecializations = async (req, res) => {
    try {
        const specializations = await Specialization.findAll({
            include: [{ model: Department, as: 'department' }],
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            count: specializations.length,
            specializations
        });
    } catch (error) {
        console.error('❌ خطأ في جلب التخصصات:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ عرض تخصص محدد
const getSpecializationById = async (req, res) => {
    try {
        const specialization = await Specialization.findByPk(req.params.id, {
            include: [{ model: Department, as: 'department' }]
        });

        if (!specialization) {
            return res.status(404).json({ error: 'التخصص غير موجود' });
        }

        res.json({ 
            success: true, 
            specialization 
        });
    } catch (error) {
        console.error('❌ خطأ في جلب التخصص:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ تحديث بيانات تخصص
const updateSpecialization = async (req, res) => {
    try {
        const specialization = await Specialization.findByPk(req.params.id);

        if (!specialization) {
            return res.status(404).json({ error: 'التخصص غير موجود' });
        }

        const { name, description, price_range, duration } = req.body;

        await specialization.update({
            name: name || specialization.name,
            description: description || specialization.description,
            price_range: price_range || specialization.price_range,
            duration: duration || specialization.duration
        });

        res.json({
            success: true,
            message: 'تم تحديث بيانات التخصص بنجاح',
            specialization
        });
    } catch (error) {
        console.error('❌ خطأ في تحديث التخصص:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ حذف تخصص
const deleteSpecialization = async (req, res) => {
    try {
        const specialization = await Specialization.findByPk(req.params.id);

        if (!specialization) {
            return res.status(404).json({ error: 'التخصص غير موجود' });
        }

        await specialization.destroy();

        res.json({ 
            success: true, 
            message: 'تم حذف التخصص بنجاح' 
        });
    } catch (error) {
        console.error('❌ خطأ في حذف التخصص:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ تغيير حالة التخصص
const toggleSpecializationStatus = async (req, res) => {
    try {
        const specialization = await Specialization.findByPk(req.params.id);

        if (!specialization) {
            return res.status(404).json({ error: 'التخصص غير موجود' });
        }

        await specialization.update({ is_active: !specialization.is_active });

        res.json({
            success: true,
            message: specialization.is_active ? 'تم تفعيل التخصص' : 'تم تعطيل التخصص',
            is_active: specialization.is_active
        });
    } catch (error) {
        console.error('❌ خطأ في تغيير حالة التخصص:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

module.exports = {
    createSpecialization,
    getAllSpecializations,
    getSpecializationById,
    updateSpecialization,
    deleteSpecialization,
    toggleSpecializationStatus
};
