/**
 * ============================================
 * وسيط التحقق من الصلاحيات (Roles)
 * ============================================
 */

// التحقق من أن المستخدم مشرف عام
const superAdminOnly = (req, res, next) => {
    if (req.user.role !== 'super_admin') {
        return res.status(403).json({ 
            error: 'ممنوع',
            message: 'هذه الصلاحية متاحة فقط للمشرف العام' 
        });
    }
    next();
};

// التحقق من أن المستخدم طبيب
const doctorOnly = (req, res, next) => {
    if (req.user.role !== 'doctor' && req.user.role !== 'super_admin') {
        return res.status(403).json({ 
            error: 'ممنوع',
            message: 'هذه الصلاحية متاحة فقط للأطباء' 
        });
    }
    next();
};

// التحقق من أن المستخدم موظف استقبال
const receptionistOnly = (req, res, next) => {
    if (req.user.role !== 'receptionist' && req.user.role !== 'super_admin') {
        return res.status(403).json({ 
            error: 'ممنوع',
            message: 'هذه الصلاحية متاحة فقط لموظفي الاستقبال' 
        });
    }
    next();
};

// التحقق من أن المستخدم ينتمي لنفس العيادة
const sameClinic = (req, res, next) => {
    const clinicId = req.params.clinicId || req.body.clinic_id;
    
    if (req.user.role === 'super_admin') {
        return next(); // السوبر أدمن يرى كل شيء
    }
    
    if (req.user.clinic_id !== parseInt(clinicId)) {
        return res.status(403).json({ 
            error: 'ممنوع',
            message: 'لا يمكنك الوصول لبيانات عيادة أخرى' 
        });
    }
    
    next();
};

// التحقق من أن المستخدم هو نفسه أو مشرف
const selfOrAdmin = (req, res, next) => {
    const userId = parseInt(req.params.id);
    
    if (req.user.role === 'super_admin' || req.user.id === userId) {
        return next();
    }
    
    return res.status(403).json({ 
        error: 'ممنوع',
        message: 'لا يمكنك تعديل بيانات مستخدم آخر' 
    });
};

module.exports = { 
    superAdminOnly, 
    doctorOnly, 
    receptionistOnly, 
    sameClinic,
    selfOrAdmin 
};
