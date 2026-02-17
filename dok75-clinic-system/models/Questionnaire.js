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
            allowNull: false
        },
        doctor_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: true
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
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });

    return Questionnaire;
};
