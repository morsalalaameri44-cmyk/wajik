window.renderAccounting = async function(container) {
    container.innerHTML = `
        <style>
            .acc-card { background: #fff; padding: 25px; border-radius: 16px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px rgba(0,0,0,0.02); margin-bottom: 20px; }
            .acc-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; }
            .acc-stat { text-align: center; padding: 20px; border-radius: 12px; }
            .stat-primary { background: rgba(242,92,5,0.05); border: 1px solid rgba(242,92,5,0.1); }
            .stat-success { background: #ecfdf5; border: 1px solid #d1fae5; }
            .stat-info { background: #eff6ff; border: 1px solid #dbeafe; }
            .acc-label { color: #64748b; font-size: 13px; font-weight: 800; margin-bottom: 8px; display: block; }
            .acc-value { font-size: 24px; font-weight: 900; color: #0f172a; }
            
            .export-btn { background: #10b981; color: white; border: none; padding: 14px 24px; border-radius: 12px; font-weight: 800; font-size: 16px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 10px; width: 100%; max-width: 300px; margin: 20px auto; box-shadow: 0 4px 15px rgba(16,185,129,0.3); }
            .export-btn:active { transform: scale(0.96); }
            .export-btn:hover { background: #059669; }
            
            .filter-group { display: flex; gap: 15px; margin-bottom: 20px; align-items: center; justify-content: center; flex-wrap: wrap; }
            .date-input { padding: 10px; border-radius: 10px; border: 1px solid #cbd5e1; outline: none; font-family: inherit; font-weight: bold; color: #475569; }
        </style>
        
        <div style="max-width: 900px; margin: 0 auto; padding-bottom: 30px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                <h2 style="font-size: 20px; font-weight: 900; color: #0f172a;"><i class="fa-solid fa-wallet" style="color:var(--primary);"></i> الخزنة والتقارير المالية</h2>
            </div>
            
            <div class="acc-card filter-group">
                <span style="font-weight: 800; color: #475569;">تصفية حسب التاريخ:</span>
                <input type="date" id="dateFrom" class="date-input" title="من تاريخ">
                <span style="color: #cbd5e1;">إلى</span>
                <input type="date" id="dateTo" class="date-input" title="إلى تاريخ">
                <button onclick="loadAccountingData()" style="background:#1e293b; color:white; border:none; padding:10px 20px; border-radius:10px; font-weight:bold; cursor:pointer;">تحديث الأرقام</button>
            </div>

            <div id="accountingContent">
                <div style="text-align:center; padding:50px; color:#64748b;">
                    <i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--primary); margin-bottom:15px;"></i>
                    <p>جاري تجميع البيانات المالية...</p>
                </div>
            </div>
        </div>
    `;

    // تعيين تواريخ افتراضية (من بداية الشهر الحالي إلى اليوم)
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    document.getElementById('dateFrom').value = firstDay.toISOString().split('T')[0];
    document.getElementById('dateTo').value = today.toISOString().split('T')[0];

    loadAccountingData();
};

let currentAccountingData = [];

async function loadAccountingData() {
    const fromDate = document.getElementById('dateFrom').value;
    // إضافة يوم واحد لتاريخ النهاية ليشمل اليوم كاملاً
    const toDateRaw = new Date(document.getElementById('dateTo').value);
    toDateRaw.setDate(toDateRaw.getDate() + 1);
    const toDate = toDateRaw.toISOString().split('T')[0];

    try {
        const { data: orders, error } = await window.supabaseClient
            .from('orders')
            .select('*')
            .eq('status', 'completed')
            .gte('created_at', fromDate)
            .lt('created_at', toDate);

        if (error) throw error;
        
        currentAccountingData = orders || [];
        renderAccountingDashboard();
    } catch (e) {
        document.getElementById('accountingContent').innerHTML = `<div style="background:#fee2e2; color:#dc2626; padding:20px; border-radius:12px; text-align:center; font-weight:bold;"><i class="fa-solid fa-triangle-exclamation"></i> خطأ في جلب البيانات: ${e.message}</div>`;
    }
}

function renderAccountingDashboard() {
    let totalSales = 0;
    let totalDeliveryFees = 0;
    let ordersCount = currentAccountingData.length;

    currentAccountingData.forEach(o => {
        let total = parseFloat(o.total_amount || o.total_price || o.price || 0);
        let delivery = parseFloat(o.delivery_fee || 0);
        
        totalSales += total;
        totalDeliveryFees += delivery;
    });

    // افتراض: مبيعات المطاعم هي الإجمالي ناقص رسوم التوصيل
    let restaurantDues = totalSales - totalDeliveryFees;

    const contentDiv = document.getElementById('accountingContent');
    contentDiv.innerHTML = `
        <div class="acc-card acc-grid">
            <div class="acc-stat stat-primary">
                <span class="acc-label"><i class="fa-solid fa-money-bill-wave"></i> إجمالي التدفقات (السيولة)</span>
                <span class="acc-value">${totalSales.toLocaleString()} <span style="font-size:14px;">ر.ي</span></span>
            </div>
            <div class="acc-stat stat-success">
                <span class="acc-label"><i class="fa-solid fa-motorcycle"></i> إيرادات التوصيل (للكباتن/الشركة)</span>
                <span class="acc-value" style="color:#059669;">${totalDeliveryFees.toLocaleString()} <span style="font-size:14px;">ر.ي</span></span>
            </div>
            <div class="acc-stat stat-info">
                <span class="acc-label"><i class="fa-solid fa-store"></i> مستحقات المطاعم</span>
                <span class="acc-value" style="color:#2563eb;">${restaurantDues.toLocaleString()} <span style="font-size:14px;">ر.ي</span></span>
            </div>
        </div>
        
        <div class="acc-card" style="text-align:center;">
            <p style="color:#64748b; font-weight:800; margin-bottom:15px;">تم حساب هذه الأرقام بناءً على <strong style="color:#0f172a;">${ordersCount}</strong> طلب مكتمل في الفترة المحددة.</p>
            <button class="export-btn" onclick="exportToCSV()">
                <i class="fa-solid fa-file-csv"></i> تصدير التقرير المحاسبي (Excel)
            </button>
            <p style="font-size:11px; color:#94a3b8; margin-top:10px;">يمكنك فتح الملف في برامج الإكسل أو Power Query لمزيد من التحليل.</p>
        </div>
    `;
}

// دالة تصدير البيانات إلى ملف CSV متوافق مع Excel
window.exportToCSV = function() {
    if (currentAccountingData.length === 0) {
        alert("لا توجد بيانات لتصديرها في هذه الفترة.");
        return;
    }

    // تجهيز ترويسة الجدول (الأعمدة)
    let csvContent = "\uFEFF"; // لدعم اللغة العربية (BOM)
    csvContent += "رقم الطلب,تاريخ الطلب,العميل,الهاتف,المطعم,الكابتن,إجمالي الطلب,رسوم التوصيل\n";

    currentAccountingData.forEach(o => {
        let dateObj = new Date(o.created_at);
        let formattedDate = `${dateObj.getFullYear()}-${(dateObj.getMonth()+1).toString().padStart(2,'0')}-${dateObj.getDate().toString().padStart(2,'0')}`;
        
        // تنظيف النصوص من الفواصل لتجنب تخريب تنسيق CSV
        let cName = (o.customer_name || 'غير محدد').replace(/,/g, ' ');
        let phone = (o.customer_phone || '').replace(/,/g, '');
        let store = (o.store_name || 'غير محدد').replace(/,/g, ' ');
        let driver = (o.driver_name || 'غير محدد').replace(/,/g, ' ');
        let total = parseFloat(o.total_amount || 0);
        let delivery = parseFloat(o.delivery_fee || 0);

        csvContent += `${o.id},${formattedDate},${cName},${phone},${store},${driver},${total},${delivery}\n`;
    });

    // إنشاء الملف وتحميله
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `تقرير_مبيعات_${document.getElementById('dateTo').value}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
