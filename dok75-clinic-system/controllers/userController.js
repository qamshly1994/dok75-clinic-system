/**
 * ============================================
 * وحدة تحكم المستخدمين (User Controller)
 * ============================================
 */

const { User, Clinic, Department, Specialization } = require('../models');

// ✅ إنشاء مستخدم جديد
const createUser = async (req, res) => {
    try {
        const { username, password, full_name, role, clinic_id, department_id, specialization_id, phone, email } = req.body;

        // التحقق من وجود اسم المستخدم
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل' });
        }

        // إنشاء المستخدم
        const user = await User.create({
            username,
            password,
            full_name,
            role,
            clinic_id,
            department_id,
            specialization_id,
            phone,
            email,
            is_active: true
        });

        res.status(201).json({
            success: true,
            message: 'تم إنشاء المستخدم بنجاح',
            user: user.toJSON()
        });

    } catch (error) {
        console.error('❌ خطأ في إنشاء المستخدم:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ عرض جميع المستخدمين
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            include: [
                { model: Clinic, as: 'clinic' },
                { model: Department, as: 'department' },
                { model: Specialization, as: 'specialization' }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ 
            success: true, 
            users 
        });
    } catch (error) {
        console.error('❌ خطأ في جلب المستخدمين:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ عرض مستخدم محدد
const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: [
                { model: Clinic, as: 'clinic' },
                { model: Department, as: 'department' },
                { model: Specialization, as: 'specialization' }
            ]
        });

        if (!user) {
            return res.status(404).json({ error: 'المستخدم غير موجود' });
        }

        res.json({ 
            success: true, 
            user 
        });
    } catch (error) {
        console.error('❌ خطأ في جلب المستخدم:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ تحديث بيانات مستخدم
const updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'المستخدم غير موجود' });
        }

        const { full_name, role, clinic_id, department_id, specialization_id, phone, email } = req.body;

        await user.update({
            full_name: full_name || user.full_name,
            role: role || user.role,
            clinic_id: clinic_id || user.clinic_id,
            department_id: department_id || user.department_id,
            specialization_id: specialization_id || user.specialization_id,
            phone: phone || user.phone,
            email: email || user.email
        });

        res.json({
            success: true,
            message: 'تم تحديث البيانات بنجاح',
            user: user.toJSON()
        });
    } catch (error) {
        console.error('❌ خطأ في تحديث المستخدم:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ حذف مستخدم
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'المستخدم غير موجود' });
        }

        if (user.role === 'super_admin') {
            return res.status(403).json({ error: 'لا يمكن حذف المشرف العام' });
        }

        await user.destroy();

        res.json({ 
            success: true, 
            message: 'تم حذف المستخدم بنجاح' 
        });
    } catch (error) {
        console.error('❌ خطأ في حذف المستخدم:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ تغيير حالة المستخدم
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'المستخدم غير موجود' });
        }

        if (user.role === 'super_admin') {
            return res.status(403).json({ error: 'لا يمكن تغيير حالة المشرف العام' });
        }

        await user.update({ is_active: !user.is_active });

        res.json({
            success: true,
            message: user.is_active ? 'تم تفعيل المستخدم' : 'تم تعطيل المستخدم'
        });
    } catch (error) {
        console.error('❌ خطأ في تغيير حالة المستخدم:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

module.exports = { 
    createUser, 
    getAllUsers, 
    getUserById, 
    updateUser, 
    deleteUser, 
    toggleUserStatus 
};
