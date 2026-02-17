/**
 * ============================================
 * وحدة تحكم المرضى (Patient Controller)
 * نسخة محدثة مع صلاحيات كاملة
 * ============================================
 */

const { Patient, User, Clinic, Appointment, Visit } = require('../models');
const { Op } = require('sequelize');

// إنشاء رقم مريض موحد
async function generatePatientNumber() {
    const lastPatient = await Patient.findOne({ order: [['id', 'DESC']] });
    const lastId = lastPatient ? lastPatient.id : 0;
    return `PAT-${String(lastId + 1).padStart(6, '0')}`;
}

// إضافة مريض جديد (الكل)
const createPatient = async (req, res) => {
    try {
        const { full_name, phone, age, gender, address, notes } = req.body;

        // البحث عن مريض موجود
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

        const patient_number = await generatePatientNumber();

        const patient = await Patient.create({
            patient_number,
            full_name: full_name.trim(),
            phone: phone.trim(),
            age: age || null,
            gender: gender || null,
            address: address || null,
            notes: notes || '',
            clinic_id: req.user.clinic_id || 1,
            created_by: req.user.id,
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
        console.error('❌ خطأ في إضافة المريض:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض جميع المرضى (للاستقبال والمشرف)
const getAllPatients = async (req, res) => {
    try {
        const patients = await Patient.findAll({
            include: [
                { model: Clinic },
                { model: User, as: 'creator', attributes: ['id', 'full_name'] }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, count: patients.length, patients });
    } catch (error) {
        console.error('❌ خطأ في جلب المرضى:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض مرضى الدكتور فقط
const getDoctorPatients = async (req, res) => {
    try {
        // البحث عن المرضى الذين لهم مواعيد أو زيارات مع هذا الدكتور
        const patients = await Patient.findAll({
            include: [
                {
                    model: Appointment,
                    where: { doctor_id: req.user.id },
                    required: true,
                    attributes: []
                },
                {
                    model: Visit,
                    required: false,
                    limit: 1,
                    order: [['visit_date', 'DESC']]
                }
            ],
            distinct: true,
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, count: patients.length, patients });
    } catch (error) {
        console.error('❌ خطأ في جلب مرضى الدكتور:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض مريض محدد
const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id, {
            include: [
                { model: Clinic },
                { model: User, as: 'creator', attributes: ['id', 'full_name'] },
                {
                    model: Appointment,
                    where: req.user.role === 'doctor' ? { doctor_id: req.user.id } : {},
                    required: req.user.role === 'doctor',
                    order: [['appointment_date', 'DESC']]
                },
                {
                    model: Visit,
                    where: req.user.role === 'doctor' ? { doctor_id: req.user.id } : {},
                    required: false,
                    include: [
                        { model: User, as: 'doctor', attributes: ['id', 'full_name'] }
                    ],
                    order: [['visit_date', 'DESC']]
                }
            ]
        });

        if (!patient) {
            return res.status(404).json({ error: 'المريض غير موجود' });
        }

        res.json({ success: true, patient });
    } catch (error) {
        console.error('❌ خطأ في جلب المريض:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// تحديث بيانات مريض (للاستقبال والدكتور)
const updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);
        if (!patient) {
            return res.status(404).json({ error: 'المريض غير موجود' });
        }

        // التحقق من صلاحية الدكتور
        if (req.user.role === 'doctor') {
            const hasAccess = await Appointment.findOne({
                where: {
                    patient_id: patient.id,
                    doctor_id: req.user.id
                }
            });
            if (!hasAccess) {
                return res.status(403).json({ error: 'لا يمكنك تعديل بيانات هذا المريض' });
            }
        }

        const { full_name, phone, age, gender, address, notes } = req.body;

        await patient.update({
            full_name: full_name || patient.full_name,
            phone: phone || patient.phone,
            age: age || patient.age,
            gender: gender || patient.gender,
            address: address || patient.address,
            notes: notes || patient.notes
        });

        res.json({ 
            success: true, 
            message: 'تم تحديث بيانات المريض', 
            patient 
        });
    } catch (error) {
        console.error('❌ خطأ في تحديث المريض:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// البحث عن مريض
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

        res.json({ success: true, count: patients.length, patients });
    } catch (error) {
        console.error('❌ خطأ في البحث:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// إحصائيات المرضى
const getPatientStats = async (req, res) => {
    try {
        const total = await Patient.count();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayCount = await Patient.count({
            where: { createdAt: { [Op.gte]: today } }
        });

        res.json({
            success: true,
            stats: { total, today: todayCount }
        });
    } catch (error) {
        console.error('❌ خطأ في جلب الإحصائيات:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

module.exports = {
    createPatient,
    getAllPatients,
    getDoctorPatients,
    getPatientById,
    updatePatient,
    searchPatients,
    getPatientStats
};
