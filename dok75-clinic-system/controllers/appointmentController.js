const { Appointment, Patient, User, Clinic, Department, Specialization } = require('../models');
const { Op } = require('sequelize');

// ✅ إنشاء موعد جديد
const createAppointment = async (req, res) => {
    try {
        const { 
            appointment_date, patient_id, doctor_id, clinic_id,
            department_id, specialization_id, notes 
        } = req.body;

        // التحقق من وجود المريض
        const patient = await Patient.findByPk(patient_id);
        if (!patient) {
            return res.status(404).json({ error: 'المريض غير موجود' });
        }

        // التحقق من وجود الطبيب
        const doctor = await User.findOne({ 
            where: { id: doctor_id, role: 'doctor', is_active: true } 
        });
        if (!doctor) {
            return res.status(404).json({ error: 'الطبيب غير موجود' });
        }

        // إنشاء الموعد
        const appointment = await Appointment.create({
            appointment_date,
            patient_id,
            doctor_id,
            clinic_id,
            department_id,
            specialization_id,
            notes,
            created_by: req.user.id,
            status: 'pending'
        });

        res.status(201).json({
            success: true,
            message: '✅ تم إنشاء الموعد بنجاح',
            appointment
        });
    } catch (error) {
        console.error('❌ خطأ في إنشاء الموعد:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ عرض جميع المواعيد (مع فلترة)
const getAllAppointments = async (req, res) => {
    try {
        const { startDate, endDate, status, doctor_id, patient_id } = req.query;
        let whereClause = {};

        if (startDate && endDate) {
            whereClause.appointment_date = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        if (status) whereClause.status = status;
        if (doctor_id) whereClause.doctor_id = doctor_id;
        if (patient_id) whereClause.patient_id = patient_id;

        // إذا كان المستخدم دكتور، يرى فقط مواعيده
        if (req.user.role === 'doctor') {
            whereClause.doctor_id = req.user.id;
        }

        const appointments = await Appointment.findAll({
            where: whereClause,
            include: [
                { model: Patient, as: 'patient' },
                { 
                    model: User, 
                    as: 'doctor',
                    attributes: ['id', 'full_name']
                },
                { model: Clinic, as: 'clinic' },
                { model: Department, as: 'department' },
                { model: Specialization, as: 'specialization' }
            ],
            order: [['appointment_date', 'ASC']]
        });

        res.json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (error) {
        console.error('❌ خطأ في جلب المواعيد:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ عرض موعد محدد
const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findByPk(req.params.id, {
            include: [
                { model: Patient, as: 'patient' },
                { 
                    model: User, 
                    as: 'doctor',
                    attributes: ['id', 'full_name']
                },
                { model: Clinic, as: 'clinic' },
                { model: Department, as: 'department' },
                { model: Specialization, as: 'specialization' },
                { 
                    model: User, 
                    as: 'creator',
                    attributes: ['id', 'full_name']
                }
            ]
        });

        if (!appointment) {
            return res.status(404).json({ error: 'الموعد غير موجود' });
        }

        res.json({ success: true, appointment });
    } catch (error) {
        console.error('❌ خطأ في جلب الموعد:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ تحديث موعد
const updateAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByPk(req.params.id);

        if (!appointment) {
            return res.status(404).json({ error: 'الموعد غير موجود' });
        }

        const { appointment_date, doctor_id, department_id, specialization_id, notes } = req.body;

        await appointment.update({
            appointment_date: appointment_date || appointment.appointment_date,
            doctor_id: doctor_id || appointment.doctor_id,
            department_id: department_id || appointment.department_id,
            specialization_id: specialization_id || appointment.specialization_id,
            notes: notes || appointment.notes
        });

        res.json({
            success: true,
            message: '✅ تم تحديث الموعد بنجاح',
            appointment
        });
    } catch (error) {
        console.error('❌ خطأ في تحديث الموعد:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ إلغاء موعد
const cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByPk(req.params.id);

        if (!appointment) {
            return res.status(404).json({ error: 'الموعد غير موجود' });
        }

        await appointment.update({ status: 'cancelled' });

        res.json({
            success: true,
            message: '✅ تم إلغاء الموعد بنجاح'
        });
    } catch (error) {
        console.error('❌ خطأ في إلغاء الموعد:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ تغيير حالة الموعد
const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findByPk(req.params.id);

        if (!appointment) {
            return res.status(404).json({ error: 'الموعد غير موجود' });
        }

        const validStatuses = ['pending', 'confirmed', 'completed', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'حالة غير صالحة' });
        }

        await appointment.update({ status });

        res.json({
            success: true,
            message: `✅ تم تغيير حالة الموعد إلى: ${
                status === 'pending' ? 'معلق' :
                status === 'confirmed' ? 'مؤكد' :
                status === 'completed' ? 'مكتمل' : 'ملغي'
            }`,
            status
        });
    } catch (error) {
        console.error('❌ خطأ في تغيير حالة الموعد:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ عرض مواعيد طبيب محدد
const getDoctorAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date } = req.query;

        let whereClause = { doctor_id: doctorId };

        if (date) {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);

            whereClause.appointment_date = {
                [Op.between]: [startOfDay, endOfDay]
            };
        }

        const appointments = await Appointment.findAll({
            where: whereClause,
            include: [
                { model: Patient, as: 'patient' },
                { model: Department, as: 'department' },
                { model: Specialization, as: 'specialization' }
            ],
            order: [['appointment_date', 'ASC']]
        });

        res.json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (error) {
        console.error('❌ خطأ في جلب مواعيد الطبيب:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ عرض مواعيد يوم محدد
const getAppointmentsByDate = async (req, res) => {
    try {
        const { date } = req.params;
        
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        const whereClause = {
            appointment_date: {
                [Op.between]: [startOfDay, endOfDay]
            }
        };

        const appointments = await Appointment.findAll({
            where: whereClause,
            include: [
                { model: Patient, as: 'patient' },
                { 
                    model: User, 
                    as: 'doctor',
                    attributes: ['id', 'full_name']
                }
            ],
            order: [['appointment_date', 'ASC']]
        });

        res.json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (error) {
        console.error('❌ خطأ في جلب مواعيد اليوم:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ عرض مواعيد مريض محدد
const getPatientAppointments = async (req, res) => {
    try {
        const { patientId } = req.params;

        const appointments = await Appointment.findAll({
            where: { patient_id: patientId },
            include: [
                { 
                    model: User, 
                    as: 'doctor',
                    attributes: ['id', 'full_name']
                },
                { model: Department, as: 'department' },
                { model: Specialization, as: 'specialization' }
            ],
            order: [['appointment_date', 'DESC']]
        });

        res.json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (error) {
        console.error('❌ خطأ في جلب مواعيد المريض:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

module.exports = {
    createAppointment,
    getAllAppointments,
    getAppointmentById,
    updateAppointment,
    cancelAppointment,
    updateAppointmentStatus,
    getDoctorAppointments,
    getAppointmentsByDate,
    getPatientAppointments
};
