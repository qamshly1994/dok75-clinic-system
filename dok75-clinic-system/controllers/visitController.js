/**
 * ============================================
 * وحدة تحكم الزيارات (Visit Controller)
 * للدكتور فقط - كتابة وتعديل الملاحظات
 * ============================================
 */

const { Visit, Patient, User, Appointment } = require('../models');
const { Op } = require('sequelize');

// إنشاء زيارة جديدة (للدكتور فقط)
const createVisit = async (req, res) => {
    try {
        const { patient_id, appointment_id, complaint, diagnosis, treatment, doctor_notes, prescriptions } = req.body;

        const patient = await Patient.findByPk(patient_id);
        if (!patient) {
            return res.status(404).json({ error: 'المريض غير موجود' });
        }

        // التحقق من أن المريض يتبع هذا الدكتور
        const hasAccess = await Appointment.findOne({
            where: {
                patient_id,
                doctor_id: req.user.id
            }
        });

        if (!hasAccess && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'لا يمكنك إضافة زيارة لهذا المريض' });
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
        const visitSummary = `[${new Date().toLocaleDateString('ar-SA')}] ${diagnosis || 'تشخيص'}\nملاحظات: ${doctor_notes || 'لا توجد'}\n`;
        await patient.update({
            medical_history: patient.medical_history 
                ? visitSummary + patient.medical_history 
                : visitSummary
        });

        if (appointment_id) {
            await Appointment.update(
                { status: 'completed' },
                { where: { id: appointment_id } }
            );
        }

        const createdVisit = await Visit.findByPk(visit.id, {
            include: [
                { model: Patient },
                { model: User, as: 'doctor', attributes: ['id', 'full_name'] }
            ]
        });

        res.status(201).json({
            success: true,
            message: 'تم تسجيل الزيارة بنجاح',
            visit: createdVisit
        });

    } catch (error) {
        console.error('❌ خطأ في تسجيل الزيارة:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض زيارات مريض محدد (للدكتور)
const getPatientVisits = async (req, res) => {
    try {
        const { patientId } = req.params;

        const visits = await Visit.findAll({
            where: { patient_id: patientId },
            include: [
                { model: User, as: 'doctor', attributes: ['id', 'full_name'] },
                { model: Appointment }
            ],
            order: [['visit_date', 'DESC']]
        });

        res.json({ success: true, count: visits.length, visits });
    } catch (error) {
        console.error('❌ خطأ في جلب الزيارات:', error);
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
                { model: Appointment }
            ]
        });

        if (!visit) {
            return res.status(404).json({ error: 'الزيارة غير موجودة' });
        }

        res.json({ success: true, visit });
    } catch (error) {
        console.error('❌ خطأ في جلب الزيارة:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// تحديث زيارة (للدكتور الذي أنشأها)
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

        res.json({ 
            success: true, 
            message: 'تم تحديث الزيارة', 
            visit 
        });
    } catch (error) {
        console.error('❌ خطأ في تحديث الزيارة:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

module.exports = {
    createVisit,
    getPatientVisits,
    getVisitById,
    updateVisit
};
