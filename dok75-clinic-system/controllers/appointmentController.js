const { Appointment, Patient, User, Clinic } = require('../models');
const { Op } = require('sequelize');

// إنشاء موعد جديد
const createAppointment = async (req, res) => {
    try {
        const { patient_id, doctor_id, appointment_date, notes, clinic_id } = req.body;

        const patient = await Patient.findByPk(patient_id);
        if (!patient) {
            return res.status(404).json({ error: 'المريض غير موجود' });
        }

        const doctor = await User.findOne({
            where: { id: doctor_id, role: 'doctor', is_active: true }
        });
        if (!doctor) {
            return res.status(404).json({ error: 'الدكتور غير موجود أو غير نشط' });
        }

        const appointment = await Appointment.create({
            patient_id,
            doctor_id,
            receptionist_id: req.user.id,
            clinic_id: clinic_id || req.user.clinic_id,
            appointment_date,
            notes,
            status: 'scheduled',
            created_by: req.user.id
        });

        res.status(201).json({
            success: true,
            message: 'تم حجز الموعد بنجاح',
            appointment
        });

    } catch (error) {
        console.error('❌ خطأ في حجز الموعد:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض جميع المواعيد
const getAllAppointments = async (req, res) => {
    try {
        const { startDate, endDate, status, doctor_id } = req.query;
        let whereClause = {};

        if (req.user.role === 'doctor') {
            whereClause.doctor_id = req.user.id;
        }

        if (startDate && endDate) {
            whereClause.appointment_date = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        if (status) whereClause.status = status;
        if (doctor_id) whereClause.doctor_id = doctor_id;

        const appointments = await Appointment.findAll({
            where: whereClause,
            include: [
                { model: Patient },
                { model: User, as: 'doctor', attributes: ['id', 'full_name'] },
                { model: Clinic }
            ],
            order: [['appointment_date', 'ASC']]
        });

        res.json({ success: true, count: appointments.length, appointments });
    } catch (error) {
        console.error('❌ خطأ:', error);
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

        const whereClause = {
            appointment_date: { [Op.between]: [today, tomorrow] }
        };

        if (req.user.role === 'doctor') {
            whereClause.doctor_id = req.user.id;
        }

        const appointments = await Appointment.findAll({
            where: whereClause,
            include: [
                { model: Patient },
                { model: User, as: 'doctor', attributes: ['id', 'full_name'] }
            ],
            order: [['appointment_date', 'ASC']]
        });

        res.json({ success: true, count: appointments.length, appointments });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض مواعيد طبيب محدد
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

            whereClause.appointment_date = { [Op.between]: [startDate, endDate] };
        }

        const appointments = await Appointment.findAll({
            where: whereClause,
            include: [{ model: Patient }],
            order: [['appointment_date', 'ASC']]
        });

        res.json({ success: true, count: appointments.length, appointments });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض موعد محدد
const getAppointmentById = async (req, res) => {
    try {
        const appointment = await Appointment.findByPk(req.params.id, {
            include: [
                { model: Patient },
                { model: User, as: 'doctor', attributes: ['id', 'full_name'] },
                { model: User, as: 'receptionist', attributes: ['id', 'full_name'] },
                { model: Clinic }
            ]
        });

        if (!appointment) {
            return res.status(404).json({ error: 'الموعد غير موجود' });
        }

        res.json({ success: true, appointment });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// تحديث موعد
const updateAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByPk(req.params.id);
        if (!appointment) {
            return res.status(404).json({ error: 'الموعد غير موجود' });
        }

        const { appointment_date, notes } = req.body;

        await appointment.update({
            appointment_date: appointment_date || appointment.appointment_date,
            notes: notes || appointment.notes
        });

        res.json({ success: true, message: 'تم تحديث الموعد', appointment });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// تغيير حالة الموعد
const updateAppointmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const appointment = await Appointment.findByPk(req.params.id);

        if (!appointment) {
            return res.status(404).json({ error: 'الموعد غير موجود' });
        }

        if (req.user.role === 'doctor' && appointment.doctor_id !== req.user.id) {
            return res.status(403).json({ error: 'لا يمكنك تعديل موعد ليس لك' });
        }

        await appointment.update({ status });

        res.json({
            success: true,
            message: `تم تغيير الحالة إلى: ${
                status === 'scheduled' ? 'محجوز' :
                status === 'completed' ? 'مكتمل' : 'ملغي'
            }`
        });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// إلغاء موعد
const cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByPk(req.params.id);
        if (!appointment) {
            return res.status(404).json({ error: 'الموعد غير موجود' });
        }

        await appointment.update({ status: 'cancelled' });

        res.json({ success: true, message: 'تم إلغاء الموعد' });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// إحصائيات المواعيد
const getAppointmentStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const scheduled = await Appointment.count({
            where: {
                status: 'scheduled',
                ...(req.user.role === 'doctor' ? { doctor_id: req.user.id } : {})
            }
        });

        const completed = await Appointment.count({
            where: {
                status: 'completed',
                ...(req.user.role === 'doctor' ? { doctor_id: req.user.id } : {})
            }
        });

        const todayAppointments = await Appointment.count({
            where: {
                appointment_date: { [Op.between]: [today, tomorrow] },
                ...(req.user.role === 'doctor' ? { doctor_id: req.user.id } : {})
            }
        });

        res.json({
            success: true,
            stats: {
                scheduled,
                completed,
                today: todayAppointments
            }
        });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

module.exports = {
    createAppointment,
    getAllAppointments,
    getTodayAppointments,
    getDoctorAppointments,
    getAppointmentById,
    updateAppointment,
    updateAppointmentStatus,
    cancelAppointment,
    getAppointmentStats
};
