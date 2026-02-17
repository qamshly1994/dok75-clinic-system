const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false
        }
    },
    logging: false,
    define: {
        freezeTableName: true,
        timestamps: true,
        underscored: true
    }
});

const testConnection = async () => {
    try {
        await sequelize.authenticate();
        console.log('✅ اتصال PostgreSQL ناجح');
        return true;
    } catch (error) {
        console.error('❌ فشل الاتصال:', error);
        return false;
    }
};

module.exports = { sequelize, testConnection };
