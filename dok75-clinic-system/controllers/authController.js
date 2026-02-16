/**
 * ============================================
 * وحدة تحكم المصادقة (Authentication Controller)
 * ============================================
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');

// إنشاء توكن
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
};

// ✅ تسجيل الدخول
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // التحقق من وجود البيانات
        if (!username || !password) {
            return res.status(400).json({ 
                error: 'الرجاء إدخال اسم المستخدم وكلمة المرور' 
            });
        }

        // البحث عن المستخدم
        const user = await User.findOne({ 
            where: { username },
            include: ['clinic', 'department', 'specialization']
        });

        if (!user) {
            return res.status(401).json({ 
                error: 'اسم المستخدم أو كلمة المرور غير صحيحة' 
            });
        }

        // التحقق من كلمة المرور
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ 
                error: 'اسم المستخدم أو كلمة المرور غير صحيحة' 
            });
        }

        // التحقق من حالة الحساب
        if (!user.is_active) {
            return res.status(401).json({ 
                error: 'الحساب غير نشط، تواصل مع المشرف' 
            });
        }

        // تحديث آخر تسجيل دخول
        await user.update({ last_login: new Date() });

        // إنشاء توكن
        const token = generateToken(user.id);

        // إرجاع البيانات
        res.json({
            success: true,
            token,
            user: user.toJSON()
        });

    } catch (error) {
        console.error('❌ خطأ في تسجيل الدخول:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ تسجيل الخروج
const logout = (req, res) => {
    res.json({ 
        success: true, 
        message: 'تم تسجيل الخروج بنجاح' 
    });
};

// ✅ الحصول على بيانات المستخدم الحالي
const getMe = async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] },
            include: ['clinic', 'department', 'specialization']
        });
        
        res.json({ 
            success: true, 
            user 
        });
    } catch (error) {
        console.error('❌ خطأ في جلب بيانات المستخدم:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ تغيير كلمة المرور
const changePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        const user = await User.findByPk(req.user.id);

        // التحقق من كلمة المرور الحالية
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            return res.status(401).json({ 
                error: 'كلمة المرور الحالية غير صحيحة' 
            });
        }

        // تحديث كلمة المرور
        user.password = newPassword;
        await user.save();

        res.json({ 
            success: true, 
            message: 'تم تغيير كلمة المرور بنجاح' 
        });
    } catch (error) {
        console.error('❌ خطأ في تغيير كلمة المرور:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

module.exports = { 
    login, 
    logout, 
    getMe, 
    changePassword 
};
