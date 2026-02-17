const { Visit, Patient, User, Appointment, Clinic } = require('../models');
const { Op } = require('sequelize');

// إنشاء زيارة جديدة
const createVisit = async (req, res) => {
    try {
        const { patient_id, appointment_id, complaint, diagnosis, treatment, doctor_notes, prescriptions } = req.body;

        const patient = await Patient.findByPk(patient_id);
        if (!patient) {
            return res.status(404).json({ error: 'المريض غير موجود' });
        }

        const visit = await Visit.create({
            patient_id,
            doctor_id: req.user.id,
            appointment_id: appointment_id || null,
            clinic_id: patient.clinic_id,
            visit_date: new Date(),
            complaint,
            diagnosis,
            treatment,
            doctor_notes,
            prescriptions: prescriptions || []
        });

        // تحديث سجل المريض الطبي
        const visitSummary = `[${new Date().toLocaleDateString('ar-SA')}] ${diagnosis || 'تشخيص'}\n`;
        await patient.update({
            medical_history: patient.medical_history 
                ? visitSummary + patient.medical_history 
                : visitSummary
        });

        // تحديث حالة الموعد إذا كان مرتبطاً
        if (appointment_id) {
            await Appointment.update(
                { status: 'completed' },
                { where: { id: appointment_id } }
            );
        }

        res.status(201).json({
            success: true,
            message: 'تم تسجيل الزيارة بنجاح',
            visit
        });

    } catch (error) {
        console.error('❌ خطأ في تسجيل الزيارة:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض جميع الزيارات (للأدمن)
const getAllVisits = async (req, res) => {
    try {
        const visits = await Visit.findAll({
            include: [
                { model: Patient },
                { model: User, as: 'doctor', attributes: ['id', 'full_name'] },
                { model: Appointment },
                { model: Clinic }
            ],
            order: [['visit_date', 'DESC']],
            limit: 100
        });

        res.json({ success: true, count: visits.length, visits });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض زيارات مريض محدد
const getPatientVisits = async (req, res) => {
    try {
        const visits = await Visit.findAll({
            where: { patient_id: req.params.patientId },
            include: [
                { model: User, as: 'doctor', attributes: ['id', 'full_name'] },
                { model: Appointment }
            ],
            order: [['visit_date', 'DESC']]
        });

        res.json({ success: true, count: visits.length, visits });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض زيارة محددة
const getVisitById = async (req, res) => {
    try {
        const visit = await Visit.findByPk(req.params.id, {
            include: [
                { model: Patient },
                { model: User, as: 'doctor', attributes: ['id', 'full_name'] },
                { model: Appointment },
                { model: Clinic }
            ]
        });

        if (!visit) {
            return res.status(404).json({ error: 'الزيارة غير موجودة' });
        }

        res.json({ success: true, visit });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// تحديث زيارة
const updateVisit = async (req, res) => {
    try {
        const visit = await Visit.findByPk(req.params.id);
        if (!visit) {
            return res.status(404).json({ error: 'الزيارة غير موجودة' });
        }

        if (visit.doctor_id !== req.user.id && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'لا يمكنك تعديل هذه الزيارة' });
        }

        const { complaint, diagnosis, treatment, doctor_notes, prescriptions } = req.body;

        await visit.update({
            complaint: complaint || visit.complaint,
            diagnosis: diagnosis || visit.diagnosis,
            treatment: treatment || visit.treatment,
            doctor_notes: doctor_notes || visit.doctor_notes,
            prescriptions: prescriptions || visit.prescriptions
        });

        res.json({ success: true, message: 'تم تحديث الزيارة', visit });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// حذف زيارة
const deleteVisit = async (req, res) => {
    try {
        const visit = await Visit.findByPk(req.params.id);
        if (!visit) {
            return res.status(404).json({ error: 'الزيارة غير موجودة' });
        }

        await visit.destroy();
        res.json({ success: true, message: 'تم حذف الزيارة' });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// إحصائيات الزيارات
const getVisitStats = async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const total = await Visit.count();
        const todayVisits = await Visit.count({
            where: { visit_date: { [Op.gte]: today, [Op.lt]: tomorrow } }
        });

        res.json({
            success: true,
            stats: { total, today: todayVisits }
        });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

module.exports = {
    createVisit,
    getAllVisits,
    getPatientVisits,
    getVisitById,
    updateVisit,
    deleteVisit,
    getVisitStats
};
