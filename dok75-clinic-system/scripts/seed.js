/**
 * ============================================
 * Auto Seed Admin - نسخة نهائية مبسطة
 * ============================================
 */

const { User, Clinic } = require('../models');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function seedAdmin() {
    try {
        console.log('🔧 بدء الإصلاح...');
        
        // التأكد من وجود عيادة
        let clinic = await Clinic.findOne();
        if (!clinic) {
            clinic = await Clinic.create({
                name: 'مركز DOK75 الطبي',
                phone: '0995973668',
                is_active: true
            });
        }

        // البحث عن مستخدم admin
        let admin = await User.findOne({ where: { username: 'admin' } });
        
        if (!admin) {
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
        } else {
            // تحديث كلمة مرور admin
            const hashedPassword = await bcrypt.hash('Admin@2026', 10);
            await admin.update({ 
                password: hashedPassword,
                role: 'admin' // التأكد من أن الدور admin
            });
            console.log('✅ تم تحديث admin');
        }

        console.log('📋 بيانات الدخول: admin / Admin@2026');

    } catch (error) {
        console.error('❌ خطأ:', error);
    }
}

module.exports = seedAdmin;
