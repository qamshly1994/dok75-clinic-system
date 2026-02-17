// التحقق من أن المستخدم مشرف عام
const superAdminOnly = (req, res, next) => {
    if (req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'هذه الصلاحية للمشرف العام فقط' });
    }
    next();
};

// التحقق من أن المستخدم دكتور
const doctorOnly = (req, res, next) => {
    if (req.user.role !== 'doctor' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'هذه الصلاحية للأطباء فقط' });
    }
    next();
};

// التحقق من أن المستخدم موظف استقبال
const receptionistOnly = (req, res, next) => {
    if (req.user.role !== 'receptionist' && req.user.role !== 'super_admin') {
        return res.status(403).json({ error: 'هذه الصلاحية لموظفي الاستقبال فقط' });
    }
    next();
};

module.exports = { superAdminOnly, doctorOnly, receptionistOnly };
