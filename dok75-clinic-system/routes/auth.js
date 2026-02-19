const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { protect } = require('../middleware/auth');

// تسجيل الدخول
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(401).json({ error: 'بيانات غير صحيحة' });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'بيانات غير صحيحة' });
        }

        if (!user.is_active) {
            return res.status(401).json({ error: 'الحساب غير نشط' });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        // ✅ التوجيه الصحيح
        let redirectTo = '/dashboard';
        if (user.role === 'admin') redirectTo = '/admin-dashboard';
        else if (user.role === 'doctor') redirectTo = '/doctor-dashboard';
        else if (user.role === 'receptionist') redirectTo = '/reception-dashboard';

        res.json({
            success: true,
            token,
            redirectTo,
            user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                role: user.role
            }
        });

    } catch (error) {
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
});

// الحصول على بيانات المستخدم الحالي
router.get('/me', protect, async (req, res) => {
    res.json({ success: true, user: req.user });
});

module.exports = router;
