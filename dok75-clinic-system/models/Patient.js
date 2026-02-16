/**
 * ============================================
 * نموذج المريض (Patient)
 * ============================================
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Patient = sequelize.define('patients', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        full_name: {
            type: DataTypes.STRING(100),
            allowNull: false,
            validate: {
                notEmpty: { msg: 'اسم المريض مطلوب' }
            }
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: false,
            validate: {
                notEmpty: { msg: 'رقم الهاتف مطلوب' }
            }
        },
        alternate_phone: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: true,
            validate: {
                isEmail: { msg: 'البريد الإلكتروني غير صحيح' }
            }
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        gender: {
            type: DataTypes.ENUM('male', 'female'),
            allowNull: true
        },
        address: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        medical_history: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        medications: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        allergies: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        clinic_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'clinics',
                key: 'id'
            }
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    });

    return Patient;
};
