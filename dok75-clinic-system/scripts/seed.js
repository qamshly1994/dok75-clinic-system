/**
 * ============================================
 * Auto Seed Admin - نسخة نهائية مع تحويل super_admin
 * ============================================
 */

const { User, Clinic } = require('../models');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function seedAdmin() {
    try {
        console.log('🔧 بدء الإصلاح...');
        
        // 1. التأكد من وجود عيادة
        let clinic = await Clinic.findOne();
        if (!clinic) {
            clinic = await Clinic.create({
                name: 'مركز DOK75 الطبي',
                phone: '0995973668',
                is_active: true
            });
            console.log('✅ تم إنشاء عيادة');
        }

        // 2. البحث عن مستخدم admin (أو super_admin)
        let admin = await User.findOne({ 
            where: { 
                [require('sequelize').Op.or]: [
                    { username: 'admin' },
                    { role: 'admin' },
                    { role: 'super_admin' }
                ]
            } 
        });
        
        if (admin) {
            // تحديث المستخدم الموجود
            const hashedPassword = await bcrypt.hash('Admin@2026', 10);
            await admin.update({ 
                username: 'admin', // توحيد اسم المستخدم
                password: hashedPassword,
                full_name: 'مدير النظام',
                role: 'admin', // تحويل أي دور إلى admin
                is_active: true
            });
            console.log('✅ تم تحديث المستخدم إلى admin');
        } else {
            // إنشاء admin جديد
            const hashedPassword = await bcrypt.hash('Admin@2026', 10);
            admin = await User.create({
                username: 'admin',
                password: hashedPassword,
                full_name: 'مدير النظام',
                role: 'admin',
                clinic_id: clinic.id,
                is_active: true
            });
            console.log('✅ تم إنشاء admin جديد');
        }

        console.log('\n📋 بيانات الدخول:');
        console.log('   Username: admin');
        console.log('   Password: Admin@2026');
        console.log('   Role: admin');
        console.log('\n✅ تم الإصلاح بنجاح');

    } catch (error) {
        console.error('❌ خطأ:', error);
    }
}

module.exports = seedAdmin;
