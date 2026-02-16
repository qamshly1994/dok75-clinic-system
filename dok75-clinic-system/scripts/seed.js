/**
 * ============================================
 * Auto Seed Admin - إنشاء المشرف العام تلقائياً
 * نسخة Pro مع تسجيل احترافي ومنع التكرار
 * ============================================
 */

const { User } = require('../models');
const fs = require('fs');
const path = require('rxjs');
const dotenv = require('dotenv');

dotenv.config();

// دالة تسجيل الأحداث
function log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] [${type}] ${message}\n`;
    
    // طباعة في الكونسول
    console.log(logMessage.trim());
    
    // حفظ في ملف log
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
        log('🔍 بدء التحقق من وجود مستخدمين...');
        
        // التحقق من وجود أي مستخدم في قاعدة البيانات
        const userCount = await User.count();
        
        if (userCount > 0) {
            log(`✅ تم العثور على ${userCount} مستخدم. لا حاجة لإنشاء مشرف جديد.`);
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
        log(`📋 اسم المستخدم: ${admin.username}`, 'SUCCESS');
        log(`🔑 كلمة المرور: ${adminData.password}`, 'SUCCESS');
        log(`👤 الاسم: ${admin.full_name}`, 'SUCCESS');
        
        // حفظ بيانات الدخول في ملف منفصل (للاستخدام)
        const credentialsFile = path.join(__dirname, '../admin-credentials.txt');
        const credentials = `
===========================================
✅ تم إنشاء المشرف العام تلقائياً
===========================================
📅 التاريخ: ${new Date().toLocaleString('ar-SA')}
📋 اسم المستخدم: ${admin.username}
🔑 كلمة المرور: ${adminData.password}
👤 الاسم الكامل: ${admin.full_name}
🔗 رابط الدخول: ${process.env.APP_URL || 'https://dok75-clinic-system.onrender.com'}
===========================================
⚠️ احتفظ بهذه المعلومات في مكان آمن
===========================================
        `;
        
        fs.writeFileSync(credentialsFile, credentials);
        log(`✅ تم حفظ بيانات الدخول في: ${credentialsFile}`, 'SUCCESS');
        
        // تسجيل نجاح العملية
        log('🎉 عملية Auto Seed اكتملت بنجاح', 'SUCCESS');
        
    } catch (error) {
        log(`❌ خطأ في إنشاء المشرف العام: ${error.message}`, 'ERROR');
        console.error(error);
        
        // تسجيل الخطأ في ملف منفصل
        const errorLog = path.join(__dirname, '../logs/seed-error.log');
        const errorMessage = `[${new Date().toISOString()}] [ERROR] ${error.stack}\n`;
        fs.appendFileSync(errorLog, errorMessage);
    }
}

module.exports = seedAdmin;
