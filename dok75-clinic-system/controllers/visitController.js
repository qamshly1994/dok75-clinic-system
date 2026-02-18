const { Visit, Patient, User, Appointment } = require('../models');

// إنشاء زيارة جديدة
const createVisit = async (req, res) => {
    try {
        const { patient_id, appointment_id, complaint, diagnosis, treatment, doctor_notes } = req.body;

        const patient = await Patient.findByPk(patient_id);
        if (!patient) {
            return res.status(404).json({ error: 'المريض غير موجود' });
        }

        const visit = await Visit.create({
            patient_id,
            doctor_id: req.user.id,
            appointment_id: appointment_id || null,
            clinic_id: patient.clinic_id,
            complaint,
            diagnosis,
            treatment,
            doctor_notes
        });

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
        console.error('خطأ في إنشاء الزيارة:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض زيارات مريض محدد
const getPatientVisits = async (req, res) => {
    try {
        const visits = await Visit.findAll({
            where: { patient_id: req.params.patientId },
            include: [{ model: User, as: 'doctor', attributes: ['id', 'full_name'] }],
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, visits });
    } catch (error) {
        console.error('خطأ في جلب الزيارات:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض زيارة محددة
const getVisitById = async (req, res) => {
    try {
        const visit = await Visit.findByPk(req.params.id, {
            include: [
                { model: Patient },
                { model: User, as: 'doctor', attributes: ['id', 'full_name'] }
            ]
        });
        if (!visit) {
            return res.status(404).json({ error: 'الزيارة غير موجودة' });
        }
        res.json({ success: true, visit });
    } catch (error) {
        console.error('خطأ في جلب الزيارة:', error);
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
            return res.status(403).json({ error: 'غير مصرح لك بتعديل هذه الزيارة' });
        }
        await visit.update(req.body);
        res.json({ success: true, message: 'تم تحديث الزيارة', visit });
    } catch (error) {
        console.error('خطأ في تحديث الزيارة:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ التصدير الصحيح (تأكد من أن جميع الأسماء مطابقة)
module.exports = {
    createVisit,
    getPatientVisits,
    getVisitById,
    updateVisit
};
