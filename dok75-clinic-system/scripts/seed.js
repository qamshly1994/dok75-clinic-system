const express = require('express');
const dotenv = require('dotenv');
const path = require('path');
const { sequelize, User, Clinic } = require('./models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize');

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// مسارات بسيطة للتوجيه
// ============================================
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/admin-dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html')));
app.get('/doctor-dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'doctor-dashboard.html')));
app.get('/reception-dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'reception-dashboard.html')));

// ============================================
// دالة بدء التشغيل الرئيسية
// ============================================
const startServer = async () => {
    try {
        // 1. الاتصال بقاعدة البيانات
        await sequelize.authenticate();
        console.log('✅ تم الاتصال بقاعدة البيانات');

        // 2. مزامنة النماذج
        await sequelize.sync({ alter: true });
        console.log('✅ تم مزامنة النماذج');

        // ============================================
        // 3. الكود السحري لإنشاء المستخدم admin (مضمن هنا)
        // ============================================
        console.log('🔍 جاري التحقق من وجود المستخدم admin...');
        // التأكد من وجود عيادة
        let clinic = await Clinic.findOne();
        if (!clinic) {
            clinic = await Clinic.create({
                name: 'عيادة DOK75 الافتراضية',
                phone: process.env.DEV_PHONE || '0995973668',
                is_active: true
            });
            console.log('✅ تم إنشاء عيادة افتراضية.');
        }

        // البحث عن مستخدم admin
        let adminUser = await User.findOne({ where: { [Op.or]: [{ username: 'admin' }, { role: 'admin' }] } });

        if (adminUser) {
            // تحديث المستخدم الموجود
            console.log(`✅ تم العثور على مستخدم: ${adminUser.username}. جاري تحديث صلاحياته...`);
            const hashedPassword = await bcrypt.hash('Admin@2026', 10);
            await adminUser.update({ password: hashedPassword, role: 'admin', is_active: true });
            console.log('✅ تم تحديث المستخدم إلى admin.');
        } else {
            // إنشاء مستخدم admin جديد
            console.log('⚠️ لم يتم العثور على مستخدم admin. جاري إنشاء واحد جديد...');
            const hashedPassword = await bcrypt.hash('Admin@2026', 10);
            await User.create({
                username: 'admin',
                password: hashedPassword,
                full_name: 'مدير النظام',
                role: 'admin',
                clinic_id: clinic.id,
                is_active: true
            });
            console.log('✅ تم إنشاء مستخدم admin جديد.');
        }
        console.log('📋 بيانات الدخول النهائية: admin / Admin@2026');
        // ============================================
        // نهاية الكود السحري
        // ============================================

        // 4. تشغيل الخادم
        app.listen(PORT, () => {
            console.log('=================================');
            console.log(`🚀 خادم DOK75 شغال على المنفذ ${PORT}`);
            console.log(`🔗 الرابط: http://localhost:${PORT}`);
            console.log('=================================');
        });

    } catch (error) {
        console.error('❌ فشل تشغيل الخادم:', error);
        process.exit(1);
    }
};

startServer();
