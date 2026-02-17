const { Appointment, Patient, User } = require('../models');
const { Op } = require('sequelize');

// حجز موعد جديد (للاستقبال)
const createAppointment = async (req, res) => {
    try {
        const { patient_id, doctor_id, appointment_date, notes } = req.body;

        // التحقق من وجود المريض
        const patient = await Patient.findByPk(patient_id);
        if (!patient) {
            return res.status(404).json({ error: 'المريض غير موجود' });
        }

        // التحقق من وجود الدكتور
        const doctor = await User.findOne({
            where: { id: doctor_id, role: 'doctor', is_active: true }
        });
        if (!doctor) {
            return res.status(404).json({ error: 'الدكتور غير موجود أو غير نشط' });
        }

        // إنشاء الموعد
        const appointment = await Appointment.create({
            patient_id,
            doctor_id,
            receptionist_id: req.user.id,
            appointment_date,
            notes,
            status: 'scheduled'
        });

        res.status(201).json({
            success: true,
            message: '✅ تم حجز الموعد بنجاح',
            appointment
        });

    } catch (error) {
        console.error('❌ خطأ في حجز الموعد:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض مواعيد اليوم
const getTodayAppointments = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const appointments = await Appointment.findAll({
            where: {
                appointment_date: {
                    [Op.between]: [today, tomorrow]
                }
            },
            include: [
                { model: Patient, as: 'patient' },
                { model: User, as: 'doctor', attributes: ['id', 'full_name'] }
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

// عرض مواعيد دكتور معين
const getDoctorAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date } = req.query;

        let whereClause = { doctor_id: doctorId };

        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);

            whereClause.appointment_date = {
                [Op.between]: [startDate, endDate]
            };
        }

        const appointments = await Appointment.findAll({
            where: whereClause,
            include: [{ model: Patient, as: 'patient' }],
            order: [['appointment_date', 'ASC']]
        });

        res.json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (error) {
        console.error('❌ خطأ في جلب مواعيد الدكتور:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// تحديث حالة الموعد
const updateAppointmentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const appointment = await Appointment.findByPk(id);

        if (!appointment) {
            return res.status(404).json({ error: 'الموعد غير موجود' });
        }

        await appointment.update({ status });

        res.json({
            success: true,
            message: '✅ تم تحديث حالة الموعد'
        });
    } catch (error) {
        console.error('❌ خطأ في تحديث حالة الموعد:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

module.exports = {
    createAppointment,
    getTodayAppointments,
    getDoctorAppointments,
    updateAppointmentStatus
};
