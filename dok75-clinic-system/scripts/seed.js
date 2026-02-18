/**
 * ============================================
 * Auto Seed Admin - الإصدار النهائي
 * يعمل بدون الحاجة لتسجيل دخول
 * ============================================
 */

const { sequelize, User, Clinic } = require('../models');
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

// الدالة الرئيسية
async function seedAdmin() {
    try {
        log('🔧 بدء الإصلاح الشامل للنظام...');
        
        // ============================================
        // 1. التأكد من الاتصال بقاعدة البيانات
        // ============================================
        await sequelize.authenticate();
        log('✅ متصل بقاعدة البيانات');
        
        // ============================================
        // 2. التأكد من وجود عيادة
        // ============================================
        let clinic = await Clinic.findOne();
        if (!clinic) {
            clinic = await Clinic.create({
                name: process.env.CLINIC_NAME || 'مركز DOK75 الطبي',
                address: 'المركز الرئيسي',
                phone: process.env.DEV_PHONE || '0995973668',
                is_active: true
            });
            log('✅ تم إنشاء عيادة افتراضية');
        } else {
            log('✅ العيادة موجودة');
        }
        
        // ============================================
        // 3. إصلاح جميع كلمات المرور القديمة
        // ============================================
        log('🔍 فحص كلمات المرور...');
        const allUsers = await User.findAll();
        
        for (const user of allUsers) {
            // التحقق مما إذا كانت كلمة المرور مشفرة
            const isHashed = user.password && user.password.startsWith('$2a$');
            
            if (!isHashed) {
                log(`⚠️ كلمة مرور غير مشفرة للمستخدم: ${user.username}`);
                
                // تشفير كلمة المرور
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(user.password || 'Temp123', salt);
                
                await user.update({ password: hashedPassword });
                log(`✅ تم إصلاح كلمة مرور المستخدم: ${user.username}`);
            }
        }
        
        // ============================================
        // 4. التأكد من وجود مستخدم admin صالح
        // ============================================
        let adminUser = await User.findOne({ where: { role: 'admin' } });
        
        if (!adminUser) {
            // البحث عن أي مستخدم لتحويله إلى admin
            adminUser = await User.findOne();
            
            if (adminUser) {
                // تحويل المستخدم إلى admin
                log(`🔄 تحويل المستخدم ${adminUser.username} إلى admin...`);
                
                const hashedPassword = await bcrypt.hash('Admin@2026', 10);
                await adminUser.update({ 
                    role: 'admin',
                    password: hashedPassword
                });
                
                log('✅ تم تحويل المستخدم إلى admin');
                saveCredentials(adminUser.username, 'Admin@2026', adminUser.full_name);
            } else {
                // إنشاء مستخدم admin جديد
                log('⚠️ لا يوجد أي مستخدم. جاري إنشاء مستخدم admin جديد...');
                
                const hashedPassword = await bcrypt.hash('Admin@2026', 10);
                adminUser = await User.create({
                    username: 'admin',
                    password: hashedPassword,
                    full_name: 'مدير النظام',
                    role: 'admin',
                    clinic_id: clinic.id,
                    is_active: true
                });
                
                log('✅ تم إنشاء مستخدم admin جديد');
                saveCredentials('admin', 'Admin@2026', 'مدير النظام');
            }
        } else {
            // تحديث كلمة مرور admin للتأكد
            log(`✅ مستخدم admin موجود: ${adminUser.username}`);
            
            const hashedPassword = await bcrypt.hash('Admin@2026', 10);
            await adminUser.update({ password: hashedPassword });
            log('✅ تم تحديث كلمة مرور admin');
            
            saveCredentials(adminUser.username, 'Admin@2026', adminUser.full_name);
        }
        
        // ============================================
        // 5. التأكد من وجود مستخدمين إضافيين للاختبار
        // ============================================
        const doctorCount = await User.count({ where: { role: 'doctor' } });
        if (doctorCount === 0) {
            log('⚠️ لا يوجد أطباء. جاري إنشاء طبيب تجريبي...');
            
            const hashedPassword = await bcrypt.hash('Doctor123', 10);
            await User.create({
                username: 'dr.test',
                password: hashedPassword,
                full_name: 'دكتور تجريبي',
                role: 'doctor',
                clinic_id: clinic.id,
                is_active: true
            });
            log('✅ تم إنشاء طبيب تجريبي (dr.test / Doctor123)');
        }
        
        const receptionCount = await User.count({ where: { role: 'receptionist' } });
        if (receptionCount === 0) {
            log('⚠️ لا يوجد موظفين استقبال. جاري إنشاء موظف تجريبي...');
            
            const hashedPassword = await bcrypt.hash('Recept123', 10);
            await User.create({
                username: 'recept.test',
                password: hashedPassword,
                full_name: 'موظف استقبال تجريبي',
                role: 'receptionist',
                clinic_id: clinic.id,
                is_active: true
            });
            log('✅ تم إنشاء موظف استقبال تجريبي (recept.test / Recept123)');
        }
        
        // ============================================
        // 6. عرض ملخص النتائج
        // ============================================
        const finalUsers = await User.findAll({
            attributes: ['id', 'username', 'role', 'is_active']
        });
        
        log('\n📊 ملخص المستخدمين النهائي:');
        finalUsers.forEach(u => {
            log(`   - ${u.username} (${u.role}) - ${u.is_active ? 'نشط' : 'غير نشط'}`);
        });
        
        log('\n✅ تم الإصلاح بنجاح!');
        log('📋 بيانات الدخول للمشرف: admin / Admin@2026');
        
        if (doctorCount === 0) log('📋 بيانات الدخول للطبيب التجريبي: dr.test / Doctor123');
        if (receptionCount === 0) log('📋 بيانات الدخول لموظف الاستقبال: recept.test / Recept123');
        
    } catch (error) {
        log(`❌ خطأ في الإصلاح: ${error.message}`, 'ERROR');
        console.error(error);
    }
}

// ✅ تصدير الدالة لاستخدامها في server.js
module.exports = seedAdmin;
