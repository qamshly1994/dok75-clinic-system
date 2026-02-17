const { Questionnaire, Patient, User } = require('../models');

// إضافة استبيان جديد (جلسة)
const createQuestionnaire = async (req, res) => {
    try {
        const { patient_id, department_id, nutrition, dentistry, laser, doctor_notes } = req.body;

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
            laser: laser || {},
            doctor_notes: doctor_notes || ''
        });

        // تحديث الملف الطبي للمريض (إضافة ملخص)
        const sessionSummary = `[${new Date().toLocaleDateString('ar-SA')}] ${doctor_notes || 'لا توجد ملاحظات'}\n`;
        await patient.update({
            medical_history: patient.medical_history 
                ? sessionSummary + patient.medical_history 
                : sessionSummary
        });

        res.status(201).json({
            success: true,
            message: '✅ تم حفظ الجلسة بنجاح',
            questionnaire
        });

    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض جميع جلسات مريض
const getPatientQuestionnaires = async (req, res) => {
    try {
        const { patientId } = req.params;

        const questionnaires = await Questionnaire.findAll({
            where: { patient_id: patientId },
            include: [{
                model: User,
                as: 'doctor',
                attributes: ['id', 'full_name']
            }],
            order: [['session_date', 'DESC']]
        });

        res.json({
            success: true,
            count: questionnaires.length,
            questionnaires
        });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

module.exports = {
    createQuestionnaire,
    getPatientQuestionnaires
};
