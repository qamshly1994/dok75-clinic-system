/**
 * ============================================
 * وحدة تحكم المستخدمين (User Controller)
 * نسخة محدثة مع ربط الأطباء بالعيادات تلقائياً
 * ============================================
 */

const { User, Clinic, Department, Specialization } = require('../models');

// ✅ إنشاء مستخدم جديد (محدث لربط الأطباء بالعيادات)
const createUser = async (req, res) => {
    try {
        let { username, password, full_name, role, clinic_id, department_id, specialization_id, phone, email } = req.body;

        // التحقق من وجود اسم المستخدم
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ error: 'اسم المستخدم موجود بالفعل' });
        }

        // ============================================
        // تحسين: ربط الأطباء بعيادة افتراضية تلقائياً
        // ============================================
        if (role === 'doctor' && !clinic_id) {
            // البحث عن أول عيادة متاحة
            const firstClinic = await Clinic.findOne({ where: { is_active: true } });
            
            if (firstClinic) {
                clinic_id = firstClinic.id;
                console.log(`✅ تم ربط الدكتور ${username} بالعيادة: ${firstClinic.name}`);
            } else {
                // إذا لم يتم العثور على عيادة، إنشاء عيادة افتراضية
                console.log('⚠️ لا توجد عيادات، جاري إنشاء عيادة افتراضية...');
                
                const defaultClinic = await Clinic.create({
                    name: 'العيادة الرئيسية',
                    address: 'المركز الرئيسي',
                    phone: process.env.DEV_PHONE || '0995973668',
                    description: 'عيادة افتراضية تم إنشاؤها تلقائياً',
                    is_active: true
                });
                
                clinic_id = defaultClinic.id;
                console.log(`✅ تم إنشاء عيادة افتراضية: ${defaultClinic.name}`);
            }
        }

        // ============================================
        // تحسين: ربط الموظفين بعيادة افتراضية (اختياري)
        // ============================================
        if (role === 'receptionist' && !clinic_id) {
            const firstClinic = await Clinic.findOne({ where: { is_active: true } });
            if (firstClinic) {
                clinic_id = firstClinic.id;
            }
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

        // جلب المستخدم مع العلاقات
        const createdUser = await User.findByPk(user.id, {
            attributes: { exclude: ['password'] },
            include: [
                { model: Clinic, as: 'clinic' },
                { model: Department, as: 'department' },
                { model: Specialization, as: 'specialization' }
            ]
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
            count: users.length,
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

// ✅ تحديث بيانات مستخدم (محدث لربط الأطباء بالعيادات)
const updateUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'المستخدم غير موجود' });
        }

        const { full_name, role, clinic_id, department_id, specialization_id, phone, email, password } = req.body;

        // تحضير بيانات التحديث
        const updateData = {
            full_name: full_name || user.full_name,
            role: role || user.role,
            clinic_id: clinic_id !== undefined ? clinic_id : user.clinic_id,
            department_id: department_id !== undefined ? department_id : user.department_id,
            specialization_id: specialization_id !== undefined ? specialization_id : user.specialization_id,
            phone: phone || user.phone,
            email: email || user.email
        };

        // إذا تم إرسال كلمة مرور جديدة، قم بتحديثها
        if (password) {
            updateData.password = password;
        }

        await user.update(updateData);

        // جلب المستخدم المحدث مع العلاقات
        const updatedUser = await User.findByPk(user.id, {
            attributes: { exclude: ['password'] },
            include: [
                { model: Clinic, as: 'clinic' },
                { model: Department, as: 'department' },
                { model: Specialization, as: 'specialization' }
            ]
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

// ✅ حذف مستخدم
const deleteUser = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);

        if (!user) {
            return res.status(404).json({ error: 'المستخدم غير موجود' });
        }

        // منع حذف المشرف العام
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

// ✅ تغيير حالة المستخدم (تفعيل/تعطيل)
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
            message: user.is_active ? '✅ تم تفعيل المستخدم' : '✅ تم تعطيل المستخدم',
            is_active: user.is_active
        });
    } catch (error) {
        console.error('❌ خطأ في تغيير حالة المستخدم:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ إحصائيات المستخدمين (للمشرف)
const getUserStats = async (req, res) => {
    try {
        const totalUsers = await User.count();
        const activeUsers = await User.count({ where: { is_active: true } });
        const doctors = await User.count({ where: { role: 'doctor' } });
        const admins = await User.count({ where: { role: 'super_admin' } });
        const receptionists = await User.count({ where: { role: 'receptionist' } });

        res.json({
            success: true,
            stats: {
                total: totalUsers,
                active: activeUsers,
                doctors,
                admins,
                receptionists
            }
        });
    } catch (error) {
        console.error('❌ خطأ في جلب الإحصائيات:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ البحث عن المستخدمين
const searchUsers = async (req, res) => {
    try {
        const { query } = req.params;
        const { Op } = require('sequelize');

        const users = await User.findAll({
            where: {
                [Op.or]: [
                    { username: { [Op.iLike]: `%${query}%` } },
                    { full_name: { [Op.iLike]: `%${query}%` } },
                    { email: { [Op.iLike]: `%${query}%` } }
                ]
            },
            attributes: { exclude: ['password'] },
            include: [
                { model: Clinic, as: 'clinic' },
                { model: Department, as: 'department' }
            ],
            limit: 20
        });

        res.json({
            success: true,
            count: users.length,
            users
        });
    } catch (error) {
        console.error('❌ خطأ في البحث عن المستخدمين:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

module.exports = { 
    createUser, 
    getAllUsers, 
    getUserById, 
    updateUser, 
    deleteUser, 
    toggleUserStatus,
    getUserStats,
    searchUsers
};
