window.renderAccounting = async function(container) {
    container.innerHTML = `
        <style>
            .acc-dashboard { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin-bottom: 20px; }
            .acc-card { background: #fff; padding: 25px; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; flex-direction: column; gap: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); position: relative; overflow: hidden; }
            .acc-card::after { content: ''; position: absolute; top: 0; left: 0; width: 100%; height: 4px; }
            .card-vault::after { background: var(--primary); }
            .card-income::after { background: #10b981; }
            .card-expense::after { background: #ef4444; }
            .card-pending::after { background: #f59e0b; }
            
            .acc-card h3 { margin: 0; font-size: 14px; color: #64748b; font-weight: 800; display: flex; align-items: center; gap: 8px; }
            .acc-card p { margin: 0; font-size: 28px; font-weight: 900; color: #0f172a; }
            
            .acc-toolbar { display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap; }
            .btn-acc { flex: 1; min-width: 150px; color: white; border: none; padding: 14px; border-radius: 12px; font-weight: 800; font-size: 15px; cursor: pointer; display: flex; justify-content: center; align-items: center; gap: 8px; transition: 0.2s; }
            .btn-acc:active { transform: scale(0.98); }
            .btn-add-income { background: #10b981; box-shadow: 0 4px 10px rgba(16,185,129,0.3); }
            .btn-add-expense { background: #ef4444; box-shadow: 0 4px 10px rgba(239,68,68,0.3); }

            .ledger-container { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
            .ledger-header { background: #f8fafc; padding: 15px 20px; border-bottom: 1px solid #e2e8f0; font-weight: 900; color: #0f172a; font-size: 16px; display: flex; justify-content: space-between; align-items: center; }
            .ledger-list { max-height: 500px; overflow-y: auto; }
            .ledger-item { display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px dashed #e2e8f0; transition: 0.2s; }
            .ledger-item:hover { background: #f8fafc; }
            .ledger-item:last-child { border-bottom: none; }
            
            .tx-info { display: flex; align-items: center; gap: 15px; }
            .tx-icon { width: 40px; height: 40px; border-radius: 10px; display: flex; justify-content: center; align-items: center; font-size: 18px; }
            .icon-income { background: #d1fae5; color: #059669; }
            .icon-expense { background: #fee2e2; color: #dc2626; }
            
            .tx-details h4 { margin: 0 0 5px 0; color: #0f172a; font-size: 15px; font-weight: 800; }
            .tx-details p { margin: 0; color: #64748b; font-size: 12px; font-weight: 600; }
            
            .tx-amount { font-size: 18px; font-weight: 900; }
            .amount-income { color: #059669; }
            .amount-expense { color: #dc2626; }

            /* Modal Styles */
            .form-input { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px; margin-bottom: 15px; font-family: inherit; font-size: 14px; background: #f8fafc; outline: none; transition: 0.2s; }
            .form-input:focus { border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px rgba(242,92,5,0.1); }
            .form-label { display: block; font-weight: 800; font-size: 13px; color: #475569; margin-bottom: 6px; }
        </style>
        
        <div style="max-width: 1000px; margin: 0 auto; padding-bottom: 30px;">
            
            <div class="acc-dashboard" id="accStats">
                <div class="acc-card card-vault">
                    <h3><i class="fa-solid fa-vault"></i> رصيد الخزنة المركزي</h3>
                    <p id="statVault">0 ر.ي</p>
                </div>
                <div class="acc-card card-income">
                    <h3><i class="fa-solid fa-arrow-trend-up"></i> إجمالي الإيرادات</h3>
                    <p id="statIncome">0 ر.ي</p>
                </div>
                <div class="acc-card card-expense">
                    <h3><i class="fa-solid fa-arrow-trend-down"></i> إجمالي المصروفات</h3>
                    <p id="statExpense">0 ر.ي</p>
                </div>
                <div class="acc-card card-pending">
                    <h3><i class="fa-solid fa-motorcycle"></i> عهد معلقة (مع المناديب)</h3>
                    <p id="statPending">0 ر.ي</p>
                </div>
            </div>

            <div class="acc-toolbar">
                <button class="btn-acc btn-add-income" onclick="openTransactionModal('إيراد')"><i class="fa-solid fa-plus"></i> تسجيل إيراد مالي</button>
                <button class="btn-acc btn-add-expense" onclick="openTransactionModal('مصروف')"><i class="fa-solid fa-minus"></i> تسجيل مصروف / سحب</button>
            </div>

            <div class="ledger-container">
                <div class="ledger-header">
                    <span><i class="fa-solid fa-list-ul"></i> السجل المالي (آخر الحركات)</span>
                    <button onclick="loadAccountingData()" style="background:none; border:none; color:var(--primary); cursor:pointer; font-size:16px;"><i class="fa-solid fa-rotate-right"></i></button>
                </div>
                <div class="ledger-list" id="ledgerList">
                    <div style="text-align:center; padding:50px; color:#64748b;">
                        <i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--primary); margin-bottom:15px;"></i>
                        <p>جاري تحميل السجل المحاسبي...</p>
                    </div>
                </div>
            </div>
        </div>
    `;

    loadAccountingData();
};

async function loadAccountingData() {
    try {
        // جلب حركات الخزنة
        const { data: ledger, error: ledgerErr } = await window.supabaseClient
            .from('accounting_ledger')
            .select('*')
            .order('created_at', { ascending: false });
        if (ledgerErr) throw ledgerErr;

        // جلب إجمالي العهد المعلقة مع المناديب
        const { data: drivers, error: driversErr } = await window.supabaseClient.from('drivers').select('wallet_balance');
        let pendingVault = 0;
        if (!driversErr && drivers) {
            pendingVault = drivers.reduce((sum, d) => sum + (parseFloat(d.wallet_balance) || 0), 0);
        }

        renderAccountingDashboard(ledger || [], pendingVault);
    } catch(e) {
        document.getElementById('ledgerList').innerHTML = `<div style="background:#fee2e2; color:#dc2626; padding:20px; text-align:center; font-weight:bold;">خطأ في تحميل البيانات: ${e.message}</div>`;
    }
}

function renderAccountingDashboard(ledger, pendingVault) {
    let totalIncome = 0;
    let totalExpense = 0;

    let html = '';
    
    if(ledger.length === 0) {
        html = `<div style="text-align:center; color:#64748b; padding:50px;"><i class="fa-solid fa-receipt fa-3x" style="opacity:0.2; margin-bottom:15px;"></i><h3>لا توجد حركات مالية مسجلة بعد</h3></div>`;
    } else {
        ledger.forEach(tx => {
            const amount = parseFloat(tx.amount) || 0;
            const isIncome = tx.transaction_type === 'إيراد';
            
            if(isIncome) totalIncome += amount;
            else totalExpense += amount;

            const iconClass = isIncome ? 'icon-income' : 'icon-expense';
            const iconFa = isIncome ? 'fa-arrow-trend-up' : 'fa-arrow-trend-down';
            const amountClass = isIncome ? 'amount-income' : 'amount-expense';
            const sign = isIncome ? '+' : '-';
            
            // تنسيق التاريخ والوقت
            const dateObj = new Date(tx.created_at);
            const dateStr = dateObj.toLocaleDateString('ar-EG');
            const timeStr = dateObj.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

            html += `
                <div class="ledger-item">
                    <div class="tx-info">
                        <div class="tx-icon ${iconClass}"><i class="fa-solid ${iconFa}"></i></div>
                        <div class="tx-details">
                            <h4>${tx.description}</h4>
                            <p>${dateStr} - ${timeStr} ${tx.reference_id ? `| المرجع: ${tx.reference_id}` : ''}</p>
                        </div>
                    </div>
                    <div class="tx-amount ${amountClass}" dir="ltr">
                        ${sign} ${amount.toLocaleString()} ر.ي
                    </div>
                </div>
            `;
        });
    }

    const currentVault = totalIncome - totalExpense;

    document.getElementById('statIncome').innerText = totalIncome.toLocaleString() + ' ر.ي';
    document.getElementById('statExpense').innerText = totalExpense.toLocaleString() + ' ر.ي';
    document.getElementById('statVault').innerText = currentVault.toLocaleString() + ' ر.ي';
    document.getElementById('statPending').innerText = pendingVault.toLocaleString() + ' ر.ي';
    
    document.getElementById('ledgerList').innerHTML = html;
}

window.openTransactionModal = function(type) {
    const isIncome = type === 'إيراد';
    const modalId = 'txModal';
    const color = isIncome ? '#10b981' : '#ef4444';
    const icon = isIncome ? 'fa-plus' : 'fa-minus';

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; display:flex; justify-content:center; align-items:center; backdrop-filter: blur(4px);">
            <div style="background:#fff; width:90%; max-width:400px; border-radius:24px; padding:24px; position:relative; box-shadow:0 10px 40px rgba(0,0,0,0.2);">
                <button onclick="document.getElementById('${modalId}').remove()" style="position:absolute; left:20px; top:20px; background:none; border:none; font-size:20px; color:#64748B; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
                
                <h3 style="margin-top:0; border-bottom:1px solid #E2E8F0; padding-bottom:15px; margin-bottom:20px; color:#0f172a; font-weight:900;">
                    <i class="fa-solid ${icon}" style="color:${color}; background:${color}20; padding:8px; border-radius:8px; margin-left:8px;"></i> تسجيل ${type} جديد
                </h3>
                
                <label class="form-label">المبلغ (ر.ي)</label>
                <input type="number" id="txAmount" class="form-input" placeholder="0" style="font-size:18px; font-weight:bold; color:${color};" dir="ltr">
                
                <label class="form-label">البيان / الوصف</label>
                <input type="text" id="txDescription" class="form-input" placeholder="مثال: ${isIncome ? 'إيراد خارجي، رأس مال...' : 'سداد مطعم، راتب موظف، بنزين...'}">
                
                <label class="form-label">رقم المرجع (اختياري)</label>
                <input type="text" id="txReference" class="form-input" placeholder="رقم الفاتورة أو المندوب">

                <button onclick="saveTransaction('${type}')" style="width:100%; background:${color}; color:white; border:none; padding:14px; border-radius:12px; font-weight:900; font-size:16px; cursor:pointer; margin-top:10px; box-shadow:0 4px 15px ${color}40;">حفظ العملية</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

window.saveTransaction = async function(type) {
    const amount = parseFloat(document.getElementById('txAmount').value);
    const description = document.getElementById('txDescription').value.trim();
    const reference_id = document.getElementById('txReference').value.trim();

    if(!amount || amount <= 0) { alert("يرجى إدخال مبلغ صحيح أكبر من الصفر."); return; }
    if(!description) { alert("يرجى إدخال وصف للعملية."); return; }

    const payload = {
        transaction_type: type,
        amount: amount,
        description: description,
        reference_id: reference_id
    };

    try {
        const { error } = await window.supabaseClient.from('accounting_ledger').insert([payload]);
        if (error) throw error;
        
        document.getElementById('txModal').remove();
        loadAccountingData();
    } catch(e) {
        alert("فشل حفظ العملية: " + e.message);
    }
}
