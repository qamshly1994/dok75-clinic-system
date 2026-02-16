/**
 * ============================================
 * نموذج القسم (Department)
 * ============================================
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
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
            type: DataTypes.STRING(50),
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

    return Department;
};
