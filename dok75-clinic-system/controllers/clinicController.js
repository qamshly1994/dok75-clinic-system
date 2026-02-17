const { Clinic, User, Patient, Appointment } = require('../models');

// إنشاء عيادة جديدة
const createClinic = async (req, res) => {
    try {
        const { name, address, phone, email, description } = req.body;

        const clinic = await Clinic.create({
            name,
            address,
            phone,
            email,
            description,
            is_active: true
        });

        res.status(201).json({
            success: true,
            message: 'تم إنشاء العيادة بنجاح',
            clinic
        });

    } catch (error) {
        console.error('❌ خطأ في إنشاء العيادة:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض جميع العيادات
const getAllClinics = async (req, res) => {
    try {
        const clinics = await Clinic.findAll({
            order: [['name', 'ASC']]
        });

        res.json({ success: true, count: clinics.length, clinics });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// عرض عيادة محددة
const getClinicById = async (req, res) => {
    try {
        const clinic = await Clinic.findByPk(req.params.id, {
            include: [
                { model: User, as: 'doctors', where: { role: 'doctor' }, required: false },
                { model: Patient, limit: 10 },
                { model: Appointment, limit: 10 }
            ]
        });

        if (!clinic) {
            return res.status(404).json({ error: 'العيادة غير موجودة' });
        }

        res.json({ success: true, clinic });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// تحديث بيانات عيادة
const updateClinic = async (req, res) => {
    try {
        const clinic = await Clinic.findByPk(req.params.id);
        if (!clinic) {
            return res.status(404).json({ error: 'العيادة غير موجودة' });
        }

        const { name, address, phone, email, description } = req.body;

        await clinic.update({
            name: name || clinic.name,
            address: address || clinic.address,
            phone: phone || clinic.phone,
            email: email || clinic.email,
            description: description || clinic.description
        });

        res.json({ success: true, message: 'تم تحديث العيادة', clinic });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// حذف عيادة
const deleteClinic = async (req, res) => {
    try {
        const clinic = await Clinic.findByPk(req.params.id);
        if (!clinic) {
            return res.status(404).json({ error: 'العيادة غير موجودة' });
        }

        const doctorsCount = await User.count({ where: { clinic_id: clinic.id } });
        if (doctorsCount > 0) {
            return res.status(400).json({
                error: 'لا يمكن حذف العيادة لأنها تحتوي على أطباء',
                doctorsCount
            });
        }

        await clinic.destroy();
        res.json({ success: true, message: 'تم حذف العيادة' });
    } catch (error) {
        console.error('❌ خطأ:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

module.exports = {
    createClinic,
    getAllClinics,
    getClinicById,
    updateClinic,
    deleteClinic
};
