const { sequelize } = require('../config/database');

// استيراد النماذج
const Clinic = require('./Clinic')(sequelize);
const User = require('./User')(sequelize);
const Patient = require('./Patient')(sequelize);
const Appointment = require('./Appointment')(sequelize);
const Visit = require('./Visit')(sequelize);

// ============================================
// العلاقات
// ============================================

// Clinic -> User
Clinic.hasMany(User, { foreignKey: 'clinic_id' });
User.belongsTo(Clinic, { foreignKey: 'clinic_id' });

// Clinic -> Patient
Clinic.hasMany(Patient, { foreignKey: 'clinic_id' });
Patient.belongsTo(Clinic, { foreignKey: 'clinic_id' });

// Clinic -> Appointment
Clinic.hasMany(Appointment, { foreignKey: 'clinic_id' });
Appointment.belongsTo(Clinic, { foreignKey: 'clinic_id' });

// Clinic -> Visit
Clinic.hasMany(Visit, { foreignKey: 'clinic_id' });
Visit.belongsTo(Clinic, { foreignKey: 'clinic_id' });

// User (creator) -> Patient
User.hasMany(Patient, { foreignKey: 'created_by' });
Patient.belongsTo(User, { foreignKey: 'created_by' });

// User (doctor) -> Appointment
User.hasMany(Appointment, { foreignKey: 'doctor_id' });
Appointment.belongsTo(User, { foreignKey: 'doctor_id' });

// User (receptionist) -> Appointment
User.hasMany(Appointment, { foreignKey: 'receptionist_id' });
Appointment.belongsTo(User, { foreignKey: 'receptionist_id' });

// User (creator) -> Appointment
User.hasMany(Appointment, { foreignKey: 'created_by' });
Appointment.belongsTo(User, { foreignKey: 'created_by' });

// Patient -> Appointment
Patient.hasMany(Appointment, { foreignKey: 'patient_id' });
Appointment.belongsTo(Patient, { foreignKey: 'patient_id' });

// Patient -> Visit
Patient.hasMany(Visit, { foreignKey: 'patient_id' });
Visit.belongsTo(Patient, { foreignKey: 'patient_id' });

// User (doctor) -> Visit
User.hasMany(Visit, { foreignKey: 'doctor_id' });
Visit.belongsTo(User, { foreignKey: 'doctor_id' });

// Appointment -> Visit
Appointment.hasOne(Visit, { foreignKey: 'appointment_id' });
Visit.belongsTo(Appointment, { foreignKey: 'appointment_id' });

module.exports = {
    sequelize,
    Clinic,
    User,
    Patient,
    Appointment,
    Visit
};
