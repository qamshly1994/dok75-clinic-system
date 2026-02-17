/**
 * ============================================
 * ملف الربط الرئيسي للنماذج
 * الموقع: /models/index.js
 * ============================================
 */

const { sequelize } = require('../config/database');

// استيراد النماذج
const Clinic = require('./Clinic')(sequelize);
const Department = require('./Department')(sequelize);
const Specialization = require('./Specialization')(sequelize);
const User = require('./User')(sequelize);
const Patient = require('./Patient')(sequelize);
const Appointment = require('./Appointment')(sequelize);
const Treatment = require('./Treatment')(sequelize);
const Questionnaire = require('./Questionnaire')(sequelize); // ← جديد

// ============================================
// تعريف العلاقات بين الجداول
// ============================================

// Clinic -> Department (واحد لأكثر)
Clinic.hasMany(Department, { as: 'departments', foreignKey: 'clinic_id' });
Department.belongsTo(Clinic, { as: 'clinic', foreignKey: 'clinic_id' });

// Department -> Specialization (واحد لأكثر)
Department.hasMany(Specialization, { as: 'specializations', foreignKey: 'department_id' });
Specialization.belongsTo(Department, { as: 'department', foreignKey: 'department_id' });

// Clinic -> User (الأطباء)
Clinic.hasMany(User, { as: 'doctors', foreignKey: 'clinic_id' });
User.belongsTo(Clinic, { as: 'clinic', foreignKey: 'clinic_id' });

// Department -> User
Department.hasMany(User, { as: 'doctors', foreignKey: 'department_id' });
User.belongsTo(Department, { as: 'department', foreignKey: 'department_id' });

// Specialization -> User
Specialization.hasMany(User, { as: 'doctors', foreignKey: 'specialization_id' });
User.belongsTo(Specialization, { as: 'specialization', foreignKey: 'specialization_id' });

// Clinic -> Patient
Clinic.hasMany(Patient, { as: 'patients', foreignKey: 'clinic_id' });
Patient.belongsTo(Clinic, { as: 'clinic', foreignKey: 'clinic_id' });

// User (creator) -> Patient
User.hasMany(Patient, { as: 'created_patients', foreignKey: 'created_by' });
Patient.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });

// Patient -> Appointment
Patient.hasMany(Appointment, { as: 'appointments', foreignKey: 'patient_id' });
Appointment.belongsTo(Patient, { as: 'patient', foreignKey: 'patient_id' });

// User (doctor) -> Appointment
User.hasMany(Appointment, { as: 'doctor_appointments', foreignKey: 'doctor_id' });
Appointment.belongsTo(User, { as: 'doctor', foreignKey: 'doctor_id' });

// Clinic -> Appointment
Clinic.hasMany(Appointment, { as: 'appointments', foreignKey: 'clinic_id' });
Appointment.belongsTo(Clinic, { as: 'clinic', foreignKey: 'clinic_id' });

// Department -> Appointment
Department.hasMany(Appointment, { as: 'appointments', foreignKey: 'department_id' });
Appointment.belongsTo(Department, { as: 'department', foreignKey: 'department_id' });

// Specialization -> Appointment
Specialization.hasMany(Appointment, { as: 'appointments', foreignKey: 'specialization_id' });
Appointment.belongsTo(Specialization, { as: 'specialization', foreignKey: 'specialization_id' });

// User (creator) -> Appointment
User.hasMany(Appointment, { as: 'created_appointments', foreignKey: 'created_by' });
Appointment.belongsTo(User, { as: 'creator', foreignKey: 'created_by' });

// Clinic -> Treatment
Clinic.hasMany(Treatment, { as: 'treatments', foreignKey: 'clinic_id' });
Treatment.belongsTo(Clinic, { as: 'clinic', foreignKey: 'clinic_id' });

// Department -> Treatment
Department.hasMany(Treatment, { as: 'treatments', foreignKey: 'department_id' });
Treatment.belongsTo(Department, { as: 'department', foreignKey: 'department_id' });

// Specialization -> Treatment
Specialization.hasMany(Treatment, { as: 'treatments', foreignKey: 'specialization_id' });
Treatment.belongsTo(Specialization, { as: 'specialization', foreignKey: 'specialization_id' });

// ============================================
// العلاقات مع Questionnaire (جديد)
// ============================================

// Patient -> Questionnaire
Patient.hasMany(Questionnaire, { as: 'questionnaires', foreignKey: 'patient_id' });
Questionnaire.belongsTo(Patient, { as: 'patient', foreignKey: 'patient_id' });

// User (doctor) -> Questionnaire
User.hasMany(Questionnaire, { as: 'doctor_questionnaires', foreignKey: 'doctor_id' });
Questionnaire.belongsTo(User, { as: 'doctor', foreignKey: 'doctor_id' });

// Department -> Questionnaire
Department.hasMany(Questionnaire, { as: 'questionnaires', foreignKey: 'department_id' });
Questionnaire.belongsTo(Department, { as: 'department', foreignKey: 'department_id' });

// Appointment -> Questionnaire (واحد لواحد)
Appointment.hasOne(Questionnaire, { as: 'questionnaire', foreignKey: 'appointment_id' });
Questionnaire.belongsTo(Appointment, { as: 'appointment', foreignKey: 'appointment_id' });

// ============================================
// تصدير جميع النماذج والاتصال
// ============================================

module.exports = {
    sequelize,
    Clinic,
    Department,
    Specialization,
    User,
    Patient,
    Appointment,
    Treatment,
    Questionnaire // ← جديد
};
