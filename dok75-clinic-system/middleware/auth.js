const jwt = require('jsonwebtoken');
const { User } = require('../models');

// ✅ التحقق من التوكن
const protect = async (req, res, next) => {
    let token;

    // البحث عن التوكن في الهيدر
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ error: 'غير مصرح بالدخول - توكن غير موجود' });
    }

    try {
        // التحقق من التوكن
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // البحث عن المستخدم
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] }
        });

        if (!user) {
            return res.status(401).json({ error: 'المستخدم غير موجود' });
        }

        if (!user.is_active) {
            return res.status(401).json({ error: 'الحساب غير نشط' });
        }

        // إضافة المستخدم إلى الطلب
        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'انتهت صلاحية التوكن' });
        }
        return res.status(401).json({ error: 'توكن غير صالح' });
    }
};

module.exports = { protect };
