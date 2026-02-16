const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// ✅ إنشاء اتصال PostgreSQL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // مهم لـ Render
        }
    },
    logging: false, // إيقاف تسجيل الاستعلامات (للنظافة)
    define: {
        freezeTableName: true, // منع تغيير أسماء الجداول
        timestamps: true, // إضافة created_at و updated_at تلقائياً
        underscored: true // استخدام underscore بدل camelCase
    }
});

// ✅ اختبار الاتصال
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ اتصال PostgreSQL ناجح');
    } catch (error) {
        console.error('❌ فشل الاتصال:', error);
    }
};

testConnection();

module.exports = sequelize;
