window.renderCustomers = async function(container) {
    container.innerHTML = `
        <style>
            .customer-card { background: #fff; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
            .stat-box { background: #f8fafc; padding: 12px 20px; border-radius: 12px; text-align: center; border: 1px solid #f1f5f9; }
            .ban-btn { background: #fee2e2; color: #dc2626; border: none; padding: 10px 18px; border-radius: 10px; cursor: pointer; font-weight: 800; transition: 0.2s; }
            .ban-btn:active { transform: scale(0.95); }
            .unban-btn { background: #d1fae5; color: #059669; border: none; padding: 10px 18px; border-radius: 10px; cursor: pointer; font-weight: 800; transition: 0.2s; }
            .unban-btn:active { transform: scale(0.95); }
            @media (max-width: 768px) {
                .customer-card { flex-direction: column; gap: 15px; align-items: stretch; text-align: center; }
                .stat-box-container { display: flex; justify-content: center; gap: 10px; }
            }
        </style>
        <div style="max-width: 900px; margin: 0 auto; padding-bottom: 30px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px; flex-wrap: wrap; gap: 15px;">
                <h2 style="font-size: 18px; font-weight: 900; color: #0f172a;"><i class="fa-solid fa-users" style="color:var(--primary);"></i> قاعدة بيانات العملاء والولاء</h2>
                <input type="text" id="custSearch" placeholder="🔍 ابحث برقم الهاتف أو الاسم..." style="padding:12px; border-radius:12px; border:1px solid #cbd5e1; width:250px; outline:none; font-family:inherit;">
            </div>
            
            <div id="customersList">
                <div style="text-align:center; padding:50px; color:#64748b;">
                    <i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--primary); margin-bottom:15px;"></i>
                    <p>جاري تحليل بيانات الطلبات وبناء سجل العملاء...</p>
                </div>
            </div>
        </div>
    `;

    loadCustomersData();

    document.getElementById('custSearch').addEventListener('input', (e) => {
        renderCustomersUI(e.target.value);
    });
};

let allCustomers = [];

async function loadCustomersData() {
    try {
        const { data: orders, error: oErr } = await window.supabaseClient.from('orders').select('customer_name, customer_phone, total_amount, created_at, status');
        if (oErr) throw oErr;

        const { data: bans, error: bErr } = await window.supabaseClient.from('blacklisted_phones').select('*');
        if (bErr) throw bErr;

        const bannedPhones = bans.map(b => b.phone);

        const custMap = {};
        orders.forEach(o => {
            let p = o.customer_phone || 'بدون رقم';
            let n = o.customer_name || 'غير معروف';
            let total = parseFloat(o.total_amount) || 0;
            
            // تنظيف رقم الهاتف لتوحيد السجلات
            let cleanPhone = p.replace(/\D/g, '');
            if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
            if (cleanPhone.length > 0 && !cleanPhone.startsWith('967')) cleanPhone = '967' + cleanPhone;
            if (cleanPhone === '') cleanPhone = p;

            if(!custMap[cleanPhone]) {
                custMap[cleanPhone] = { phone: cleanPhone, originalPhone: p, name: n, ordersCount: 0, totalSpent: 0, isBanned: bannedPhones.includes(cleanPhone) };
            }
            custMap[cleanPhone].ordersCount++;
            if (o.status === 'completed') custMap[cleanPhone].totalSpent += total;
        });

        allCustomers = Object.values(custMap).sort((a,b) => b.ordersCount - a.ordersCount);
        renderCustomersUI();
    } catch(e) {
        document.getElementById('customersList').innerHTML = `<div style="background:#fee2e2; color:#dc2626; padding:20px; border-radius:12px; text-align:center; font-weight:bold;"><i class="fa-solid fa-triangle-exclamation"></i> خطأ: ${e.message}</div>`;
    }
}

function renderCustomersUI(searchQuery = '') {
    const list = document.getElementById('customersList');
    let filtered = allCustomers;
    if(searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = allCustomers.filter(c => c.phone.includes(q) || c.originalPhone.includes(q) || c.name.toLowerCase().includes(q));
    }

    if(filtered.length === 0) {
        list.innerHTML = `<div style="text-align:center; color:#64748b; padding:50px; background:#fff; border-radius:16px; border:1px solid #e2e8f0;"><i class="fa-solid fa-box-open fa-3x" style="opacity:0.3; margin-bottom:15px;"></i><h3>لا يوجد عملاء مطابقين</h3></div>`;
        return;
    }

    let html = '';
    filtered.forEach(c => {
        if(c.phone === 'بدون رقم' || c.phone.length < 5) return; 
        
        html += `
            <div class="customer-card" style="${c.isBanned ? 'border-color: #fca5a5; background: #fef2f2;' : ''}">
                <div>
                    <h4 style="margin:0 0 8px 0; font-size:16px; color:#0f172a; font-weight:900;">
                        ${c.name} ${c.isBanned ? '<span style="color:#dc2626; font-size:12px; background:#fee2e2; padding:4px 8px; border-radius:6px; margin-right:8px;"><i class="fa-solid fa-ban"></i> محظور</span>' : ''}
                    </h4>
                    <p style="margin:0; color:#64748b; font-size:14px; font-weight:700;" dir="ltr"><i class="fa-solid fa-phone" style="color:var(--primary); margin-right:5px;"></i> ${c.phone}</p>
                </div>
                
                <div class="stat-box-container">
                    <div class="stat-box">
                        <span style="color:#64748b; font-size:12px; display:block; margin-bottom:5px;">إجمالي الطلبات</span>
                        <span style="color:#0f172a; font-size:16px; font-weight:900;">${c.ordersCount}</span>
                    </div>
                    <div class="stat-box">
                        <span style="color:#64748b; font-size:12px; display:block; margin-bottom:5px;">إجمالي الدفع</span>
                        <span style="color:#059669; font-size:16px; font-weight:900;">${c.totalSpent} ر.ي</span>
                    </div>
                </div>
                
                <div>
                    ${c.isBanned 
                        ? `<button class="unban-btn" onclick="toggleBan('${c.phone}', false)"><i class="fa-solid fa-unlock"></i> فك الحظر</button>`
                        : `<button class="ban-btn" onclick="toggleBan('${c.phone}', true)"><i class="fa-solid fa-ban"></i> حظر العميل</button>`
                    }
                </div>
            </div>
        `;
    });
    list.innerHTML = html;
}

window.toggleBan = async function(phone, toBan) {
    const btnText = toBan ? "حظر" : "فك الحظر عن";
    if(!confirm(`هل أنت متأكد من ${btnText} هذا الرقم (${phone})؟`)) return;
    
    try {
        if(toBan) {
            await window.supabaseClient.from('blacklisted_phones').insert([{ phone: phone, reason: 'حظر إداري بسبب طلبات وهمية' }]);
        } else {
            await window.supabaseClient.from('blacklisted_phones').delete().eq('phone', phone);
        }
        
        const toast = document.createElement('div');
        toast.innerHTML = `<div style="position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#10B981; color:white; padding:12px 24px; border-radius:50px; font-weight:bold; z-index:10000; box-shadow:0 4px 15px rgba(16,185,129,0.3);"><i class="fa-solid fa-check"></i> تم التحديث بنجاح</div>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);

        loadCustomersData(); 
    } catch(err) {
        alert("حدث خطأ أثناء التحديث: " + err.message);
    }
}
