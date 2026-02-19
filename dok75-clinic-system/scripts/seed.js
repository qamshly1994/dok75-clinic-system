// بعد await sequelize.sync({ alter: true });

// ============================================
// إنشاء مستخدم admin مباشرة (بدون seed.js)
// ============================================
try {
    console.log('🔍 جاري التحقق من مستخدم admin...');
    
    const bcrypt = require('bcryptjs');
    const { User, Clinic, Op } = require('./models');
    
    // التأكد من وجود عيادة
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
    
    // البحث عن مستخدم admin
    let admin = await User.findOne({ 
        where: {
            [Op.or]: [
                { username: 'admin' },
                { role: 'admin' },
                { role: 'super_admin' }
            ]
        }
    });
    
    if (admin) {
        console.log(`✅ تم العثور على مستخدم: ${admin.username}`);
        const hashedPassword = await bcrypt.hash('Admin@2026', 10);
        await admin.update({ 
            username: 'admin',
            password: hashedPassword,
            role: 'admin',
            is_active: true
        });
        console.log('✅ تم تحديث admin');
    } else {
        console.log('⚠️ لا يوجد admin، جاري الإنشاء...');
        const hashedPassword = await bcrypt.hash('Admin@2026', 10);
        await User.create({
            username: 'admin',
            password: hashedPassword,
            full_name: process.env.ADMIN_FULL_NAME || 'مدير النظام',
            role: 'admin',
            clinic_id: clinic.id,
            is_active: true
        });
        console.log('✅ تم إنشاء admin جديد');
    }
    
    console.log('📋 بيانات الدخول: admin / Admin@2026');
    
} catch (adminError) {
    console.error('⚠️ خطأ في إنشاء admin (سيستمر الخادم):', adminError.message);
}
