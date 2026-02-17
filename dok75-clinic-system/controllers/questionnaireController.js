const { Questionnaire, Patient } = require('../models');

// إنشاء استبيان جديد
const createQuestionnaire = async (req, res) => {
    try {
        const { patient_id, department_id, nutrition, dentistry, laser } = req.body;
        
        // التحقق من وجود patient_id
        if (!patient_id) {
            return res.status(400).json({ error: 'معرف المريض مطلوب' });
        }

        // التحقق من وجود المريض
        const patient = await Patient.findByPk(patient_id);
        if (!patient) {
            return res.status(404).json({ error: 'المريض غير موجود' });
        }

        // إنشاء الاستبيان
        const questionnaire = await Questionnaire.create({
            patient_id,
            doctor_id: req.user.id,
            department_id: department_id || null,
            nutrition: nutrition || {},
            dentistry: dentistry || {},
            laser: laser || {}
        });

        res.status(201).json({
            success: true,
            message: 'تم إنشاء الاستبيان بنجاح',
            questionnaire
        });

    } catch (error) {
        console.error('خطأ في إنشاء الاستبيان:', error);
        res.status(500).json({ 
            error: 'حدث خطأ في الخادم',
            details: error.message 
        });
    }
};

// عرض استبيانات مريض
const getPatientQuestionnaires = async (req, res) => {
    try {
        const { patientId } = req.params;
        
        const questionnaires = await Questionnaire.findAll({
            where: { patient_id: patientId },
            order: [['created_at', 'DESC']]
        });

        res.json({
            success: true,
            questionnaires
        });
    } catch (error) {
        console.error('خطأ في جلب الاستبيانات:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

module.exports = {
    createQuestionnaire,
    getPatientQuestionnaires
};
