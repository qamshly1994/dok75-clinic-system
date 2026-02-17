const { User, Clinic } = require('../models');
const bcrypt = require('bcryptjs');

// إنشاء مستخدم جديد (دكتور أو موظف)
const createUser = async (req, res) => {
    try {
        const { username, password, full_name, role, phone, email } = req.body;

        // التحقق من وجود اسم المستخدم
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل' });
        }

        // العيادة الافتراضية (عيادة واحدة)
        const clinic = await Clinic.findOne();
        const clinic_id = clinic ? clinic.id : 1;

        // تشفير كلمة المرور
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // إنشاء المستخدم
        const user = await User.create({
            username,
            password: hashedPassword,
            full_name,
            role,
            clinic_id,
            phone,
            email,
            is_active: true
        });

        res.status(201).json({
            success: true,
            message: 'تم إنشاء المستخدم بنجاح',
            user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                role: user.role
            }
        });

    } catch (error) {
        console.error('❌ خطأ:', error);
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

        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// تحديث حالة المستخدم (تفعيل/تعطيل)
const toggleUserStatus = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'المستخدم غير موجود' });
        }

        // منع تعطيل المشرف العام
        if (user.role === 'super_admin') {
            return res.status(403).json({ error: 'لا يمكن تغيير حالة المشرف العام' });
        }

        await user.update({ is_active: !user.is_active });

        res.json({
            success: true,
            message: user.is_active ? '✅ تم تفعيل المستخدم' : '✅ تم تعطيل المستخدم'
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

        if (user.role === 'super_admin') {
            return res.status(403).json({ error: 'لا يمكن حذف المشرف العام' });
        }

        await user.destroy();

        res.json({
            success: true,
            message: '✅ تم حذف المستخدم بنجاح'
        });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

module.exports = {
    createUser,
    getAllUsers,
    toggleUserStatus,
    deleteUser
};
