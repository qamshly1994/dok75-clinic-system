// التحقق من أن المستخدم Admin
const adminOnly = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ 
            error: 'ممنوع',
            message: 'هذه الصلاحية متاحة فقط لمدير النظام' 
        });
    }
    next();
};

// التحقق من أن المستخدم Doctor
const doctorOnly = (req, res, next) => {
    if (req.user.role !== 'doctor' && req.user.role !== 'admin') {
        return res.status(403).json({ 
            error: 'ممنوع',
            message: 'هذه الصلاحية متاحة فقط للأطباء' 
        });
    }
    next();
};

// التحقق من أن المستخدم Receptionist
const receptionistOnly = (req, res, next) => {
    if (req.user.role !== 'receptionist' && req.user.role !== 'admin') {
        return res.status(403).json({ 
            error: 'ممنوع',
            message: 'هذه الصلاحية متاحة فقط لموظفي الاستقبال' 
        });
    }
    next();
};

// التحقق من أن الطبيب يرى مرضاه فقط
const doctorOwnPatient = async (req, res, next) => {
    if (req.user.role === 'admin') return next();
    
    const { Visit, Appointment } = require('../models');
    
    if (req.params.patientId) {
        const hasAccess = await Visit.findOne({
            where: {
                patient_id: req.params.patientId,
                doctor_id: req.user.id
            }
        });
        
        if (!hasAccess) {
            return res.status(403).json({ 
                error: 'ممنوع',
                message: 'لا يمكنك الوصول لبيانات هذا المريض' 
            });
        }
    }
    next();
};

// التحقق من أن الموعد يخص نفس العيادة
const sameClinic = (req, res, next) => {
    const clinicId = req.params.clinicId || req.body.clinic_id;
    
    if (req.user.role === 'admin') return next();
    
    if (req.user.clinic_id !== parseInt(clinicId)) {
        return res.status(403).json({ 
            error: 'ممنوع',
            message: 'لا يمكنك الوصول لبيانات عيادة أخرى' 
        });
    }
    
    next();
};

module.exports = { 
    adminOnly, 
    doctorOnly, 
    receptionistOnly,
    doctorOwnPatient,
    sameClinic
};
