const { Clinic, Department, User } = require('../models');

// ✅ إنشاء عيادة جديدة
const createClinic = async (req, res) => {
    try {
        const { name, address, phone, email, logo, description } = req.body;

        // التحقق من وجود العيادة
        const existingClinic = await Clinic.findOne({ where: { name } });
        if (existingClinic) {
            return res.status(400).json({ error: 'اسم العيادة موجود بالفعل' });
        }

        // إنشاء العيادة
        const clinic = await Clinic.create({
            name,
            address,
            phone,
            email,
            logo,
            description,
            is_active: true
        });

        res.status(201).json({
            success: true,
            message: '✅ تم إنشاء العيادة بنجاح',
            clinic
        });
    } catch (error) {
        console.error('❌ خطأ في إنشاء العيادة:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ عرض جميع العيادات
const getAllClinics = async (req, res) => {
    try {
        const clinics = await Clinic.findAll({
            include: [
                { 
                    model: Department, 
                    as: 'departments',
                    where: { is_active: true },
                    required: false
                }
            ],
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            count: clinics.length,
            clinics
        });
    } catch (error) {
        console.error('❌ خطأ في جلب العيادات:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ عرض عيادة محددة
const getClinicById = async (req, res) => {
    try {
        const clinic = await Clinic.findByPk(req.params.id, {
            include: [
                { 
                    model: Department, 
                    as: 'departments',
                    include: ['specializations']
                },
                { 
                    model: User, 
                    as: 'doctors',
                    where: { role: 'doctor', is_active: true },
                    required: false,
                    attributes: { exclude: ['password'] }
                }
            ]
        });

        if (!clinic) {
            return res.status(404).json({ error: 'العيادة غير موجودة' });
        }

        res.json({ success: true, clinic });
    } catch (error) {
        console.error('❌ خطأ في جلب العيادة:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ تحديث بيانات عيادة
const updateClinic = async (req, res) => {
    try {
        const clinic = await Clinic.findByPk(req.params.id);

        if (!clinic) {
            return res.status(404).json({ error: 'العيادة غير موجودة' });
        }

        const { name, address, phone, email, logo, description } = req.body;

        await clinic.update({
            name: name || clinic.name,
            address: address || clinic.address,
            phone: phone || clinic.phone,
            email: email || clinic.email,
            logo: logo || clinic.logo,
            description: description || clinic.description
        });

        res.json({
            success: true,
            message: '✅ تم تحديث بيانات العيادة بنجاح',
            clinic
        });
    } catch (error) {
        console.error('❌ خطأ في تحديث العيادة:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ حذف عيادة
const deleteClinic = async (req, res) => {
    try {
        const clinic = await Clinic.findByPk(req.params.id);

        if (!clinic) {
            return res.status(404).json({ error: 'العيادة غير موجودة' });
        }

        // التحقق من عدم وجود أقسام تابعة
        const departmentsCount = await Department.count({ where: { clinic_id: clinic.id } });
        if (departmentsCount > 0) {
            return res.status(400).json({ 
                error: 'لا يمكن حذف العيادة لأنها تحتوي على أقسام',
                departmentsCount
            });
        }

        await clinic.destroy();

        res.json({ 
            success: true, 
            message: '✅ تم حذف العيادة بنجاح' 
        });
    } catch (error) {
        console.error('❌ خطأ في حذف العيادة:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ تغيير حالة العيادة
const toggleClinicStatus = async (req, res) => {
    try {
        const clinic = await Clinic.findByPk(req.params.id);

        if (!clinic) {
            return res.status(404).json({ error: 'العيادة غير موجودة' });
        }

        await clinic.update({ is_active: !clinic.is_active });

        res.json({
            success: true,
            message: clinic.is_active ? '✅ تم تفعيل العيادة' : '✅ تم تعطيل العيادة',
            is_active: clinic.is_active
        });
    } catch (error) {
        console.error('❌ خطأ في تغيير حالة العيادة:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ عرض أقسام عيادة محددة
const getClinicDepartments = async (req, res) => {
    try {
        const clinic = await Clinic.findByPk(req.params.id);

        if (!clinic) {
            return res.status(404).json({ error: 'العيادة غير موجودة' });
        }

        const departments = await Department.findAll({
            where: { clinic_id: clinic.id, is_active: true },
            include: ['specializations'],
            order: [['name', 'ASC']]
        });

        res.json({
            success: true,
            count: departments.length,
            departments
        });
    } catch (error) {
        console.error('❌ خطأ في جلب الأقسام:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ✅ عرض أطباء عيادة محددة
const getClinicDoctors = async (req, res) => {
    try {
        const clinic = await Clinic.findByPk(req.params.id);

        if (!clinic) {
            return res.status(404).json({ error: 'العيادة غير موجودة' });
        }

        const doctors = await User.findAll({
            where: { clinic_id: clinic.id, role: 'doctor', is_active: true },
            attributes: { exclude: ['password'] },
            include: ['department', 'specialization'],
            order: [['full_name', 'ASC']]
        });

        res.json({
            success: true,
            count: doctors.length,
            doctors
        });
    } catch (error) {
        console.error('❌ خطأ في جلب الأطباء:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

module.exports = {
    createClinic,
    getAllClinics,
    getClinicById,
    updateClinic,
    deleteClinic,
    toggleClinicStatus,
    getClinicDepartments,
    getClinicDoctors
};
