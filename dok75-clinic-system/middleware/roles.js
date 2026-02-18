/**
 * ============================================
 * وسيط التحقق من الصلاحيات (Roles)
 * نسخة كاملة مع جميع الصلاحيات
 * ============================================
 */

const { Appointment, Visit } = require('../models');

// ============================================
// التحقق من الأدوار الأساسية
// ============================================

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

// ============================================
// التحقق من صلاحيات المواعيد
// ============================================

// التحقق من أن الموعد يخص المستخدم (للدكتور)
const appointmentBelongsToDoctor = async (req, res, next) => {
    try {
        // المشرف له صلاحية كاملة
        if (req.user.role === 'admin') return next();
        
        const appointment = await Appointment.findByPk(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({ error: 'الموعد غير موجود' });
        }
        
        // التحقق للدكتور
        if (req.user.role === 'doctor' && appointment.doctor_id !== req.user.id) {
            return res.status(403).json({ 
                error: 'ممنوع',
                message: 'هذا الموعد لا يخصك' 
            });
        }
        
        // موظف الاستقبال يمكنه الوصول لأي موعد
        if (req.user.role === 'receptionist') {
            return next();
        }
        
        req.appointment = appointment;
        next();
    } catch (error) {
        console.error('❌ خطأ في التحقق من الموعد:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// التحقق من صلاحية تعديل الموعد
const canModifyAppointment = async (req, res, next) => {
    try {
        // المشرف له صلاحية كاملة
        if (req.user.role === 'admin') return next();
        
        const appointment = await Appointment.findByPk(req.params.id);
        
        if (!appointment) {
            return res.status(404).json({ error: 'الموعد غير موجود' });
        }
        
        // الاستقبال يمكنه تعديل أي موعد
        if (req.user.role === 'receptionist') {
            return next();
        }
        
        // الدكتور يمكنه تعديل مواعيده فقط
        if (req.user.role === 'doctor' && appointment.doctor_id === req.user.id) {
            return next();
        }
        
        return res.status(403).json({ 
            error: 'ممنوع',
            message: 'لا تملك صلاحية تعديل هذا الموعد' 
        });
    } catch (error) {
        console.error('❌ خطأ في التحقق من صلاحية التعديل:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// التحقق من صلاحية حذف الموعد (للاستقبال فقط)
const canDeleteAppointment = async (req, res, next) => {
    try {
        // المشرف له صلاحية كاملة
        if (req.user.role === 'admin') return next();
        
        // فقط الاستقبال يمكنه حذف المواعيد
        if (req.user.role === 'receptionist') {
            return next();
        }
        
        return res.status(403).json({ 
            error: 'ممنوع',
            message: 'حذف المواعيد متاح فقط لموظفي الاستقبال' 
        });
    } catch (error) {
        console.error('❌ خطأ في التحقق من صلاحية الحذف:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ============================================
// التحقق من صلاحيات المرضى
// ============================================

// التحقق من أن المريض يخص المستخدم (للدكتور)
const patientBelongsToDoctor = async (req, res, next) => {
    try {
        // المشرف وموظف الاستقبال لهم صلاحية كاملة
        if (req.user.role === 'admin' || req.user.role === 'receptionist') return next();
        
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

// التحقق من صلاحية تعديل بيانات المريض
const canEditPatient = async (req, res, next) => {
    try {
        // المشرف له صلاحية كاملة
        if (req.user.role === 'admin') return next();
        
        const patientId = req.params.id;
        
        // الاستقبال يمكنه تعديل أي مريض
        if (req.user.role === 'receptionist') {
            return next();
        }
        
        // الدكتور يمكنه تعديل مرضاه فقط
        if (req.user.role === 'doctor') {
            const hasAppointment = await Appointment.findOne({
                where: {
                    patient_id: patientId,
                    doctor_id: req.user.id
                }
            });
            
            if (hasAppointment) {
                return next();
            }
        }
        
        return res.status(403).json({ 
            error: 'ممنوع',
            message: 'لا تملك صلاحية تعديل بيانات هذا المريض' 
        });
    } catch (error) {
        console.error('❌ خطأ في التحقق من صلاحية تعديل المريض:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ============================================
// التحقق من صلاحيات الزيارات (للدكتور فقط)
// ============================================

// التحقق من صلاحية إنشاء/تعديل الزيارات (للدكتور فقط)
const visitAccessOnly = async (req, res, next) => {
    try {
        // المشرف له صلاحية كاملة
        if (req.user.role === 'admin') return next();
        
        // فقط الأطباء يمكنهم التعامل مع الزيارات
        if (req.user.role === 'doctor') {
            return next();
        }
        
        return res.status(403).json({ 
            error: 'ممنوع',
            message: 'هذه الصلاحية متاحة فقط للأطباء' 
        });
    } catch (error) {
        console.error('❌ خطأ في التحقق من صلاحية الزيارة:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// التحقق من أن الزيارة تخص الدكتور
const visitBelongsToDoctor = async (req, res, next) => {
    try {
        // المشرف له صلاحية كاملة
        if (req.user.role === 'admin') return next();
        
        const visit = await Visit.findByPk(req.params.id);
        
        if (!visit) {
            return res.status(404).json({ error: 'الزيارة غير موجودة' });
        }
        
        // التحقق للدكتور
        if (req.user.role === 'doctor' && visit.doctor_id !== req.user.id) {
            return res.status(403).json({ 
                error: 'ممنوع',
                message: 'هذه الزيارة لا تخصك' 
            });
        }
        
        req.visit = visit;
        next();
    } catch (error) {
        console.error('❌ خطأ في التحقق من الزيارة:', error);
        res.status(500).json({ error: 'حدث خطأ في الخادم' });
    }
};

// ============================================
// تصدير جميع الدوال
// ============================================

module.exports = { 
    // التحقق من الأدوار
    adminOnly, 
    receptionistOnly, 
    doctorOnly,
    
    // صلاحيات المواعيد
    appointmentBelongsToDoctor,
    canModifyAppointment,
    canDeleteAppointment,
    
    // صلاحيات المرضى
    patientBelongsToDoctor,
    canEditPatient,
    
    // صلاحيات الزيارات
    visitAccessOnly,
    visitBelongsToDoctor
};
