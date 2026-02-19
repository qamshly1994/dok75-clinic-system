/**
 * ============================================
 * Auto Seed Admin - نسخة نهائية مع تحويل super_admin
 * ============================================
 */

const { User, Clinic } = require('../models');
const bcrypt = require('bcryptjs');
const { Op } = require('sequelize'); // ✅ استيراد Op بشكل صحيح
const dotenv = require('dotenv');

dotenv.config();

async function seedAdmin() {
    try {
        console.log('🔧 بدء الإصلاح...');
        
        // 1. التأكد من وجود عيادة
        let clinic = await Clinic.findOne();
        if (!clinic) {
            clinic = await Clinic.create({
                name: process.env.CLINIC_NAME || 'مركز DOK75 الطبي',
                address: 'المركز الرئيسي',
                phone: process.env.DEV_PHONE || '0995973668',
                is_active: true
            });
            console.log('✅ تم إنشاء عيادة');
        }

        // 2. البحث عن أي مستخدم (admin, super_admin, أو أي مستخدم)
        let admin = await User.findOne({ 
            where: {
                [Op.or]: [  // ✅ استخدام Op بشكل صحيح
                    { username: 'admin' },
                    { role: 'admin' },
                    { role: 'super_admin' }
                ]
            }
        });
        
        if (admin) {
            // تحديث المستخدم الموجود
            console.log(`✅ تم العثور على مستخدم: ${admin.username} (الدور الحالي: ${admin.role})`);
            
            const hashedPassword = await bcrypt.hash('Admin@2026', 10);
            
            await admin.update({ 
                username: 'admin', // توحيد اسم المستخدم
                password: hashedPassword,
                full_name: process.env.ADMIN_FULL_NAME || 'مدير النظام',
                role: 'admin', // تحويل أي دور إلى admin
                is_active: true
            });
            
            console.log('✅ تم تحويل المستخدم إلى admin');
        } else {
            // إنشاء admin جديد
            console.log('⚠️ لا يوجد مستخدم مناسب، جاري إنشاء admin جديد...');
            
            const hashedPassword = await bcrypt.hash('Admin@2026', 10);
            
            admin = await User.create({
                username: 'admin',
                password: hashedPassword,
                full_name: process.env.ADMIN_FULL_NAME || 'مدير النظام',
                role: 'admin',
                clinic_id: clinic.id,
                is_active: true
            });
            
            console.log('✅ تم إنشاء admin جديد');
        }

        // 3. التأكد من وجود عيادة مرتبطة
        if (!admin.clinic_id && clinic) {
            await admin.update({ clinic_id: clinic.id });
            console.log('✅ تم ربط admin بالعيادة');
        }

        console.log('\n📋 بيانات الدخول:');
        console.log('   Username: admin');
        console.log('   Password: Admin@2026');
        console.log('   Role: admin');
        console.log('   Clinic ID:', admin.clinic_id || 'غير مرتبط');
        console.log('\n✅ تم الإصلاح بنجاح');

    } catch (error) {
        console.error('❌ خطأ في seed:', error);
    }
}

module.exports = seedAdmin;
