/**
 * ============================================
 * وحدة تحكم الأقسام (Department Controller)
 * ============================================
 */

const { Department, Specialization, Clinic } = require('../models');

// ✅ إنشاء قسم جديد
const createDepartment = async (req, res) => {
    try {
        const { name, description, icon, clinic_id } = req.body;

        // التحقق من وجود العيادة
        const clinic = await Clinic.findByPk(clinic_id);
        if (!clinic) {
            return res.status(404).json({ error: 'العيادة غير موجودة' });
        }

        // إنشاء القسم
        const department = await Department.create({
            name,
            description,
            icon: icon || '🏥',
            clinic_id,
            is_active: true
        });

        res.status(201).json({
            success: true,
            message: 'تم إنشاء القسم بنجاح',
            department
        });

    } catch (error) {
        console.error('❌ خطأ في إنشاء القسم:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ عرض جميع الأقسام
const getAllDepartments = async (req, res) => {
    try {
        const departments = await Department.findAll({
            include: [
                { model: Clinic, as: 'clinic' },
                { 
                    model: Specialization, 
                    as: 'specializations',
                    where: { is_active: true },
                    required: false
                }
            ],
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            count: departments.length,
            departments
        });
    } catch (error) {
        console.error('❌ خطأ في جلب الأقسام:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ عرض قسم محدد
const getDepartmentById = async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id, {
            include: [
                { model: Clinic, as: 'clinic' },
                { 
                    model: Specialization, 
                    as: 'specializations',
                    where: { is_active: true },
                    required: false
                }
            ]
        });

        if (!department) {
            return res.status(404).json({ error: 'القسم غير موجود' });
        }

        res.json({ 
            success: true, 
            department 
        });
    } catch (error) {
        console.error('❌ خطأ في جلب القسم:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ تحديث بيانات قسم
const updateDepartment = async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id);

        if (!department) {
            return res.status(404).json({ error: 'القسم غير موجود' });
        }

        const { name, description, icon } = req.body;

        await department.update({
            name: name || department.name,
            description: description || department.description,
            icon: icon || department.icon
        });

        res.json({
            success: true,
            message: 'تم تحديث بيانات القسم بنجاح',
            department
        });
    } catch (error) {
        console.error('❌ خطأ في تحديث القسم:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ حذف قسم
const deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id);

        if (!department) {
            return res.status(404).json({ error: 'القسم غير موجود' });
        }

        // التحقق من عدم وجود تخصصات تابعة
        const specializationsCount = await Specialization.count({ 
            where: { department_id: department.id } 
        });
        
        if (specializationsCount > 0) {
            return res.status(400).json({ 
                error: 'لا يمكن حذف القسم لأنه يحتوي على تخصصات',
                specializationsCount
            });
        }

        await department.destroy();

        res.json({ 
            success: true, 
            message: 'تم حذف القسم بنجاح' 
        });
    } catch (error) {
        console.error('❌ خطأ في حذف القسم:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ تغيير حالة القسم
const toggleDepartmentStatus = async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id);

        if (!department) {
            return res.status(404).json({ error: 'القسم غير موجود' });
        }

        await department.update({ is_active: !department.is_active });

        res.json({
            success: true,
            message: department.is_active ? 'تم تفعيل القسم' : 'تم تعطيل القسم',
            is_active: department.is_active
        });
    } catch (error) {
        console.error('❌ خطأ في تغيير حالة القسم:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ عرض التخصصات التابعة لقسم
const getDepartmentSpecializations = async (req, res) => {
    try {
        const department = await Department.findByPk(req.params.id);

        if (!department) {
            return res.status(404).json({ error: 'القسم غير موجود' });
        }

        const specializations = await Specialization.findAll({
            where: { department_id: department.id, is_active: true },
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

module.exports = {
    createDepartment,
    getAllDepartments,
    getDepartmentById,
    updateDepartment,
    deleteDepartment,
    toggleDepartmentStatus,
    getDepartmentSpecializations
};
