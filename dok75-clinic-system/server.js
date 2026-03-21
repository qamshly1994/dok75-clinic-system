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
const morgan = require('morgan');
const path = require('path');
const rateLimit = require('express-rate-limit');
const fs = require('fs');

// تحميل متغيرات البيئة
dotenv.config();

// استيراد الاتصال بقاعدة البيانات
const { sequelize } = require('./models');

// استيراد دالة Auto Seed
const seedAdmin = require('./scripts/seed');

// ============================================
// تعديل إعدادات SSL لـ Render
// ============================================
if (process.env.NODE_ENV === 'production' && process.env.DATABASE_URL) {
    try {
        if (sequelize && sequelize.config) {
            // إضافة إعدادات SSL للاتصال بقاعدة البيانات
            if (!sequelize.config.dialectOptions) {
                sequelize.config.dialectOptions = {};
            }
            sequelize.config.dialectOptions.ssl = {
                require: true,
                rejectUnauthorized: false
            };
            console.log('✅ تم تفعيل إعدادات SSL لقاعدة البيانات');
        }
    } catch (err) {
        console.log('⚠️ تحذير: فشل تفعيل SSL:', err.message);
    }
}

// ============================================
// إنشاء تطبيق Express (يجب أن يكون قبل أي استخدام لـ app)
// ============================================
const app = express();

// ============================================
// تجاهل طلبات favicon.ico (يجب أن يكون بعد تعريف app)
// ============================================
app.get('/favicon.ico', (req, res) => res.status(204).end());

// ============================================
// استيراد المسارات (Routes)
// ============================================
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const visitRoutes = require('./routes/visits');
const clinicRoutes = require('./routes/clinics');

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

// تسجيل الطلبات (Logging)
app.use(morgan('combined'));

// تحديد عدد الطلبات المسموحة (Rate Limiting)
const limiter = rateLimit({
    windowMs: (process.env.RATE_LIMIT_WINDOW || 15) * 60 * 1000,
    max: process.env.RATE_LIMIT_MAX || 100,
    message: { 
        error: '⚠️ عدد كبير جداً من الطلبات، الرجاء المحاولة بعد 15 دقيقة' 
    }
});
app.use('/api/', limiter);

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
app.use('/api/visits', visitRoutes);
app.use('/api/clinics', clinicRoutes);

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
        version: '3.0.0'
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

        // ✅ تشغيل Auto Seed Admin مع معالجة الأخطاء (لا يوقف الخادم)
        try {
            await seedAdmin();
            console.log('✅ تم التحقق من وجود المشرف العام');
        } catch (seedError) {
            console.error('⚠️ تحذير: فشل تشغيل seed:', seedError.message);
            // الخادم يستمر في العمل حتى لو فشل الـ seed
        }

        // تشغيل الخادم
        app.listen(PORT, () => {
            console.log('=================================');
            console.log(`🚀 خادم DOK75 شغال على المنفذ ${PORT}`);
            console.log(`📱 افتح المتصفح: http://localhost:${PORT}`);
            console.log(`👤 المطور: ${process.env.DEV_NAME}`);
            console.log(`📞 للتواصل: ${process.env.DEV_PHONE}`);
            console.log('=================================');
            console.log('📌 المسارات المتاحة:');
            console.log('   - / (صفحة تسجيل الدخول)');
            console.log('   - /login (صفحة تسجيل الدخول)');
            console.log('   - /admin-dashboard (مدير النظام)');
            console.log('   - /doctor-dashboard (طبيب)');
            console.log('   - /reception-dashboard (استقبال)');
            console.log('   - /dashboard (لوحة عامة)');
            console.log('   - /api/health (فحص الخادم)');
            console.log('=================================');
            console.log('📌 مسارات API:');
            console.log('   - /api/auth');
            console.log('   - /api/users');
            console.log('   - /api/patients');
            console.log('   - /api/appointments');
            console.log('   - /api/visits');
            console.log('   - /api/clinics');
            console.log('=================================');
        });

    } catch (error) {
        console.error('❌ فشل الاتصال بقاعدة البيانات:', error);
        // محاولة عرض معلومات أكثر تفصيلاً عن الخطأ
        if (error.parent) {
            console.error('تفاصيل إضافية:', error.parent.message);
        }
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
