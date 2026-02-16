const { DataTypes } = require('sequelize');
const sequelize = require('./index');
const bcrypt = require('bcryptjs');

// ✅ نموذج المستخدم (المشرفين والأطباء)
const User = sequelize.define('users', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    username: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: { msg: 'اسم المستخدم مطلوب' }
        }
    },
    password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'كلمة المرور مطلوبة' }
        }
    },
    full_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
            notEmpty: { msg: 'الاسم الكامل مطلوب' }
        }
    },
    role: {
        type: DataTypes.ENUM('super_admin', 'doctor', 'receptionist'),
        defaultValue: 'doctor',
        allowNull: false
    },
    clinic_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // NULL للسوبر أدمن
        references: {
            model: 'clinics',
            key: 'id'
        }
    },
    department_id: {
        type: DataTypes.INTEGER,
        allowNull: true, // NULL للسوبر أدمن
        references: {
            model: 'departments',
            key: 'id'
        }
    },
    specialization_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'specializations',
            key: 'id'
        }
    },
    phone: {
        type: DataTypes.STRING(20),
        allowNull: true
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: true,
        validate: {
            isEmail: { msg: 'البريد الإلكتروني غير صحيح' }
        }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    last_login: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    hooks: {
        // تشفير كلمة المرور قبل الحفظ
        beforeCreate: async (user) => {
            if (user.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        },
        beforeUpdate: async (user) => {
            if (user.changed('password')) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(user.password, salt);
            }
        }
    }
});

// ✅ دالة مقارنة كلمة المرور
User.prototype.comparePassword = async function(candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

// ✅ دالة إرجاع البيانات بدون كلمة المرور
User.prototype.toJSON = function() {
    const values = Object.assign({}, this.get());
    delete values.password;
    return values;
};

module.exports = User;
