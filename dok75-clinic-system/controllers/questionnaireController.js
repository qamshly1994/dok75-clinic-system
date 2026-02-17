/**
 * ============================================
 * وحدة تحكم الاستبيانات (Questionnaire Controller)
 * نسخة مبسطة ومختبرة
 * الموقع: /controllers/questionnaireController.js
 * ============================================
 */

const { Questionnaire, Patient } = require('../models');

// إنشاء استبيان جديد (مبسط)
const createQuestionnaire = async (req, res) => {
    try {
        console.log('📥 بيانات الاستبيان المستلمة:', req.body);
        
        const { patient_id, department_id, nutrition, dentistry, laser, general } = req.body;

        // التحقق من وجود patient_id
        if (!patient_id) {
            return res.status(400).json({ error: 'معرف المريض مطلوب' });
        }

        // التحقق من وجود المريض
        const patient = await Patient.findByPk(patient_id);
        if (!patient) {
            return res.status(404).json({ error: 'المريض غير موجود' });
        }

        // تحضير بيانات الاستبيان
        const questionnaireData = {
            patient_id,
            doctor_id: req.user.id,
            department_id: department_id || null,
            nutrition: nutrition || {},
            dentistry: dentistry || {},
            laser: laser || {},
            general: general || {}
        };

        console.log('📤 بيانات الاستبيان للحفظ:', questionnaireData);

        // إنشاء الاستبيان
        const questionnaire = await Questionnaire.create(questionnaireData);

        console.log('✅ تم إنشاء الاستبيان:', questionnaire.id);

        res.status(201).json({
            success: true,
            message: '✅ تم إنشاء الاستبيان بنجاح',
            questionnaire
        });

    } catch (error) {
        console.error('❌ خطأ تفصيلي:', error);
        res.status(500).json({ 
            error: 'حدث خطأ في الخادم',
            details: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

// عرض استبيانات مريض معين
const getPatientQuestionnaires = async (req, res) => {
    try {
        const { patientId } = req.params;

        const questionnaires = await Questionnaire.findAll({
            where: { patient_id: patientId },
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
        const questionnaire = await Questionnaire.findByPk(req.params.id);

        if (!questionnaire) {
            return res.status(404).json({ error: 'الاستبيان غير موجود' });
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
        const questionnaire = await Questionnaire.findByPk(req.params.id);

        if (!questionnaire) {
            return res.status(404).json({ error: 'الاستبيان غير موجود' });
        }

        const { nutrition, dentistry, laser, general } = req.body;

        await questionnaire.update({
            nutrition: nutrition || questionnaire.nutrition,
            dentistry: dentistry || questionnaire.dentistry,
            laser: laser || questionnaire.laser,
            general: general || questionnaire.general
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

module.exports = {
    createQuestionnaire,
    getPatientQuestionnaires,
    getQuestionnaireById,
    updateQuestionnaire
};
