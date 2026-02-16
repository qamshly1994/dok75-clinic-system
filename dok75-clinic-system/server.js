/**
 * ============================================
 * DOK75 - نظام إدارة العيادات المتعددة
 * الملف الرئيسي للتطبيق
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

// تحميل متغيرات البيئة
dotenv.config();

// استيراد الاتصال بقاعدة البيانات
const { sequelize } = require('./models');

// استيراد المسارات (Routes)
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const clinicRoutes = require('./routes/clinics');
const departmentRoutes = require('./routes/departments');
const specializationRoutes = require('./routes/specializations');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const treatmentRoutes = require('./routes/treatments');

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
app.use('/api/clinics', clinicRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/specializations', specializationRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/treatments', treatmentRoutes);

// ============================================
// المسارات العامة (Frontend)
// ============================================

// الصفحة الرئيسية - توجيه لصفحة تسجيل الدخول
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// صفحة لوحة التحكم (توجيه حسب الدور)
app.get('/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/admin-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html'));
});

app.get('/doctor-dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'doctor-dashboard.html'));
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
        version: '2.0.0'
    });
});

// ============================================
// معالجة الأخطاء
// ============================================

// مسار 404 - غير موجود
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: '❌ المسار غير موجود',
        message: 'تأكد من صحة الرابط' 
    });
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

// اختبار الاتصال بقاعدة البيانات
const startServer = async () => {
    try {
        // التحقق من الاتصال
        await sequelize.authenticate();
        console.log('✅ تم الاتصال بقاعدة البيانات PostgreSQL بنجاح');

        // مزامنة النماذج (إنشاء الجداول إذا لم تكن موجودة)
        if (process.env.NODE_ENV === 'development') {
            await sequelize.sync({ alter: true });
            console.log('✅ تم مزامنة النماذج مع قاعدة البيانات');
        } else {
            await sequelize.sync();
            console.log('✅ تم التحقق من النماذج');
        }

        // تشغيل الخادم
        app.listen(PORT, () => {
            console.log('=================================');
            console.log(`🚀 خادم DOK75 شغال على المنفذ ${PORT}`);
            console.log(`📱 افتح المتصفح: http://localhost:${PORT}`);
            console.log(`👤 المطور: ${process.env.DEV_NAME}`);
            console.log(`📞 للتواصل: ${process.env.DEV_PHONE}`);
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
