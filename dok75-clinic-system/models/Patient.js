const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Patient = sequelize.define('patients', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        patient_number: {
            type: DataTypes.STRING(20),
            unique: true,
            allowNull: false
        },
        full_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: false
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
        // الملف الطبي الموحد (يتجمع فيه كل شيء)
        medical_history: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: ''
        },
        // روابط المستندات والصور
        documents: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: []
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        clinic_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        }
    });

    return Patient;
};
