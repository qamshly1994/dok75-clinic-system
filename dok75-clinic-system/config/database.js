/**
 * ============================================
 * إعدادات قاعدة البيانات
 * ============================================
 */

const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

// إنشاء اتصال PostgreSQL
const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false // مهم لـ Render
        }
    },
    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    },
    logging: false, // إيقاف تسجيل الاستعلامات
    define: {
        freezeTableName: true, // منع تغيير أسماء الجداول
        timestamps: true, // إضافة created_at و updated_at
        underscored: true // استخدام underscore بدل camelCase
    }
});

// اختبار الاتصال
const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ اتصال PostgreSQL ناجح');
        return true;
    } catch (error) {
        console.error('❌ فشل الاتصال بقاعدة البيانات:', error);
        return false;
    }
};

module.exports = {
    sequelize,
    testConnection
};
