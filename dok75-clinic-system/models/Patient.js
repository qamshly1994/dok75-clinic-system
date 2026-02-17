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
            allowNull: true
        },
        full_name: {
            type: DataTypes.STRING(100),
            allowNull: false
        },
        phone: {
            type: DataTypes.STRING(20),
            allowNull: false
        },
        alternate_phone: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        email: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        age: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        birth_date: {
            type: DataTypes.DATEONLY,
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
            allowNull: true,
            defaultValue: ''
        },
        notes: {
            type: DataTypes.TEXT,
            allowNull: true,
            defaultValue: ''
        },
        documents: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: []
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
