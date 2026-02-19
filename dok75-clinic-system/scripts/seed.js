// في ملف server.js، بعد الاتصال بقاعدة البيانات مباشرة
try {
    await sequelize.authenticate();
    console.log('✅ تم الاتصال بقاعدة البيانات');

    await sequelize.sync({ alter: true });
    console.log('✅ تم مزامنة النماذج');

    // ✅ كود إنشاء admin مباشرة هنا
    const bcrypt = require('bcryptjs');
    const { User, Clinic, Op } = require('./models');
    
    let clinic = await Clinic.findOne();
    if (!clinic) {
        clinic = await Clinic.create({
            name: process.env.CLINIC_NAME || 'مركز DOK75 الطبي',
            phone: process.env.DEV_PHONE || '0995973668',
            is_active: true
        });
    }
    
    let admin = await User.findOne({ 
        where: { [Op.or]: [{ username: 'admin' }, { role: 'admin' }, { role: 'super_admin' }] }
    });
    
    if (admin) {
        const hashedPassword = await bcrypt.hash('Admin@2026', 10);
        await admin.update({ 
            username: 'admin',
            password: hashedPassword,
            role: 'admin',
            is_active: true
        });
        console.log('✅ تم تحديث admin');
    } else {
        const hashedPassword = await bcrypt.hash('Admin@2026', 10);
        await User.create({
            username: 'admin',
            password: hashedPassword,
            full_name: 'مدير النظام',
            role: 'admin',
            clinic_id: clinic.id,
            is_active: true
        });
        console.log('✅ تم إنشاء admin جديد');
    }
    
} catch (error) {
    console.error('❌ خطأ:', error);
}
