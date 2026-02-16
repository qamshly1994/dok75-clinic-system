/**
 * ============================================
 * Auto Seed Admin - نسخة محسنة مع التحقق من المسارات
 * ============================================
 */

const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');

// تحميل متغيرات البيئة
dotenv.config();

// التحقق من المسار الحالي
console.log('📂 المسار الحالي:', __dirname);
console.log('📂 المسار الكامل للمشروع:', path.resolve(__dirname, '..'));

// محاولة استيراد النماذج بطرق مختلفة
let User;
try {
    // الطريقة الأولى: المسار النسبي
    const modelsPath = path.resolve(__dirname, '../models');
    console.log('📂 مسار models:', modelsPath);
    
    // التحقق من وجود الملفات
    if (fs.existsSync(modelsPath)) {
        console.log('✅ مجلد models موجود');
        
        // محاولة الاستيراد
        const models = require('../models');
        User = models.User;
        console.log('✅ تم استيراد User من models');
    } else {
        throw new Error('مجلد models غير موجود');
    }
} catch (error) {
    console.log('⚠️ فشل الاستيراد من models:', error.message);
    
    // الطريقة الثانية: الاتصال المباشر
    console.log('🔄 استخدام الاتصال المباشر كبديل');
    
    const { Pool } = require('pg');
    const bcrypt = require('bcryptjs');
    
    // تعريف دالة seed مع الاتصال المباشر
    async function seedAdmin() {
        let client = null;
        try {
            log('🔍 بدء التحقق من وجود مستخدمين...');
            
            const connectionString = process.env.DATABASE_URL;
            const pool = new Pool({
                connectionString,
                ssl: { rejectUnauthorized: false }
            });
            
            client = await pool.connect();
            log('✅ تم الاتصال بقاعدة البيانات');
            
            // التحقق من وجود جدول users
            const checkTable = await client.query(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_name = 'users'
                );
            `);
            
            if (!checkTable.rows[0].exists) {
                log('⚠️ جدول users غير موجود. جاري إنشاؤه...');
                
                await client.query(`
                    CREATE TABLE IF NOT EXISTS users (
                        id SERIAL PRIMARY KEY,
                        username VARCHAR(50) UNIQUE NOT NULL,
                        password VARCHAR(255) NOT NULL,
                        full_name VARCHAR(100) NOT NULL,
                        role VARCHAR(50) DEFAULT 'doctor',
                        clinic_id INTEGER,
                        department_id INTEGER,
                        specialization_id INTEGER,
                        phone VARCHAR(20),
                        email VARCHAR(100),
                        is_active BOOLEAN DEFAULT true,
                        last_login TIMESTAMP,
                        created_at TIMESTAMP DEFAULT NOW(),
                        updated_at TIMESTAMP DEFAULT NOW()
                    );
                `);
                log('✅ تم إنشاء جدول users');
            }
            
            // التحقق من وجود مستخدمين
            const userCount = await client.query('SELECT COUNT(*) FROM users');
            
            if (parseInt(userCount.rows[0].count) > 0) {
                log(`✅ تم العثور على ${userCount.rows[0].count} مستخدم. لا حاجة لإنشاء مشرف جديد.`);
                return;
            }
            
            log('⚠️ لم يتم العثور على مستخدمين. جاري إنشاء المشرف العام...');
            
            // تشفير كلمة المرور
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@2026', salt);
            
            const username = process.env.ADMIN_USERNAME || 'admin';
            const fullName = process.env.ADMIN_FULL_NAME || 'المهندس عبدالرزاق';
            
            const result = await client.query(
                `INSERT INTO users (username, password, full_name, role, is_active, created_at, updated_at) 
                 VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, username, full_name`,
                [username, hashedPassword, fullName, 'super_admin', true]
            );
            
            const admin = result.rows[0];
            
            log(`✅ تم إنشاء المشرف العام بنجاح!`, 'SUCCESS');
            log(`📋 اسم المستخدم: ${admin.username}`, 'SUCCESS');
            log(`🔑 كلمة المرور: ${process.env.ADMIN_PASSWORD || 'Admin@2026'}`, 'SUCCESS');
            
            const credentialsFile = path.join(__dirname, '../admin-credentials.txt');
            const credentials = `
===========================================
✅ تم إنشاء المشرف العام تلقائياً
===========================================
📅 التاريخ: ${new Date().toLocaleString('ar-SA')}
📋 اسم المستخدم: ${admin.username}
🔑 كلمة المرور: ${process.env.ADMIN_PASSWORD || 'Admin@2026'}
👤 الاسم الكامل: ${admin.full_name}
🔗 رابط الدخول: ${process.env.APP_URL || 'https://dok75-clinic-system.onrender.com'}
===========================================
⚠️ احتفظ بهذه المعلومات في مكان آمن
===========================================
            `;
            
            fs.writeFileSync(credentialsFile, credentials);
            log(`✅ تم حفظ بيانات الدخول في: ${credentialsFile}`, 'SUCCESS');
            
        } catch (error) {
            log(`❌ خطأ في إنشاء المشرف العام: ${error.message}`, 'ERROR');
        } finally {
            if (client) client.release();
        }
    }
    
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
    
    return seedAdmin();
}

// إذا نجح الاستيراد، استخدم الدالة العادية
if (User) {
    module.exports = async function seedAdmin() {
        try {
            console.log('🔍 بدء التحقق من وجود مستخدمين...');
            
            const userCount = await User.count();
            
            if (userCount > 0) {
                console.log(`✅ تم العثور على ${userCount} مستخدم. لا حاجة لإنشاء مشرف جديد.`);
                return;
            }
            
            console.log('⚠️ لم يتم العثور على مستخدمين. جاري إنشاء المشرف العام...');
            
            const adminData = {
                username: process.env.ADMIN_USERNAME || 'admin',
                password: process.env.ADMIN_PASSWORD || 'Admin@2026',
                full_name: process.env.ADMIN_FULL_NAME || 'المهندس عبدالرزاق',
                role: 'super_admin',
                is_active: true
            };
            
            const admin = await User.create(adminData);
            
            console.log(`✅ تم إنشاء المشرف العام بنجاح!`);
            console.log(`📋 اسم المستخدم: ${admin.username}`);
            console.log(`🔑 كلمة المرور: ${adminData.password}`);
            
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
            console.log(`✅ تم حفظ بيانات الدخول في: ${credentialsFile}`);
            
        } catch (error) {
            console.error('❌ خطأ:', error);
        }
    };
}
