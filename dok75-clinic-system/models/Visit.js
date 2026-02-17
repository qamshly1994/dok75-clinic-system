const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Visit = sequelize.define('visits', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        patient_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'patients',
                key: 'id'
            }
        },
        doctor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        appointment_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'appointments',
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
        visit_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        // الشكوى الرئيسية
        complaint: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        // التشخيص
        diagnosis: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        // العلاج
        treatment: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        // ملاحظات الطبيب
        doctor_notes: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        // وصفات طبية
        prescriptions: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: []
        },
        // المرفقات
        attachments: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: []
        }
    });

    return Visit;
};
