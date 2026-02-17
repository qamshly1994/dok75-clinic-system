/**
 * ============================================
 * DOK75 - نظام إدارة العيادات المتكامل
 * الملف الرئيسي للتطبيق (نسخة نهائية)
 * ============================================
 */

// استيراد المكتبات الأساسية
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const fs = require('fs');

// تحميل متغيرات البيئة
dotenv.config();

// استيراد الاتصال بقاعدة البيانات
const { sequelize } = require('./models');

// استيراد دالة Auto Seed
const seedAdmin = require('./scripts/seed');

// استيراد المسارات (Routes)
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const questionnaireRoutes = require('./routes/questionnaires');

// إنشاء تطبيق Express
const app = express();

// ============================================
// إعدادات الأمان والوسائط (Middleware)
// ============================================

// حماية الرؤوس (Helmet)
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

// تمكين CORS للاتصالات الخارجية
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
}));

// معالجة البيانات (Body Parser)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// خدمة الملفات الثابتة (Static Files)
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// تسجيل المسارات (Routes)
// ============================================

// مسارات API
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/questionnaires', questionnaireRoutes);

// ============================================
// المسارات العامة (Frontend)
// ============================================

// الصفحة الرئيسية - توجيه لصفحة تسجيل الدخول
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// صفحة تسجيل الدخول (بديل)
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// لوحة تحكم المشرف العام
app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

// لوحة تحكم الطبيب
app.get('/doctor-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'doctor-dashboard.html'));
});

// لوحة تحكم موظف الاستقبال
app.get('/reception-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'reception-dashboard.html'));
});

// لوحة تحكم عامة (توجيه حسب الدور)
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

// ============================================
// مسار التحقق من صحة الخادم
// ============================================

app.get('/api/health', (req, res) => {
    res.json({
        status: '✅ نظام DOK75 شغال',
        time: new Date().toLocaleString('ar-SA'),
        developer: process.env.DEV_NAME,
        phone: process.env.DEV_PHONE,
        version: '2.1.0'
    });
});

// ============================================
// معالجة الأخطاء
// ============================================

// مسار 404 - غير موجود
app.use('*', (req, res) => {
    // التحقق مما إذا كان الطلب يطلب صفحة HTML
    if (req.accepts('html')) {
        res.status(404).sendFile(path.join(__dirname, 'public', '404.html'));
    } else {
        res.status(404).json({ 
            error: '❌ المسار غير موجود',
            message: 'تأكد من صحة الرابط' 
        });
    }
});

// معالجة أخطاء الخادم (500)
app.use((err, req, res, next) => {
    console.error('❌ خطأ في الخادم:', err);
    res.status(500).json({ 
        error: 'حدث خطأ في الخادم',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================
// تشغيل الخادم والاتصال بقاعدة البيانات
// ============================================

const PORT = process.env.PORT || 3000;

// إنشاء مجلد logs إذا لم يكن موجوداً
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// اختبار الاتصال بقاعدة البيانات
const startServer = async () => {
    try {
        // التحقق من الاتصال
        await sequelize.authenticate();
        console.log('✅ تم الاتصال بقاعدة البيانات PostgreSQL بنجاح');

        // مزامنة النماذج (إنشاء الجداول إذا لم تكن موجودة)
        await sequelize.sync({ alter: true });
        console.log('✅ تم مزامنة النماذج مع قاعدة البيانات');

        // ✅ تشغيل Auto Seed Admin (إنشاء المشرف العام إذا لم يكن موجوداً)
        await seedAdmin();
        console.log('✅ تم التحقق من وجود المشرف العام');

        // تشغيل الخادم
        app.listen(PORT, () => {
            console.log('=================================');
            console.log(`🚀 خادم DOK75 شغال على المنفذ ${PORT}`);
            console.log(`📱 افتح المتصفح: http://localhost:${PORT}`);
            console.log(`👤 المطور: ${process.env.DEV_NAME}`);
            console.log(`📞 للتواصل: ${process.env.DEV_PHONE}`);
            console.log('=================================');
            console.log('📌 المسارات المتاحة:');
            console.log('   - /');
            console.log('   - /login');
            console.log('   - /admin-dashboard');
            console.log('   - /doctor-dashboard');
            console.log('   - /reception-dashboard');
            console.log('   - /dashboard');
            console.log('=================================');
        });

    } catch (error) {
        console.error('❌ فشل الاتصال بقاعدة البيانات:', error);
        process.exit(1);
    }
};

// تشغيل التطبيق
startServer();

// إغلاق الاتصال عند إيقاف التطبيق
process.on('SIGINT', async () => {
    await sequelize.close();
    console.log('📴 تم إغلاق الاتصال بقاعدة البيانات');
    process.exit(0);
});

process.on('SIGTERM', async () => {
    await sequelize.close();
    console.log('📴 تم إغلاق الاتصال بقاعدة البيانات');
    process.exit(0);
});
