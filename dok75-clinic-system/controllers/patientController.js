const { Patient, User, Clinic, Visit, Appointment } = require('../models');
const { Op } = require('sequelize');

// إنشاء رقم مريض موحد
async function generatePatientNumber() {
    const lastPatient = await Patient.findOne({ order: [['id', 'DESC']] });
    const lastId = lastPatient ? lastPatient.id : 0;
    return `PAT-${String(lastId + 1).padStart(6, '0')}`;
}

// إضافة مريض جديد
const createPatient = async (req, res) => {
    try {
        const { full_name, phone, age, birth_date, gender, address, notes, clinic_id } = req.body;

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
            birth_date: birth_date || null,
            gender: gender || null,
            address: address || null,
            notes: notes || '',
            clinic_id: clinic_id || req.user.clinic_id,
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

// عرض جميع المرضى (للأدمن والاستقبال)
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
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض مرضى الدكتور فقط
const getDoctorPatients = async (req, res) => {
    try {
        const patients = await Patient.findAll({
            include: [{
                model: Visit,
                where: { doctor_id: req.user.id },
                required: true
            }],
            distinct: true,
            order: [['createdAt', 'DESC']]
        });

        res.json({ success: true, count: patients.length, patients });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض مريض محدد مع سجل زياراته
const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id, {
            include: [
                { model: Clinic },
                { model: User, as: 'creator', attributes: ['id', 'full_name'] },
                {
                    model: Visit,
                    include: [
                        { model: User, as: 'doctor', attributes: ['id', 'full_name'] },
                        { model: Appointment }
                    ],
                    order: [['visit_date', 'DESC']]
                },
                {
                    model: Appointment,
                    limit: 10,
                    order: [['appointment_date', 'DESC']]
                }
            ]
        });

        if (!patient) {
            return res.status(404).json({ error: 'المريض غير موجود' });
        }

        res.json({ success: true, patient });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// تحديث بيانات مريض
const updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);
        if (!patient) {
            return res.status(404).json({ error: 'المريض غير موجود' });
        }

        const { full_name, phone, age, birth_date, gender, address, notes } = req.body;

        await patient.update({
            full_name: full_name || patient.full_name,
            phone: phone || patient.phone,
            age: age || patient.age,
            birth_date: birth_date || patient.birth_date,
            gender: gender || patient.gender,
            address: address || patient.address,
            notes: notes || patient.notes
        });

        res.json({ success: true, message: 'تم تحديث البيانات', patient });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// حذف مريض
const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);
        if (!patient) {
            return res.status(404).json({ error: 'المريض غير موجود' });
        }

        await patient.destroy();
        res.json({ success: true, message: 'تم حذف المريض' });
    } catch (error) {
        console.error('❌ خطأ:', error);
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
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// سجل زيارات المريض
const getPatientVisits = async (req, res) => {
    try {
        const visits = await Visit.findAll({
            where: { patient_id: req.params.id },
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

// إحصائيات المرضى
const getPatientStats = async (req, res) => {
    try {
        const total = await Patient.count();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayCount = await Patient.count({
            where: {
                createdAt: { [Op.gte]: today }
            }
        });

        res.json({
            success: true,
            stats: {
                total,
                today: todayCount
            }
        });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

module.exports = {
    createPatient,
    getAllPatients,
    getDoctorPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    searchPatients,
    getPatientVisits,
    getPatientStats
};
