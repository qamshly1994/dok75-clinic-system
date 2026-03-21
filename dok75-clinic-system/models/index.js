const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');
dotenv.config();

let sequelize;

// التأكد من وجود DATABASE_URL
if (!process.env.DATABASE_URL) {
    console.error('❌ خطأ: DATABASE_URL غير موجود في متغيرات البيئة');
    process.exit(1);
}

// تنظيف عنوان قاعدة البيانات (إزالة أي مسافات)
const databaseUrl = process.env.DATABASE_URL.trim();

console.log('📌 محاولة الاتصال بقاعدة البيانات...');

// إنشاء اتصال Sequelize مع إعدادات SSL
sequelize = new Sequelize(databaseUrl, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: false,
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

// اختبار الاتصال
sequelize.authenticate()
    .then(() => {
        console.log('✅ تم الاتصال بقاعدة البيانات بنجاح');
    })
    .catch(err => {
        console.error('❌ فشل الاتصال بقاعدة البيانات:', err.message);
        console.error('📌 عنوان قاعدة البيانات المستخدم:', databaseUrl);
    });

// استيراد النماذج
const User = require('./User')(sequelize);
const Patient = require('./Patient')(sequelize);
const Appointment = require('./Appointment')(sequelize);
const Visit = require('./Visit')(sequelize);
const Clinic = require('./Clinic')(sequelize);

// تعريف العلاقات
if (User && Patient) {
    User.hasMany(Patient, { foreignKey: 'doctorId' });
    Patient.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
}

if (Patient && Appointment) {
    Patient.hasMany(Appointment, { foreignKey: 'patientId' });
    Appointment.belongsTo(Patient, { foreignKey: 'patientId' });
}

if (User && Appointment) {
    User.hasMany(Appointment, { foreignKey: 'doctorId' });
    Appointment.belongsTo(User, { foreignKey: 'doctorId', as: 'doctor' });
}

if (Clinic && User) {
    Clinic.hasMany(User, { foreignKey: 'clinicId' });
    User.belongsTo(Clinic, { foreignKey: 'clinicId' });
}

module.exports = {
    sequelize,
    Sequelize,
    User,
    Patient,
    Appointment,
    Visit,
    Clinic
};
