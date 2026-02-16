const { DataTypes } = require('sequelize');
const sequelize = require('./index');

// ✅ نموذج التخصص الدقيق (تقويم أسنان، زراعة أسنان، إلخ)
const Specialization = sequelize.define('specializations', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'اسم التخصص مطلوب' }
        }
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'departments',
            key: 'id'
        }
    },
    price_range: {
        type: DataTypes.STRING(50), // مثلاً: 200-500
        allowNull: true
    },
    duration: {
        type: DataTypes.INTEGER, // مدة الجلسة بالدقائق
        allowNull: true,
        defaultValue: 30
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
});

module.exports = Specialization;
