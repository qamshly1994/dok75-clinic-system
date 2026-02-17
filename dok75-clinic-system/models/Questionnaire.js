/**
 * ============================================
 * نموذج الاستبيان (Questionnaire)
 * حسب تخصصات العيادة (تغذية - أسنان - ليزر - عام)
 * الموقع: /models/Questionnaire.js
 * ============================================
 */

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const Questionnaire = sequelize.define('questionnaires', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        patient_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'patients',
                key: 'id'
            }
        },
        doctor_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'users',
                key: 'id'
            }
        },
        department_id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'departments',
                key: 'id'
            }
        },
        appointment_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'appointments',
                key: 'id'
            }
        },
        // استبيان التغذية (Nutrition)
        nutrition: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {
                meals_regular: null,      // هل تتناول الوجبات بانتظام؟
                important_meal: null,     // أهم وجبة؟
                food_source: null,        // مصدر الغذاء؟
                fruits_veggies: null,     // خضار وفواكه؟
                nutrition_study: null,    // علاقة التغذية بالتحصيل؟
                breakfast_regular: null,  // إفطار منتظم؟
                breakfast_time: null,     // وقت الإفطار؟
                notes: ''                 // ملاحظات الطبيب
            }
        },
        // استبيان الأسنان (Dentistry)
        dentistry: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {
                brushing_frequency: null,   // عدد مرات تنظيف الأسنان؟
                last_visit: null,            // آخر زيارة لطبيب الأسنان؟
                gum_bleeding: null,          // نزيف اللثة؟
                tooth_sensitivity: null,     // حساسية الأسنان؟
                braces_history: null,        // تاريخ تقويم؟
                smoking: null,                // تدخين؟
                notes: ''
            }
        },
        // استبيان الليزر (Laser)
        laser: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {
                skin_type: null,              // نوع البشرة؟
                previous_laser: null,         // جلسات ليزر سابقة؟
                hair_removal_area: null,      // منطقة إزالة الشعر؟
                skin_sensitivity: null,       // حساسية الجلد؟
                medications: null,             // أدوية حالية؟
                pregnancy: null,               // حمل أو رضاعة؟
                notes: ''
            }
        },
        // استبيان الطب العام (General Medicine)
        general: {
            type: DataTypes.JSONB,
            allowNull: true,
            defaultValue: {
                chronic_diseases: null,       // أمراض مزمنة؟
                medications: null,             // أدوية مستمرة؟
                allergies: null,                // حساسية؟
                surgeries: null,                 // عمليات سابقة؟
                family_history: null,           // تاريخ عائلي؟
                smoking_alcohol: null,          // تدخين أو كحول؟
                notes: ''
            }
        },
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        },
        updated_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    });

    return Questionnaire;
};
