const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Questionnaire = sequelize.define('questionnaires', {
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
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        session_date: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        // استبيان التغذية
        nutrition: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {}
        },
        // استبيان الأسنان
        dentistry: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {}
        },
        // استبيان الليزر
        laser: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {}
        },
        // ملاحظات الطبيب
        doctor_notes: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    });

    return Questionnaire;
};
