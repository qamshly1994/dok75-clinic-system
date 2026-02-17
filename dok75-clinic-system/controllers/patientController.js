const { Patient, User, Clinic, Questionnaire } = require('../models');
const { Op } = require('sequelize');

// إنشاء رقم مريض موحد
async function generatePatientNumber() {
    const lastPatient = await Patient.findOne({
        order: [['id', 'DESC']]
    });
    const lastId = lastPatient ? lastPatient.id : 0;
    return `PAT-${String(lastId + 1).padStart(6, '0')}`;
}

// إضافة مريض جديد (للاستقبال أو للدكتور)
const createPatient = async (req, res) => {
    try {
        const { full_name, phone, age, gender, address } = req.body;

        // البحث عن مريض موجود بنفس الاسم والهاتف
        const existingPatient = await Patient.findOne({
            where: {
                [Op.and]: [
                    { full_name: { [Op.iLike]: full_name.trim() } },
                    { phone: phone.trim() }
                ]
            }
        });

        if (existingPatient) {
            return res.status(200).json({
                success: true,
                message: 'تم العثور على مريض سابق',
                patient: existingPatient,
                isExisting: true
            });
        }

        // إنشاء رقم مريض موحد
        const patient_number = await generatePatientNumber();

        // إنشاء المريض الجديد
        const patient = await Patient.create({
            patient_number,
            full_name: full_name.trim(),
            phone: phone.trim(),
            age: age || null,
            gender: gender || null,
            address: address || null,
            created_by: req.user.id,
            clinic_id: req.user.clinic_id || 1,
            medical_history: '',
            documents: []
        });

        res.status(201).json({
            success: true,
            message: 'تم إضافة المريض بنجاح',
            patient,
            isExisting: false
        });

    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض مرضى الدكتور فقط
const getDoctorPatients = async (req, res) => {
    try {
        const doctorId = req.user.id;

        // البحث عن جميع المرضى الذين لهم استبيانات مع هذا الدكتور
        const patients = await Patient.findAll({
            include: [{
                model: Questionnaire,
                as: 'questionnaires',
                where: { doctor_id: doctorId },
                required: true,
                separate: true,
                limit: 1,
                order: [['session_date', 'DESC']]
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: patients.length,
            patients
        });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض جميع المرضى (للاستقبال)
const getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.findAll({
            include: [{
                model: User,
                as: 'creator',
                attributes: ['id', 'full_name', 'role']
            }],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: patients.length,
            patients
        });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض ملف مريض كامل (بجميع جلساته)
const getPatientFullRecord = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id, {
            include: [{
                model: Questionnaire,
                as: 'questionnaires',
                include: [{
                    model: User,
                    as: 'doctor',
                    attributes: ['id', 'full_name']
                }],
                order: [['session_date', 'DESC']]
            }]
        });

        if (!patient) {
            return res.status(404).json({ error: 'المريض غير موجود' });
        }

        res.json({
            success: true,
            patient
        });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// البحث عن مريض بالاسم أو رقم الملف
const searchPatients = async (req, res) => {
    try {
        const { query } = req.params;

        const patients = await Patient.findAll({
            where: {
                [Op.or]: [
                    { patient_number: { [Op.iLike]: `%${query}%` } },
                    { full_name: { [Op.iLike]: `%${query}%` } },
                    { phone: { [Op.iLike]: `%${query}%` } }
                ]
            },
            limit: 20
        });

        res.json({
            success: true,
            count: patients.length,
            patients
        });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

module.exports = {
    createPatient,
    getDoctorPatients,
    getAllPatients,
    getPatientFullRecord,
    searchPatients
};
