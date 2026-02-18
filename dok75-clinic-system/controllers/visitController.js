const { Visit, Patient } = require('../models');

// 1. إنشاء زيارة جديدة
const createVisit = async (req, res) => {
    try {
        const { patient_id, complaint, diagnosis, treatment, doctor_notes } = req.body;

        const patient = await Patient.findByPk(patient_id);
        if (!patient) {
            return res.status(404).json({ error: 'المريض غير موجود' });
        }

        const visit = await Visit.create({
            patient_id,
            doctor_id: req.user.id,
            clinic_id: patient.clinic_id,
            complaint,
            diagnosis,
            treatment,
            doctor_notes
        });

        res.status(201).json({
            success: true,
            message: 'تم تسجيل الزيارة',
            visit
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 2. عرض زيارات مريض
const getPatientVisits = async (req, res) => {
    try {
        const visits = await Visit.findAll({
            where: { patient_id: req.params.patientId },
            order: [['createdAt', 'DESC']]
        });
        res.json({ success: true, visits });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. عرض زيارة محددة
const getVisitById = async (req, res) => {
    try {
        const visit = await Visit.findByPk(req.params.id);
        if (!visit) {
            return res.status(404).json({ error: 'غير موجود' });
        }
        res.json({ success: true, visit });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 4. تحديث زيارة
const updateVisit = async (req, res) => {
    try {
        const visit = await Visit.findByPk(req.params.id);
        if (!visit) {
            return res.status(404).json({ error: 'غير موجود' });
        }
        
        await visit.update(req.body);
        res.json({ success: true, message: 'تم التحديث', visit });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    createVisit,
    getPatientVisits,
    getVisitById,
    updateVisit
};
