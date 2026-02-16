// ✅ التحقق من دور المستخدم (سوبر أدمن فقط)
const superAdminOnly = (req, res, next) => {
    if (req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'هذه الصلاحية متاحة فقط للمشرف العام' });
    }
    next();
};

// ✅ التحقق من دور المستخدم (طبيب)
const doctorOnly = (req, res, next) => {
    if (req.user.role !== 'doctor' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'هذه الصلاحية متاحة فقط للأطباء' });
    }
    next();
};

// ✅ التحقق من دور المستخدم (موظف استقبال)
const receptionistOnly = (req, res, next) => {
    if (req.user.role !== 'receptionist' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'هذه الصلاحية متاحة فقط لموظفي الاستقبال' });
    }
    next();
};

// ✅ التحقق من أن المستخدم ينتمي لنفس العيادة
const sameClinic = (req, res, next) => {
    const clinicId = req.params.clinicId || req.body.clinic_id;
    
    if (req.user.role === 'super_admin') {
        return next(); // السوبر أدمن يرى كل شيء
    }
    
    if (req.user.clinic_id !== parseInt(clinicId)) {
        return res.status(403).json({ error: 'لا يمكنك الوصول لبيانات عيادة أخرى' });
    }
    
    next();
};

module.exports = { superAdminOnly, doctorOnly, receptionistOnly, sameClinic };
