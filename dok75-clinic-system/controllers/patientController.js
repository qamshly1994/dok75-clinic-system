/**
 * ============================================
 * وحدة تحكم المرضى (Patient Controller)
 * ============================================
 */

const { Patient, User, Clinic } = require('../models');
const { Op } = require('sequelize');

// ✅ إنشاء مريض جديد
const createPatient = async (req, res) => {
    try {
        const { 
            full_name, phone, alternate_phone, email, age, 
            gender, address, medical_history, medications, 
            allergies, clinic_id 
        } = req.body;

        // التحقق من وجود العيادة
        const clinic = await Clinic.findByPk(clinic_id);
        if (!clinic) {
            return res.status(404).json({ error: 'العيادة غير موجودة' });
        }

        // إنشاء المريض
        const patient = await Patient.create({
            full_name,
            phone,
            alternate_phone,
            email,
            age,
            gender,
            address,
            medical_history,
            medications,
            allergies,
            clinic_id,
            created_by: req.user.id,
            is_active: true
        });

        res.status(201).json({
            success: true,
            message: 'تم إضافة المريض بنجاح',
            patient
        });

    } catch (error) {
        console.error('❌ خطأ في إنشاء المريض:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ عرض جميع المرضى
const getAllPatients = async (req, res) => {
    try {
        let whereClause = { is_active: true };

        // إذا كان المستخدم دكتور، يرى فقط مرضى عيادته
        if (req.user.role === 'doctor') {
            whereClause.clinic_id = req.user.clinic_id;
        }

        const patients = await Patient.findAll({
            where: whereClause,
            include: [
                { model: Clinic, as: 'clinic' },
                { 
                    model: User, 
                    as: 'creator',
                    attributes: ['id', 'full_name']
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json({
            success: true,
            count: patients.length,
            patients
        });
    } catch (error) {
        console.error('❌ خطأ في جلب المرضى:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ عرض مريض محدد
const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id, {
            include: [
                { model: Clinic, as: 'clinic' },
                { 
                    model: User, 
                    as: 'creator',
                    attributes: ['id', 'full_name']
                }
            ]
        });

        if (!patient) {
            return res.status(404).json({ error: 'المريض غير موجود' });
        }

        res.json({ 
            success: true, 
            patient 
        });
    } catch (error) {
        console.error('❌ خطأ في جلب المريض:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ تحديث بيانات مريض
const updatePatient = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);

        if (!patient) {
            return res.status(404).json({ error: 'المريض غير موجود' });
        }

        // التحقق من الصلاحيات
        if (req.user.role === 'doctor' && patient.clinic_id !== req.user.clinic_id) {
            return res.status(403).json({ error: 'لا يمكنك تعديل مرضى عيادة أخرى' });
        }

        const { 
            full_name, phone, alternate_phone, email, age, 
            gender, address, medical_history, medications, allergies 
        } = req.body;

        await patient.update({
            full_name: full_name || patient.full_name,
            phone: phone || patient.phone,
            alternate_phone: alternate_phone || patient.alternate_phone,
            email: email || patient.email,
            age: age || patient.age,
            gender: gender || patient.gender,
            address: address || patient.address,
            medical_history: medical_history || patient.medical_history,
            medications: medications || patient.medications,
            allergies: allergies || patient.allergies
        });

        res.json({
            success: true,
            message: 'تم تحديث بيانات المريض بنجاح',
            patient
        });
    } catch (error) {
        console.error('❌ خطأ في تحديث المريض:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ حذف مريض
const deletePatient = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);

        if (!patient) {
            return res.status(404).json({ error: 'المريض غير موجود' });
        }

        if (req.user.role !== 'super_admin') {
            return res.status(403).json({ error: 'لا يمكنك حذف المريض' });
        }

        await patient.destroy();

        res.json({ 
            success: true, 
            message: 'تم حذف المريض بنجاح' 
        });
    } catch (error) {
        console.error('❌ خطأ في حذف المريض:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ البحث عن مريض
const searchPatients = async (req, res) => {
    try {
        const { query } = req.params;
        let whereClause = {
            [Op.or]: [
                { full_name: { [Op.iLike]: `%${query}%` } },
                { phone: { [Op.iLike]: `%${query}%` } },
                { email: { [Op.iLike]: `%${query}%` } }
            ]
        };

        // إذا كان المستخدم دكتور، يرى فقط مرضى عيادته
        if (req.user.role === 'doctor') {
            whereClause.clinic_id = req.user.clinic_id;
        }

        const patients = await Patient.findAll({
            where: whereClause,
            limit: 20,
            order: [['full_name', 'ASC']]
        });

        res.json({
            success: true,
            count: patients.length,
            patients
        });
    } catch (error) {
        console.error('❌ خطأ في البحث عن المرضى:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ عرض مواعيد مريض
const getPatientAppointments = async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);

        if (!patient) {
            return res.status(404).json({ error: 'المريض غير موجود' });
        }

        const appointments = await Appointment.findAll({
            where: { patient_id: patient.id },
            include: [
                { 
                    model: User, 
                    as: 'doctor',
                    attributes: ['id', 'full_name']
                }
            ],
            order: [['appointment_date', 'DESC']]
        });

        res.json({
            success: true,
            count: appointments.length,
            appointments
        });
    } catch (error) {
        console.error('❌ خطأ في جلب المواعيد:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

module.exports = {
    createPatient,
    getAllPatients,
    getPatientById,
    updatePatient,
    deletePatient,
    searchPatients,
    getPatientAppointments
};
