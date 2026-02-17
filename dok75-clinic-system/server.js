const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { sequelize } = require('./models');
const seedAdmin = require('./scripts/seed');

dotenv.config();

// استيراد المسارات
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const patientRoutes = require('./routes/patients');
const appointmentRoutes = require('./routes/appointments');
const questionnaireRoutes = require('./routes/questionnaires');

const app = express();

// Middleware
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// المسارات
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/questionnaires', questionnaireRoutes);

// الصفحات
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/admin-dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin-dashboard.html')));
app.get('/doctor-dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'doctor-dashboard.html')));
app.get('/reception-dashboard', (req, res) => res.sendFile(path.join(__dirname, 'public', 'reception-dashboard.html')));

// تشغيل الخادم
const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await sequelize.authenticate();
        console.log('✅ اتصال قاعدة البيانات');

        await sequelize.sync({ alter: true });
        console.log('✅ مزامنة النماذج');

        await seedAdmin();
        console.log('✅ التحقق من المشرف');

        app.listen(PORT, () => {
            console.log(`🚀 الخادم شغال على المنفذ ${PORT}`);
        });
    } catch (error) {
        console.error('❌ فشل التشغيل:', error);
    }
}

startServer();
