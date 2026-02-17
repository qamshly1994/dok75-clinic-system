/**
 * ============================================
 * وسيط التحقق من الصلاحيات (Roles)
 * نسخة محدثة حسب الصلاحيات المطلوبة
 * ============================================
 */

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

// التحقق من أن الموعد يخص المستخدم (للدكتور)
const appointmentBelongsToDoctor = async (req, res, next) => {
    try {
        if (req.user.role === 'admin') return next();
        
        const { Appointment } = require('../models');
        const appointment = await Appointment.findByPk(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({ error: 'الموعد غير موجود' });
        }
        
        if (req.user.role === 'doctor' && appointment.doctor_id !== req.user.id) {
            return res.status(403).json({ 
                error: 'ممنوع',
                message: 'هذا الموعد لا يخصك' 
            });
        }
        
        req.appointment = appointment;
        next();
    } catch (error) {
        console.error('❌ خطأ في التحقق من الموعد:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// التحقق من أن المريض يخص المستخدم (للدكتور)
const patientBelongsToDoctor = async (req, res, next) => {
    try {
        if (req.user.role === 'admin' || req.user.role === 'receptionist') return next();
        
        const { Appointment, Visit } = require('../models');
        const patientId = req.params.id || req.body.patient_id;
        
        // التحقق مما إذا كان للمريض مواعيد أو زيارات مع هذا الدكتور
        const hasAppointment = await Appointment.findOne({
            where: {
                patient_id: patientId,
                doctor_id: req.user.id
            }
        });
        
        const hasVisit = await Visit.findOne({
            where: {
                patient_id: patientId,
                doctor_id: req.user.id
            }
        });
        
        if (!hasAppointment && !hasVisit && req.user.role === 'doctor') {
            return res.status(403).json({ 
                error: 'ممنوع',
                message: 'هذا المريض لا يتبع لك' 
            });
        }
        
        next();
    } catch (error) {
        console.error('❌ خطأ في التحقق من المريض:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

module.exports = { 
    adminOnly, 
    receptionistOnly, 
    doctorOnly,
    appointmentBelongsToDoctor,
    patientBelongsToDoctor
};
