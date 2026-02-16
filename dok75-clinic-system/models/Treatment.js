/**
 * ============================================
 * نموذج الخدمة/العلاج (Treatment)
 * ============================================
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Treatment = sequelize.define('treatments', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: { msg: 'اسم الخدمة مطلوب' }
            }
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        price: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            defaultValue: 0
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 30
        },
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'departments',
                key: 'id'
            }
        },
        specialization_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'specializations',
                key: 'id'
            }
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

    return Treatment;
};
