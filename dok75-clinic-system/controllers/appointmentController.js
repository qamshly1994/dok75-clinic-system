/**
 * ============================================
 * وحدة تحكم المواعيد (Appointment Controller)
 * نسخة محدثة مع الصلاحيات الكاملة
 * ============================================
 */

const { Appointment, Patient, User, Clinic } = require('../models');
const { Op } = require('sequelize');

// إنشاء موعد جديد (للاستقبال والدكتور)
const createAppointment = async (req, res) => {
    try {
        const { patient_id, doctor_id, appointment_date, notes } = req.body;

        // التحقق من وجود المريض
        const patient = await Patient.findByPk(patient_id);
        if (!patient) {
            return res.status(404).json({ error: 'المريض غير موجود' });
        }

        // التحقق من وجود الدكتور (حتى لو كان غير نشط)
        const doctor = await User.findOne({
            where: { id: doctor_id, role: 'doctor' } // بدون شرط is_active
        });
        if (!doctor) {
            return res.status(404).json({ error: 'الدكتور غير موجود' });
        }

        // التحقق من صلاحية الدكتور
        if (req.user.role === 'doctor' && req.user.id !== doctor_id) {
            return res.status(403).json({ error: 'لا يمكنك حجز موعد لدكتور آخر' });
        }

        // إنشاء الموعد
        const appointment = await Appointment.create({
            patient_id,
            doctor_id,
            receptionist_id: req.user.role === 'receptionist' ? req.user.id : null,
            clinic_id: patient.clinic_id,
            appointment_date,
            notes,
            status: 'scheduled',
            created_by: req.user.id
        });

        const createdAppointment = await Appointment.findByPk(appointment.id, {
            include: [
                { model: Patient },
                { model: User, as: 'doctor', attributes: ['id', 'full_name'] }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'تم حجز الموعد بنجاح',
            appointment: createdAppointment
        });

    } catch (error) {
        console.error('❌ خطأ في حجز الموعد:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض جميع المواعيد (حسب الصلاحية)
const getAllAppointments = async (req, res) => {
    try {
        const { startDate, endDate, status, doctor_id } = req.query;
        let whereClause = {};

        // فلترة حسب الصلاحية
        if (req.user.role === 'doctor') {
            whereClause.doctor_id = req.user.id;
        }

        // فلترة حسب التاريخ
        if (startDate && endDate) {
            whereClause.appointment_date = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        }

        if (status) whereClause.status = status;
        if (doctor_id && req.user.role !== 'doctor') whereClause.doctor_id = doctor_id;

        const appointments = await Appointment.findAll({
            where: whereClause,
            include: [
                { model: Patient },
                { model: User, as: 'doctor', attributes: ['id', 'full_name'] },
                { model: Clinic }
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

// عرض مواعيد طبيب محدد
const getDoctorAppointments = async (req, res) => {
    try {
        const { doctorId } = req.params;
        const { date } = req.query;

        // التحقق من الصلاحية
        if (req.user.role === 'doctor' && req.user.id !== parseInt(doctorId)) {
            return res.status(403).json({ error: 'لا يمكنك عرض مواعيد دكتور آخر' });
        }

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

        // التحقق من الصلاحية
        if (req.user.role === 'doctor' && appointment.doctor_id !== req.user.id) {
            return res.status(403).json({ error: 'هذا الموعد لا يخصك' });
        }

        res.json({ success: true, appointment });
    } catch (error) {
        console.error('❌ خطأ في جلب الموعد:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// تحديث موعد (للاستقبال والدكتور)
const updateAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByPk(req.params.id);
        if (!appointment) {
            return res.status(404).json({ error: 'الموعد غير موجود' });
        }

        // التحقق من الصلاحية
        if (req.user.role === 'doctor' && appointment.doctor_id !== req.user.id) {
            return res.status(403).json({ error: 'لا يمكنك تعديل موعد ليس لك' });
        }

        const { appointment_date, doctor_id, notes } = req.body;

        // إذا كان الدكتور يريد تغيير الدكتور (غير مسموح)
        if (req.user.role === 'doctor' && doctor_id && doctor_id !== appointment.doctor_id) {
            return res.status(403).json({ error: 'لا يمكنك تحويل الموعد لدكتور آخر' });
        }

        await appointment.update({
            appointment_date: appointment_date || appointment.appointment_date,
            doctor_id: doctor_id || appointment.doctor_id,
            notes: notes || appointment.notes
        });

        const updatedAppointment = await Appointment.findByPk(appointment.id, {
            include: [
                { model: Patient },
                { model: User, as: 'doctor' }
            ]
        });

        res.json({
            success: true,
            message: 'تم تحديث الموعد بنجاح',
            appointment: updatedAppointment
        });
    } catch (error) {
        console.error('❌ خطأ في تحديث الموعد:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// تغيير حالة الموعد (إلغاء)
const cancelAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByPk(req.params.id);
        if (!appointment) {
            return res.status(404).json({ error: 'الموعد غير موجود' });
        }

        // التحقق من الصلاحية
        if (req.user.role === 'doctor' && appointment.doctor_id !== req.user.id) {
            return res.status(403).json({ error: 'لا يمكنك إلغاء موعد ليس لك' });
        }

        await appointment.update({ status: 'cancelled' });

        res.json({
            success: true,
            message: 'تم إلغاء الموعد بنجاح'
        });
    } catch (error) {
        console.error('❌ خطأ في إلغاء الموعد:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// حذف موعد (للاستقبال فقط)
const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment.findByPk(req.params.id);
        if (!appointment) {
            return res.status(404).json({ error: 'الموعد غير موجود' });
        }

        // فقط الاستقبال والمشرف يمكنهم الحذف
        if (req.user.role !== 'receptionist' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'لا يمكنك حذف الموعد' });
        }

        await appointment.destroy();

        res.json({
            success: true,
            message: 'تم حذف الموعد بنجاح'
        });
    } catch (error) {
        console.error('❌ خطأ في حذف الموعد:', error);
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

        let whereClause = {};
        if (req.user.role === 'doctor') {
            whereClause.doctor_id = req.user.id;
        }

        const scheduled = await Appointment.count({
            where: { ...whereClause, status: 'scheduled' }
        });

        const completed = await Appointment.count({
            where: { ...whereClause, status: 'completed' }
        });

        const cancelled = await Appointment.count({
            where: { ...whereClause, status: 'cancelled' }
        });

        const todayAppointments = await Appointment.count({
            where: {
                ...whereClause,
                appointment_date: { [Op.between]: [today, tomorrow] }
            }
        });

        res.json({
            success: true,
            stats: {
                scheduled,
                completed,
                cancelled,
                today: todayAppointments
            }
        });
    } catch (error) {
        console.error('❌ خطأ في جلب الإحصائيات:', error);
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
    cancelAppointment,
    deleteAppointment,
    getAppointmentStats
};
