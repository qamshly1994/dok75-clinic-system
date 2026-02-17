/**
 * ============================================
 * وحدة تحكم الاستبيانات (Questionnaire Controller)
 * الموقع: /controllers/questionnaireController.js
 * ============================================
 */

const { Questionnaire, Patient, User, Department, Appointment } = require('../models');

// إنشاء استبيان جديد
const createQuestionnaire = async (req, res) => {
    try {
        const { patient_id, department_id, appointment_id, nutrition, dentistry, laser, general } = req.body;

        // التحقق من وجود المريض
        const patient = await Patient.findByPk(patient_id);
        if (!patient) {
            return res.status(404).json({ error: 'المريض غير موجود' });
        }

        // التحقق من أن المريض لنفس عيادة الطبيب
        if (patient.clinic_id !== req.user.clinic_id && req.user.role !== 'super_admin') {
            return res.status(403).json({ error: 'لا يمكنك إضافة استبيان لمريض من عيادة أخرى' });
        }

        // إنشاء الاستبيان
        const questionnaire = await Questionnaire.create({
            patient_id,
            doctor_id: req.user.id,
            department_id,
            appointment_id,
            nutrition: nutrition || {},
            dentistry: dentistry || {},
            laser: laser || {},
            general: general || {}
        });

        // جلب الاستبيان مع العلاقات
        const createdQuestionnaire = await Questionnaire.findByPk(questionnaire.id, {
            include: [
                { model: Patient, as: 'patient' },
                { model: User, as: 'doctor', attributes: ['id', 'full_name'] },
                { model: Department, as: 'department' }
            ]
        });

        res.status(201).json({
            success: true,
            message: '✅ تم إنشاء الاستبيان بنجاح',
            questionnaire: createdQuestionnaire
        });

    } catch (error) {
        console.error('❌ خطأ في إنشاء الاستبيان:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض استبيانات مريض معين
const getPatientQuestionnaires = async (req, res) => {
    try {
        const { patientId } = req.params;

        // التحقق من وجود المريض
        const patient = await Patient.findByPk(patientId);
        if (!patient) {
            return res.status(404).json({ error: 'المريض غير موجود' });
        }

        // التحقق من الصلاحيات
        if (req.user.role === 'doctor' && patient.clinic_id !== req.user.clinic_id) {
            return res.status(403).json({ error: 'لا يمكنك عرض استبيانات مرضى عيادة أخرى' });
        }

        const questionnaires = await Questionnaire.findAll({
            where: { patient_id: patientId },
            include: [
                { model: User, as: 'doctor', attributes: ['id', 'full_name'] },
                { model: Department, as: 'department' },
                { model: Appointment, as: 'appointment' }
            ],
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            count: questionnaires.length,
            questionnaires
        });
    } catch (error) {
        console.error('❌ خطأ في جلب الاستبيانات:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض استبيان محدد
const getQuestionnaireById = async (req, res) => {
    try {
        const questionnaire = await Questionnaire.findByPk(req.params.id, {
            include: [
                { model: Patient, as: 'patient' },
                { model: User, as: 'doctor', attributes: ['id', 'full_name'] },
                { model: Department, as: 'department' },
                { model: Appointment, as: 'appointment' }
            ]
        });

        if (!questionnaire) {
            return res.status(404).json({ error: 'الاستبيان غير موجود' });
        }

        // التحقق من الصلاحيات
        if (req.user.role === 'doctor' && questionnaire.patient.clinic_id !== req.user.clinic_id) {
            return res.status(403).json({ error: 'لا يمكنك عرض هذا الاستبيان' });
        }

        res.json({ success: true, questionnaire });
    } catch (error) {
        console.error('❌ خطأ في جلب الاستبيان:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// تحديث استبيان
const updateQuestionnaire = async (req, res) => {
    try {
        const questionnaire = await Questionnaire.findByPk(req.params.id, {
            include: [{ model: Patient, as: 'patient' }]
        });

        if (!questionnaire) {
            return res.status(404).json({ error: 'الاستبيان غير موجود' });
        }

        // التحقق من أن الدكتور هو من أنشأ الاستبيان أو مشرف
        if (req.user.id !== questionnaire.doctor_id && req.user.role !== 'super_admin') {
            return res.status(403).json({ error: 'لا يمكنك تعديل استبيان ليس لك' });
        }

        const { nutrition, dentistry, laser, general } = req.body;

        await questionnaire.update({
            nutrition: nutrition || questionnaire.nutrition,
            dentistry: dentistry || questionnaire.dentistry,
            laser: laser || questionnaire.laser,
            general: general || questionnaire.general,
            updated_at: new Date()
        });

        res.json({
            success: true,
            message: '✅ تم تحديث الاستبيان بنجاح',
            questionnaire
        });
    } catch (error) {
        console.error('❌ خطأ في تحديث الاستبيان:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض استبيانات قسم معين
const getDepartmentQuestionnaires = async (req, res) => {
    try {
        const { departmentId } = req.params;

        const questionnaires = await Questionnaire.findAll({
            where: { department_id: departmentId },
            include: [
                { model: Patient, as: 'patient' },
                { model: User, as: 'doctor', attributes: ['id', 'full_name'] }
            ],
            order: [['created_at', 'DESC']],
            limit: 50
        });

        res.json({
            success: true,
            count: questionnaires.length,
            questionnaires
        });
    } catch (error) {
        console.error('❌ خطأ في جلب استبيانات القسم:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

module.exports = {
    createQuestionnaire,
    getPatientQuestionnaires,
    getQuestionnaireById,
    updateQuestionnaire,
    getDepartmentQuestionnaires
};
