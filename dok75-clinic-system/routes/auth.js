const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { User } = require('../models');

// تسجيل الدخول
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // التحقق من وجود البيانات
        if (!username || !password) {
            return res.status(400).json({ error: 'الرجاء إدخال اسم المستخدم وكلمة المرور' });
        }

        // البحث عن المستخدم
        const user = await User.findOne({ 
            where: { username },
            include: ['clinic']
        });

        if (!user) {
            return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }

        // التحقق من كلمة المرور
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
        }

        // التحقق من حالة الحساب
        if (!user.is_active) {
            return res.status(401).json({ error: 'الحساب غير نشط، تواصل مع المشرف' });
        }

        // إنشاء توكن
        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE }
        );

        res.json({
            success: true,
            token,
            user: {
                id: user.id,
                username: user.username,
                full_name: user.full_name,
                role: user.role,
                clinic_id: user.clinic_id
            }
        });

    } catch (error) {
        console.error('❌ خطأ في تسجيل الدخول:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
});

// الحصول على بيانات المستخدم الحالي
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return res.status(401).json({ error: 'غير مصرح' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findByPk(decoded.id, {
            attributes: { exclude: ['password'] },
            include: ['clinic']
        });

        if (!user) {
            return res.status(404).json({ error: 'المستخدم غير موجود' });
        }

        res.json({ success: true, user });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(401).json({ error: 'توكن غير صالح' });
    }
});

module.exports = router;
