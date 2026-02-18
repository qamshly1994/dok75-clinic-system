/**
 * ============================================
 * Auto Seed Admin - إنشاء المشرف العام تلقائياً
 * نسخة محسنة مع إصلاح كلمات المرور
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

// دالة إصلاح كلمات المرور القديمة (جديدة)
async function fixAllPasswords() {
    try {
        log('🔧 بدء إصلاح كلمات المرور القديمة...');
        
        const users = await User.findAll();
        let fixedCount = 0;
        
        for (const user of users) {
            // التحقق من أن كلمة المرور مشفرة (تبدأ بـ $2a$)
            if (!user.password.startsWith('$2a$')) {
                log(`⚠️ كلمة مرور غير مشفرة للمستخدم: ${user.username}`);
                
                // إعادة تشفير كلمة المرور
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user.password, salt);
                
                await user.update({ password: hashedPassword });
                log(`✅ تم إصلاح كلمة مرور المستخدم: ${user.username}`);
                fixedCount++;
            }
        }
        
        if (fixedCount === 0) {
            log('✅ جميع كلمات المرور مشفرة بشكل صحيح');
        } else {
            log(`✅ تم إصلاح ${fixedCount} كلمات مرور`);
        }
    } catch (error) {
        log(`❌ خطأ في إصلاح كلمات المرور: ${error.message}`, 'ERROR');
    }
}

// دالة إنشاء المشرف العام
async function seedAdmin() {
    try {
        log('🔍 بدء التحقق من المستخدمين...');
        
        // إصلاح كلمات المرور أولاً (جديد)
        await fixAllPasswords();
        
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

        // التأكد من وجود مستخدم admin (جديد)
        let adminUser = await User.findOne({ where: { role: 'admin' } });
        
        if (!adminUser) {
            // البحث عن super_admin
            const superAdmin = await User.findOne({ where: { role: 'super_admin' } });
            
            if (superAdmin) {
                // تحويل super_admin إلى admin
                await superAdmin.update({ role: 'admin' });
                log('✅ تم تحويل super_admin إلى admin');
                
                // تحديث كلمة المرور للتأكد
                const hashedPassword = await bcrypt.hash('Admin@2026', 10);
                await superAdmin.update({ password: hashedPassword });
                log('✅ تم تحديث كلمة مرور admin إلى Admin@2026');
                
                saveCredentials(superAdmin.username, 'Admin@2026', superAdmin.full_name);
            } else {
                // إنشاء admin جديد
                const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@2026', 10);
                adminUser = await User.create({
                    username: process.env.ADMIN_USERNAME || 'admin',
                    password: hashedPassword,
                    full_name: process.env.ADMIN_FULL_NAME || 'المهندس عبدالرزاق',
                    role: 'admin',
                    clinic_id: clinic.id,
                    is_active: true
                });
                log('✅ تم إنشاء مستخدم admin جديد');
                saveCredentials(adminUser.username, process.env.ADMIN_PASSWORD || 'Admin@2026', adminUser.full_name);
            }
        } else {
            // تحديث كلمة مرور admin للتأكد
            const hashedPassword = await bcrypt.hash('Admin@2026', 10);
            await adminUser.update({ password: hashedPassword });
            log('✅ تم تحديث كلمة مرور admin إلى Admin@2026');
        }

        // التأكد من أن جميع المستخدمين لديهم كلمات مرور مشفرة
        const users = await User.findAll();
        for (const user of users) {
            if (!user.password.startsWith('$2a$')) {
                const hashedPassword = await bcrypt.hash('Temp123', 10);
                await user.update({ password: hashedPassword });
                log(`⚠️ تم إصلاح كلمة مرور المستخدم ${user.username} (كلمة المرور الجديدة: Temp123)`);
            }
        }

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
