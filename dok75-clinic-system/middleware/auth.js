const jwt = require('jsonwebtoken');
const { User } = require('../models');

const protect = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({ error: 'غير مصرح - توكن غير موجود' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id);

        if (!user) {
            return res.status(401).json({ error: 'غير مصرح - مستخدم غير موجود' });
        }

        if (!user.is_active) {
            return res.status(401).json({ error: 'الحساب غير نشط' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('❌ خطأ في التحقق:', error);
        res.status(401).json({ error: 'توكن غير صالح' });
    }
};

module.exports = { protect };
