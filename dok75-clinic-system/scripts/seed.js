/**
 * ============================================
 * Auto Seed Admin - إنشاء المشرف العام تلقائياً
 * نسخة محسنة لإنشاء مستخدم Admin
 * ============================================
 */

const { User, Clinic } = require('../models');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

// دالة تسجيل الأحداث
function log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type}] ${message}\n`;
    console.log(logMessage.trim());
    
    const logDir = path.join(__dirname, '../logs');
    if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(logDir, 'seed.log');
    fs.appendFileSync(logFile, logMessage);
}

// دالة إنشاء المشرف العام
async function seedAdmin() {
    try {
        log('🔍 بدء التحقق من المستخدمين...');
        
        // التحقق من وجود عيادة
        let clinic = await Clinic.findOne();
        if (!clinic) {
            clinic = await Clinic.create({
                name: process.env.CLINIC_NAME || 'مركز DOK75 الطبي',
                address: 'المركز الرئيسي',
                phone: process.env.DEV_PHONE || '0995973668',
                is_active: true
            });
            log('✅ تم إنشاء عيادة افتراضية');
        }

        // التحقق من وجود مستخدم بصلاحية admin
        const adminExists = await User.findOne({ where: { role: 'admin' } });
        
        if (adminExists) {
            log(`✅ يوجد بالفعل مستخدم بصلاحية admin: ${adminExists.username}`);
            return;
        }

        // التحقق من وجود super_admin وتحويله إلى admin
        const superAdmin = await User.findOne({ where: { role: 'super_admin' } });
        
        if (superAdmin) {
            log(`🔄 تحويل المستخدم ${superAdmin.username} من super_admin إلى admin...`);
            await superAdmin.update({ role: 'admin' });
            log(`✅ تم تحويل المستخدم إلى admin بنجاح`);
            
            // حفظ بيانات الدخول
            saveCredentials(superAdmin.username, 'Admin@2026', superAdmin.full_name);
            return;
        }

        // إذا لم يوجد أي مستخدم، إنشاء admin جديد
        log('⚠️ لم يتم العثور على مستخدم admin. جاري إنشاء مستخدم جديد...');
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@2026', salt);
        
        const admin = await User.create({
            username: process.env.ADMIN_USERNAME || 'admin',
            password: hashedPassword,
            full_name: process.env.ADMIN_FULL_NAME || 'المهندس عبدالرزاق',
            role: 'admin',
            clinic_id: clinic.id,
            is_active: true
        });

        log('✅ تم إنشاء مستخدم admin جديد بنجاح', 'SUCCESS');
        saveCredentials(admin.username, process.env.ADMIN_PASSWORD || 'Admin@2026', admin.full_name);

    } catch (error) {
        log(`❌ خطأ في إنشاء المشرف: ${error.message}`, 'ERROR');
        console.error(error);
    }
}

// دالة حفظ بيانات الدخول
function saveCredentials(username, password, fullName) {
    try {
        const credentialsFile = path.join(__dirname, '../admin-credentials.txt');
        const credentials = `
===========================================
✅ بيانات الدخول إلى النظام
===========================================
📅 التاريخ: ${new Date().toLocaleString('ar-SA')}
📋 اسم المستخدم: ${username}
🔑 كلمة المرور: ${password}
👤 الاسم الكامل: ${fullName}
🔗 رابط الدخول: ${process.env.APP_URL || 'https://dok75-clinic-system.onrender.com'}
===========================================
⚠️ احتفظ بهذه المعلومات في مكان آمن
===========================================
        `;
        
        fs.writeFileSync(credentialsFile, credentials);
        log(`✅ تم حفظ بيانات الدخول في: ${credentialsFile}`, 'SUCCESS');
    } catch (err) {
        log(`⚠️ لم يتم حفظ ملف البيانات: ${err.message}`, 'WARNING');
    }
}

module.exports = seedAdmin;
