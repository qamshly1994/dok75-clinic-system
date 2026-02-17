/**
 * ============================================
 * وحدة تحكم المستخدمين (User Controller)
 * نسخة محدثة مع صلاحيات كاملة للمشرف
 * ============================================
 */

const { User, Clinic } = require('../models');
const bcrypt = require('bcryptjs');

// إنشاء مستخدم جديد (للمشرف فقط)
const createUser = async (req, res) => {
    try {
        const { username, password, full_name, role, clinic_id, phone, email, specialization } = req.body;

        // التحقق من أن الدور صحيح
        if (!['admin', 'doctor', 'receptionist'].includes(role)) {
            return res.status(400).json({ error: 'دور غير صالح' });
        }

        // التحقق من وجود اسم المستخدم
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل' });
        }

        // التحقق من وجود العيادة إذا تم تحديدها
        if (clinic_id) {
            const clinic = await Clinic.findByPk(clinic_id);
            if (!clinic) {
                return res.status(400).json({ error: 'العيادة غير موجودة' });
            }
        }

        // تشفير كلمة المرور
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // إنشاء المستخدم
        const user = await User.create({
            username,
            password: hashedPassword,
            full_name,
            role,
            clinic_id: clinic_id || null,
            phone,
            email,
            specialization: role === 'doctor' ? specialization : null,
            is_active: true
        });

        // جلب المستخدم مع العيادة
        const createdUser = await User.findByPk(user.id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Clinic }]
        });

        res.status(201).json({
            success: true,
            message: 'تم إنشاء المستخدم بنجاح',
            user: createdUser
        });

    } catch (error) {
        console.error('❌ خطأ في إنشاء المستخدم:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض جميع المستخدمين (للمشرف فقط)
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            include: [{ model: Clinic }],
            order: [['createdAt', 'DESC']]
        });

        res.json({ 
            success: true, 
            count: users.length, 
            users 
        });
    } catch (error) {
        console.error('❌ خطأ في جلب المستخدمين:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض مستخدم محدد
const getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Clinic }]
        });

        if (!user) {
            return res.status(404).json({ error: 'المستخدم غير موجود' });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('❌ خطأ في جلب المستخدم:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// تحديث بيانات مستخدم (للمشرف فقط)
const updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'المستخدم غير موجود' });
        }

        // منع تحديث المشرف لنفسه بصلاحيات أقل
        if (user.id === req.user.id && req.body.role && req.body.role !== 'admin') {
            return res.status(403).json({ error: 'لا يمكنك تغيير دورك كمشرف' });
        }

        const { full_name, role, clinic_id, phone, email, specialization, password } = req.body;

        const updateData = {
            full_name: full_name || user.full_name,
            role: role || user.role,
            clinic_id: clinic_id !== undefined ? clinic_id : user.clinic_id,
            phone: phone || user.phone,
            email: email || user.email,
            specialization: role === 'doctor' ? specialization : user.specialization
        };

        if (password) {
            const salt = await bcrypt.genSalt(10);
            updateData.password = await bcrypt.hash(password, salt);
        }

        await user.update(updateData);

        const updatedUser = await User.findByPk(user.id, {
            attributes: { exclude: ['password'] },
            include: [{ model: Clinic }]
        });

        res.json({
            success: true,
            message: 'تم تحديث البيانات بنجاح',
            user: updatedUser
        });
    } catch (error) {
        console.error('❌ خطأ في تحديث المستخدم:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// تغيير حالة المستخدم (تفعيل/تعطيل)
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'المستخدم غير موجود' });
        }

        // منع تعطيل المشرف العام
        if (user.role === 'admin') {
            return res.status(403).json({ error: 'لا يمكن تغيير حالة مدير النظام' });
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

// حذف مستخدم (للمشرف فقط)
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'المستخدم غير موجود' });
        }

        // منع حذف المشرف العام
        if (user.role === 'admin') {
            return res.status(403).json({ error: 'لا يمكن حذف مدير النظام' });
        }

        // منع المستخدم من حذف نفسه
        if (user.id === req.user.id) {
            return res.status(403).json({ error: 'لا يمكنك حذف نفسك' });
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

// إحصائيات المستخدمين
const getUserStats = async (req, res) => {
    try {
        const total = await User.count();
        const admins = await User.count({ where: { role: 'admin' } });
        const doctors = await User.count({ where: { role: 'doctor' } });
        const receptionists = await User.count({ where: { role: 'receptionist' } });
        const active = await User.count({ where: { is_active: true } });

        res.json({
            success: true,
            stats: {
                total,
                admins,
                doctors,
                receptionists,
                active
            }
        });
    } catch (error) {
        console.error('❌ خطأ في جلب الإحصائيات:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    getUserById,
    updateUser,
    toggleUserStatus,
    deleteUser,
    getUserStats
};
