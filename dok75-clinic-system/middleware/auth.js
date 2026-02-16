/**
 * ============================================
 * وسيط التحقق من التوكن (Authentication)
 * ============================================
 */

const jwt = require('jsonwebtoken');
const { User } = require('../models');

// التحقق من التوكن
const protect = async (req, res, next) => {
    let token;

    // البحث عن التوكن في الهيدر
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    // التحقق من وجود التوكن
    if (!token) {
        return res.status(401).json({ 
            error: 'غير مصرح بالدخول',
            message: 'توكن غير موجود' 
        });
    }

    try {
        // التحقق من صحة التوكن
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // البحث عن المستخدم
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] },
            include: ['clinic', 'department', 'specialization']
        });

        if (!user) {
            return res.status(401).json({ 
                error: 'غير مصرح بالدخول',
                message: 'المستخدم غير موجود' 
            });
        }

        if (!user.is_active) {
            return res.status(401).json({ 
                error: 'الحساب غير نشط',
                message: 'تواصل مع المشرف' 
            });
        }

        // إضافة المستخدم إلى الطلب
        req.user = user;
        next();
        
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ 
                error: 'انتهت صلاحية التوكن',
                message: 'الرجاء تسجيل الدخول مرة أخرى' 
            });
        }
        
        return res.status(401).json({ 
            error: 'توكن غير صالح',
            message: 'الرجاء تسجيل الدخول مرة أخرى' 
        });
    }
};

module.exports = { protect };
