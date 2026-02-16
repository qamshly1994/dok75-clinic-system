const { DataTypes } = require('sequelize');
const sequelize = require('./index');

// ✅ نموذج القسم (تخصص رئيسي)
const Department = sequelize.define('departments', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'اسم القسم مطلوب' }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    icon: {
        type: DataTypes.STRING(50), // رمز تعبيري
        allowNull: true,
        defaultValue: '🏥'
    },
    clinic_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'clinics',
            key: 'id'
        }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

module.exports = Department;
