// admin/js/app.js

let currentActiveView = '';

// دالة التبديل للواجهة المطلوبة
function navigateTo(viewId, title) {
    currentActiveView = viewId;
    
    // تحديث العنوان
    document.getElementById('pageTitle').innerText = title;
    
    // تفعيل الزر في القائمة الجانبية
    document.querySelectorAll('.nav-link').forEach(link => link.classList.remove('active'));
    document.getElementById('nav-' + viewId).classList.add('active');
    
    // إغلاق القائمة في شاشات الجوال
    if(window.innerWidth <= 768) toggleSidebar();
    
    // مسح مساحة العمل ووضع علامة تحميل
    const workspace = document.getElementById('workspaceContent');
    workspace.innerHTML = '<div style="text-align:center; padding:50px; color:#64748B;"><i class="fa-solid fa-spinner fa-spin fa-2x"></i></div>';
    
    // استدعاء دالة الرسم الخاصة بالقسم المختار
    if (viewId === 'live_orders') {
        renderLiveOrders();
    } else {
        // شاشة مؤقتة للأقسام التي لم تبرمج بعد
        workspace.innerHTML = `
            <div style="text-align:center; padding:50px; color:#64748B;">
                <i class="fa-solid fa-code fa-3x" style="margin-bottom:15px; color:#CBD5E1;"></i>
                <h2>${title}</h2>
                <p>هذا القسم قيد التطوير...</p>
            </div>
        `;
    }
}

// دالة التحديث اليدوي من الشريط العلوي
function refreshCurrentView() {
    if (currentActiveView) {
        navigateTo(currentActiveView, document.getElementById('pageTitle').innerText);
    }
}

// دالة القائمة الجانبية للجوال
function toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('active');
    document.getElementById('overlay').classList.toggle('active');
}

// تشغيل قسم "الطلبات الحية" كصفحة افتراضية عند فتح النظام
window.onload = () => {
    navigateTo('live_orders', 'الطلبات الحية');
};
