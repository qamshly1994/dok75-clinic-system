const { User, Clinic } = require('../models');

// إنشاء مستخدم جديد
const createUser = async (req, res) => {
    try {
        const { username, password, full_name, role, clinic_id, phone, email, specialization } = req.body;

        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل' });
        }

        const user = await User.create({
            username,
            password,
            full_name,
            role,
            clinic_id,
            phone,
            email,
            specialization,
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

// عرض جميع المستخدمين
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] },
            include: [{ model: Clinic }],
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, count: users.length, users });
    } catch (error) {
        console.error('❌ خطأ:', error);
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
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// تحديث بيانات مستخدم
const updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'المستخدم غير موجود' });
        }

        const { full_name, role, clinic_id, phone, email, specialization, password } = req.body;

        const updateData = {
            full_name: full_name || user.full_name,
            role: role || user.role,
            clinic_id: clinic_id !== undefined ? clinic_id : user.clinic_id,
            phone: phone || user.phone,
            email: email || user.email,
            specialization: specialization || user.specialization
        };

        if (password) {
            updateData.password = password;
        }

        await user.update(updateData);

        res.json({
            success: true,
            message: 'تم تحديث البيانات بنجاح',
            user: user.toJSON()
        });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// تغيير حالة المستخدم
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'المستخدم غير موجود' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ error: 'لا يمكن تغيير حالة مدير النظام' });
        }

        await user.update({ is_active: !user.is_active });

        res.json({
            success: true,
            message: user.is_active ? 'تم تفعيل المستخدم' : 'تم تعطيل المستخدم'
        });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// حذف مستخدم
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'المستخدم غير موجود' });
        }

        if (user.role === 'admin') {
            return res.status(403).json({ error: 'لا يمكن حذف مدير النظام' });
        }

        await user.destroy();

        res.json({ success: true, message: 'تم حذف المستخدم بنجاح' });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// إحصائيات المستخدمين
const getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const admins = await User.count({ where: { role: 'admin' } });
        const doctors = await User.count({ where: { role: 'doctor' } });
        const receptionists = await User.count({ where: { role: 'receptionist' } });
        const activeUsers = await User.count({ where: { is_active: true } });

        res.json({
            success: true,
            stats: {
                total: totalUsers,
                admins,
                doctors,
                receptionists,
                active: activeUsers
            }
        });
    } catch (error) {
        console.error('❌ خطأ:', error);
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
