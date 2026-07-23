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
            
            .export-btn { background: #10b981; color: white; border: none; padding: 12px 20px; border-radius: 12px; font-weight: 800; font-size: 14px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: 0 4px 15px rgba(16,185,129,0.3); }
            .export-btn:hover { background: #059669; }
            
            .filter-group { display: flex; gap: 15px; margin-bottom: 20px; align-items: center; justify-content: center; flex-wrap: wrap; }
            .date-input { padding: 10px; border-radius: 10px; border: 1px solid #cbd5e1; outline: none; font-family: inherit; font-weight: bold; color: #475569; }
            
            .table-container { width: 100%; overflow-x: auto; margin-top: 15px; }
            .acc-table { width: 100%; border-collapse: collapse; text-align: right; }
            .acc-table th, .acc-table td { padding: 12px 15px; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
            .acc-table th { background: #f8fafc; color: #475569; font-weight: 800; }
            
            .settle-btn { background: #3b82f6; color: white; border: none; padding: 6px 12px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 12px; }
            .settle-btn:hover { background: #2563eb; }
        </style>
        
        <div style="max-width: 950px; margin: 0 auto; padding-bottom: 30px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px; flex-wrap:wrap; gap:15px;">
                <h2 style="font-size: 20px; font-weight: 900; color: #0f172a;"><i class="fa-solid fa-wallet" style="color:var(--primary);"></i> الخزنة ومحافظ المناديب</h2>
                <button class="export-btn" onclick="exportToCSV()">
                    <i class="fa-solid fa-file-csv"></i> تصدير تقرير الإكسل
                </button>
            </div>
            
            <div class="acc-card filter-group">
                <span style="font-weight: 800; color: #475569;">تصفية حسب التاريخ:</span>
                <input type="date" id="dateFrom" class="date-input">
                <span style="color: #cbd5e1;">إلى</span>
                <input type="date" id="dateTo" class="date-input">
                <button onclick="loadAccountingData()" style="background:#1e293b; color:white; border:none; padding:10px 20px; border-radius:10px; font-weight:bold; cursor:pointer;">تحديث</button>
            </div>

            <div id="accountingContent">
                <div style="text-align:center; padding:50px; color:#64748b;">
                    <i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--primary); margin-bottom:15px;"></i>
                    <p>جاري تحميل الحسابات...</p>
                </div>
            </div>
        </div>
    `;

    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    document.getElementById('dateFrom').value = firstDay.toISOString().split('T')[0];
    document.getElementById('dateTo').value = today.toISOString().split('T')[0];

    loadAccountingData();
};

let currentAccountingData = [];
let driversWalletsData = [];

async function loadAccountingData() {
    const fromDate = document.getElementById('dateFrom').value;
    const toDateRaw = new Date(document.getElementById('dateTo').value);
    toDateRaw.setDate(toDateRaw.getDate() + 1);
    const toDate = toDateRaw.toISOString().split('T')[0];

    try {
        const { data: orders, error: oErr } = await window.supabaseClient
            .from('orders')
            .select('*')
            .eq('status', 'completed')
            .gte('created_at', fromDate)
            .lt('created_at', toDate);

        if (oErr) throw oErr;
        currentAccountingData = orders || [];

        // جلب حركات عهد المناديب
        const { data: wallets, error: wErr } = await window.supabaseClient
            .from('driver_wallets')
            .select('*')
            .order('created_at', { ascending: false });

        if (wErr) throw wErr;
        driversWalletsData = wallets || [];

        renderAccountingDashboard();
    } catch (e) {
        document.getElementById('accountingContent').innerHTML = `<div style="background:#fee2e2; color:#dc2626; padding:20px; border-radius:12px; text-align:center; font-weight:bold;"><i class="fa-solid fa-triangle-exclamation"></i> خطأ: ${e.message}</div>`;
    }
}

function renderAccountingDashboard() {
    let totalSales = 0;
    let totalDeliveryFees = 0;
    let ordersCount = currentAccountingData.length;

    currentAccountingData.forEach(o => {
        totalSales += parseFloat(o.total_amount || 0);
        totalDeliveryFees += parseFloat(o.delivery_fee || 0);
    });

    let restaurantDues = totalSales - totalDeliveryFees;

    // تجميع ديون الكاش لكل كابتن
    const driverBalances = {};
    driversWalletsData.forEach(w => {
        if(!driverBalances[w.driver_name]) driverBalances[w.driver_name] = 0;
        if(w.type === 'cash_in') {
            driverBalances[w.driver_name] += parseFloat(w.amount);
        } else if(w.type === 'settled') {
            driverBalances[w.driver_name] -= parseFloat(w.amount);
        }
    });

    let walletsHtml = '';
    const activeDrivers = Object.keys(driverBalances);
    
    if(activeDrivers.length === 0) {
        walletsHtml = `<tr><td colspan="3" style="text-align:center; color:#94a3b8; padding:20px;">لا توجد عهد نقدية مسجلة حالياً على المناديب</td></tr>`;
    } else {
        activeDrivers.forEach(driver => {
            let balance = driverBalances[driver];
            if(balance < 0) balance = 0;
            walletsHtml += `
                <tr>
                    <td style="font-weight:800; color:#0f172a;">${driver}</td>
                    <td style="font-weight:900; color:${balance > 0 ? '#dc2626' : '#059669'};">${balance.toLocaleString()} ر.ي</td>
                    <td>
                        ${balance > 0 ? `<button class="settle-btn" onclick="settleDriverWallet('${driver}', ${balance})"><i class="fa-solid fa-check-double"></i> تصفية العهدة</button>` : '<span style="color:#10b981; font-weight:bold;">متصافٍ</span>'}
                    </td>
                </tr>
            `;
        });
    }

    const contentDiv = document.getElementById('accountingContent');
    contentDiv.innerHTML = `
        <div class="acc-card acc-grid">
            <div class="acc-stat stat-primary">
                <span class="acc-label"><i class="fa-solid fa-money-bill-wave"></i> إجمالي المبيعات</span>
                <span class="acc-value">${totalSales.toLocaleString()} <span style="font-size:14px;">ر.ي</span></span>
            </div>
            <div class="acc-stat stat-success">
                <span class="acc-label"><i class="fa-solid fa-motorcycle"></i> إيرادات التوصيل</span>
                <span class="acc-value" style="color:#059669;">${totalDeliveryFees.toLocaleString()} <span style="font-size:14px;">ر.ي</span></span>
            </div>
            <div class="acc-stat stat-info">
                <span class="acc-label"><i class="fa-solid fa-store"></i> مستحقات المطاعم</span>
                <span class="acc-value" style="color:#2563eb;">${restaurantDues.toLocaleString()} <span style="font-size:14px;">ر.ي</span></span>
            </div>
        </div>

        <div class="acc-card">
            <h3 style="font-size:16px; font-weight:900; color:#0f172a; margin-bottom:15px;"><i class="fa-solid fa-hand-holding-dollar" style="color:var(--primary);"></i> أرصدة وعهد المناديب (الكاش المتراكم)</h3>
            <div class="table-container">
                <table class="acc-table">
                    <thead>
                        <tr>
                            <th>اسم الكابتن</th>
                            <th>المبلغ بعهمته (كاش مطلوب تسليمه)</th>
                            <th>الإجراء</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${walletsHtml}
                    </tbody>
                </table>
            </div>
        </div>
        
        <div class="acc-card" style="text-align:center;">
            <p style="color:#64748b; font-weight:800; margin-bottom:10px;">إجمالي الطلبات المكتملة في الفترة: <strong style="color:#0f172a;">${ordersCount}</strong> طلب.</p>
        </div>
    `;
}

// دالة تسجيل تصفية العهدة للمندوب
window.settleDriverWallet = async function(driverName, amount) {
    if(!confirm(`هل أنت متأكد من تسليم الكابتن (${driverName}) لمبلغ ${amount} ر.ي وتصفية عهدته لخزنة الشركة؟`)) return;

    try {
        const { error } = await window.supabaseClient.from('driver_wallets').insert([{
            driver_name: driverName,
            amount: amount,
            type: 'settled',
            notes: 'تصفية نقدية للخزنة المركزية'
        }]);

        if (error) throw error;
        
        const toast = document.createElement('div');
        toast.innerHTML = `<div style="position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#10B981; color:white; padding:12px 24px; border-radius:50px; font-weight:bold; z-index:10000; box-shadow:0 4px 15px rgba(16,185,129,0.3);"><i class="fa-solid fa-check"></i> تم تصفية عهدة الكابتن بنجاح</div>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);

        loadAccountingData();
    } catch(err) {
        alert("فشل التصفية: " + err.message);
    }
}

window.exportToCSV = function() {
    if (currentAccountingData.length === 0) {
        alert("لا توجد بيانات لتصديرها.");
        return;
    }

    let csvContent = "\uFEFF";
    csvContent += "رقم الطلب,تاريخ الطلب,العميل,الهاتف,المطعم,الكابتن,إجمالي الطلب,رسوم التوصيل\n";

    currentAccountingData.forEach(o => {
        let dateObj = new Date(o.created_at);
        let formattedDate = `${dateObj.getFullYear()}-${(dateObj.getMonth()+1).toString().padStart(2,'0')}-${dateObj.getDate().toString().padStart(2,'0')}`;
        let cName = (o.customer_name || 'غير محدد').replace(/,/g, ' ');
        let phone = (o.customer_phone || '').replace(/,/g, '');
        let store = (o.store_name || 'غير محدد').replace(/,/g, ' ');
        let driver = (o.driver_name || 'غير محدد').replace(/,/g, ' ');
        let total = parseFloat(o.total_amount || 0);
        let delivery = parseFloat(o.delivery_fee || 0);

        csvContent += `${o.id},${formattedDate},${cName},${phone},${store},${driver},${total},${delivery}\n`;
    });

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
