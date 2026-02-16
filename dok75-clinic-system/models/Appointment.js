const { DataTypes } = require('sequelize');
const sequelize = require('./index');

// ✅ نموذج الموعد
const Appointment = sequelize.define('appointments', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    appointment_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            notEmpty: { msg: 'تاريخ الموعد مطلوب' }
        }
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
    clinic_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'clinics',
            key: 'id'
        }
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
    status: {
        type: DataTypes.ENUM('pending', 'confirmed', 'completed', 'cancelled'),
        defaultValue: 'pending'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    created_by: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    }
});

module.exports = Appointment;
