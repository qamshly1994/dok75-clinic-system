const { sequelize } = require('../config/database');

// استيراد النماذج
const Clinic = require('./Clinic')(sequelize);
const Department = require('./Department')(sequelize);
const User = require('./User')(sequelize);
const Patient = require('./Patient')(sequelize);
const Appointment = require('./Appointment')(sequelize);
const Questionnaire = require('./Questionnaire')(sequelize);

// ============================================
// العلاقات
// ============================================

// Clinic -> User
Clinic.hasMany(User, { foreignKey: 'clinic_id' });
User.belongsTo(Clinic, { foreignKey: 'clinic_id' });

// User (receptionist/doctor) -> Patient (creator)
User.hasMany(Patient, { foreignKey: 'created_by' });
Patient.belongsTo(User, { foreignKey: 'created_by' });

// Patient -> Appointment
Patient.hasMany(Appointment, { foreignKey: 'patient_id' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id' });

// User (doctor) -> Appointment
User.hasMany(Appointment, { foreignKey: 'doctor_id' });
Appointment.belongsTo(User, { foreignKey: 'doctor_id' });

// User (receptionist) -> Appointment
User.hasMany(Appointment, { foreignKey: 'receptionist_id' });
Appointment.belongsTo(User, { foreignKey: 'receptionist_id' });

// Patient -> Questionnaire
Patient.hasMany(Questionnaire, { foreignKey: 'patient_id' });
Questionnaire.belongsTo(Patient, { foreignKey: 'patient_id' });

// User (doctor) -> Questionnaire
User.hasMany(Questionnaire, { foreignKey: 'doctor_id' });
Questionnaire.belongsTo(User, { foreignKey: 'doctor_id' });

module.exports = {
    sequelize,
    Clinic,
    Department,
    User,
    Patient,
    Appointment,
    Questionnaire
};
