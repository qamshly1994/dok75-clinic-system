/**
 * ============================================
 * DOK75 - ملف JavaScript الرئيسي
 * ============================================
 */

// دالة عرض التنبيهات
function showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type}`;
    alertDiv.textContent = message;
    alertDiv.style.position = 'fixed';
    alertDiv.style.top = '20px';
    alertDiv.style.left = '50%';
    alertDiv.style.transform = 'translateX(-50%)';
    alertDiv.style.zIndex = '9999';
    alertDiv.style.minWidth = '300px';
    alertDiv.style.textAlign = 'center';
    
    document.body.appendChild(alertDiv);
    
    setTimeout(() => {
        alertDiv.remove();
    }, 3000);
}

// دالة تنسيق التاريخ
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// دالة تنسيق العملة
function formatCurrency(amount) {
    return new Intl.NumberFormat('ar-SA', {
        style: 'currency',
        currency: 'SAR'
    }).format(amount);
}

// دالة تحميل الصفحة مع مؤشر التحميل
async function fetchWithLoading(url, options = {}) {
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'loading';
    loadingDiv.innerHTML = '<div class="spinner"></div>';
    document.body.appendChild(loadingDiv);
    
    try {
        const response = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                ...options.headers
            }
        });
        
        const data = await response.json();
        return data;
    } finally {
        loadingDiv.remove();
    }
}

// دالة التحقق من تسجيل الدخول
function checkAuth() {
    const token = localStorage.getItem('token');
    if (!token) {
        window.location.href = '/login.html';
        return false;
    }
    return true;
}

// دالة تسجيل الخروج
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login.html';
}

// دالة الحصول على المستخدم الحالي
function getCurrentUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
}
