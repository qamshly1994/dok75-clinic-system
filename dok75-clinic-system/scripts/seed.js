/**
 * ============================================
 * Auto Seed Admin - نسخة فورس (تعمل بدون Shell)
 * ============================================
 */

const { User } = require('../models');
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

// دالة إنشاء المشرف العام (نسخة فورس)
async function seedAdmin() {
    try {
        log('🔍 بدء التحقق من وجود مستخدمين...');
        
        // التحقق من وجود أي مستخدم في قاعدة البيانات
        const userCount = await User.count();
        
        if (userCount > 0) {
            log(`✅ تم العثور على ${userCount} مستخدم.`);
            
            // التأكد من وجود admin بالتحديد
            const adminExists = await User.findOne({ where: { username: 'admin' } });
            
            if (!adminExists) {
                log('⚠️ لا يوجد مستخدم admin رغم وجود مستخدمين آخرين. جاري إنشاؤه...');
                
                const adminData = {
                    username: process.env.ADMIN_USERNAME || 'admin',
                    password: process.env.ADMIN_PASSWORD || 'Admin@2026',
                    full_name: process.env.ADMIN_FULL_NAME || 'المهندس عبدالرزاق',
                    role: 'super_admin',
                    is_active: true,
                    created_at: new Date(),
                    updated_at: new Date()
                };
                
                const admin = await User.create(adminData);
                log(`✅ تم إنشاء المشرف العام بنجاح!`, 'SUCCESS');
                saveCredentials(admin, adminData.password);
            } else {
                log(`✅ المشرف العام موجود بالفعل`);
            }
            return;
        }
        
        log('⚠️ لم يتم العثور على مستخدمين. جاري إنشاء المشرف العام...');
        
        // بيانات المشرف العام (من متغيرات البيئة)
        const adminData = {
            username: process.env.ADMIN_USERNAME || 'admin',
            password: process.env.ADMIN_PASSWORD || 'Admin@2026',
            full_name: process.env.ADMIN_FULL_NAME || 'المهندس عبدالرزاق',
            role: 'super_admin',
            is_active: true,
            created_at: new Date(),
            updated_at: new Date()
        };
        
        // إنشاء المستخدم (التشفير يتم تلقائياً في hooks)
        const admin = await User.create(adminData);
        
        log(`✅ تم إنشاء المشرف العام بنجاح!`, 'SUCCESS');
        saveCredentials(admin, adminData.password);
        
    } catch (error) {
        log(`❌ خطأ في إنشاء المشرف العام: ${error.message}`, 'ERROR');
        console.error(error);
    }
}

// دالة حفظ بيانات الدخول
function saveCredentials(admin, password) {
    try {
        const credentialsFile = path.join(__dirname, '../admin-credentials.txt');
        const credentials = `
===========================================
✅ تم إنشاء المشرف العام تلقائياً
===========================================
📅 التاريخ: ${new Date().toLocaleString('ar-SA')}
📋 اسم المستخدم: ${admin.username}
🔑 كلمة المرور: ${password}
👤 الاسم الكامل: ${admin.full_name}
🔗 رابط الدخول: ${process.env.APP_URL || 'https://dok75-clinic-system.onrender.com'}
===========================================
⚠️ احتفظ بهذه المعلومات في مكان آمن
===========================================
        `;
        
        fs.writeFileSync(credentialsFile, credentials);
        log(`✅ تم حفظ بيانات الدخول في: ${credentialsFile}`, 'SUCCESS');
        log('🎉 عملية Auto Seed اكتملت بنجاح', 'SUCCESS');
    } catch (err) {
        log(`⚠️ لم يتم حفظ ملف البيانات: ${err.message}`, 'WARNING');
    }
}

module.exports = seedAdmin;
