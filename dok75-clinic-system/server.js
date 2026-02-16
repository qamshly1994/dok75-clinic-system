// استيراد المكتبات
const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');

// تحميل متغيرات البيئة
dotenv.config();

// استيراد الاتصال بقاعدة البيانات
const sequelize = require('./models/index');

// استيراد المسارات
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const clinicRoutes = require('./routes/clinics');
const departmentRoutes = require('./routes/departments');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');

// إنشاء التطبيق
const app = express();

// ✅ إعدادات الأمان
app.use(helmet({
    contentSecurityPolicy: false,
}));

// ✅ السماح بالاتصالات من أي مصدر (للتجربة)
app.use(cors({
    origin: '*',
    credentials: true
}));

// ✅ تحديد عدد الطلبات المسموحة (الحماية من الهجمات)
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 100, // الحد الأقصى 100 طلب
    message: { error: 'عدد كبير جداً من الطلبات، حاول بعد 15 دقيقة' }
});
app.use('/api/', limiter);

// ✅ معالجة البيانات
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ خدمة الملفات الثابتة (الواجهة)
app.use(express.static(path.join(__dirname, 'public')));

// ✅ تسجيل الدخول (للتتبع)
app.use((req, res, next) => {
    console.log(`📝 ${new Date().toLocaleString('ar-SA')} - ${req.method} ${req.url}`);
    next();
});

// ✅ ربط المسارات
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/clinics', clinicRoutes);
app.use('/api/departments', departmentRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);

// ✅ الصفحة الرئيسية (توجيه لصفحة تسجيل الدخول)
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// ✅ مسار للتحقق من أن الخادم شغال
app.get('/api/health', (req, res) => {
    res.json({ 
        status: '✅ نظام DOK75 شغال',
        time: new Date().toLocaleString('ar-SA'),
        developer: process.env.DEV_NAME,
        phone: process.env.DEV_PHONE
    });
});

// ✅ معالجة الأخطاء (404)
app.use('*', (req, res) => {
    res.status(404).json({ error: 'المسار غير موجود' });
});

// ✅ معالجة أخطاء الخادم
app.use((err, req, res, next) => {
    console.error('❌ خطأ:', err);
    res.status(500).json({ error: 'حدث خطأ في الخادم' });
});

// ✅ تشغيل الخادم والاتصال بقاعدة البيانات
const PORT = process.env.PORT || 3000;

sequelize.authenticate()
    .then(() => {
        console.log('✅ تم الاتصال بقاعدة البيانات PostgreSQL');
        
        // مزامنة النماذج (إنشاء الجداول إذا لم تكن موجودة)
        return sequelize.sync({ alter: true });
    })
    .then(() => {
        console.log('✅ تم مزامنة النماذج مع قاعدة البيانات');
        
        // تشغيل الخادم
        app.listen(PORT, () => {
            console.log(`🚀 خادم DOK75 شغال على المنفذ ${PORT}`);
            console.log(`📱 افتح المتصفح: http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.error('❌ فشل الاتصال بقاعدة البيانات:', err);
        process.exit(1);
    });

// ✅ إغلاق الاتصال عند إيقاف التطبيق
process.on('SIGINT', () => {
    sequelize.close();
    console.log('📴 تم إغلاق الاتصال بقاعدة البيانات');
    process.exit(0);
});
