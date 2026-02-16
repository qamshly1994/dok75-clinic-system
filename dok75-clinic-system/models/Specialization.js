/**
 * ============================================
 * نموذج التخصص الدقيق (Specialization)
 * ============================================
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
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
            type: DataTypes.STRING(50),
            allowNull: true
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 30
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    });

    return Specialization;
};
