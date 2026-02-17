const { User, Clinic } = require('../models');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

dotenv.config();

async function seedAdmin() {
    try {
        // التحقق من وجود عيادة
        let clinic = await Clinic.findOne();
        if (!clinic) {
            clinic = await Clinic.create({
                id: 1,
                name: 'مركز DOK75 الطبي',
                address: 'المركز الرئيسي',
                phone: process.env.DEV_PHONE || '0995973668',
                is_active: true
            });
            console.log('✅ تم إنشاء العيادة الافتراضية');
        }

        // التحقق من وجود مشرف
        const adminExists = await User.findOne({ where: { role: 'super_admin' } });
        if (adminExists) {
            console.log('✅ المشرف العام موجود بالفعل');
            return;
        }

        // إنشاء المشرف العام
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'Admin@2026', salt);

        const admin = await User.create({
            username: process.env.ADMIN_USERNAME || 'admin',
            password: hashedPassword,
            full_name: process.env.ADMIN_FULL_NAME || 'المهندس عبدالرزاق',
            role: 'super_admin',
            clinic_id: clinic.id,
            is_active: true
        });

        console.log('✅ تم إنشاء المشرف العام بنجاح');
        console.log(`👤 اسم المستخدم: ${admin.username}`);
        console.log(`🔑 كلمة المرور: ${process.env.ADMIN_PASSWORD || 'Admin@2026'}`);

    } catch (error) {
        console.error('❌ خطأ في إنشاء المشرف:', error);
    }
}

module.exports = seedAdmin;
