window.renderDrivers = async function(container) {
    container.innerHTML = `
        <style>
            .dashboard-cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 20px; }
            .stat-card { background: #fff; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; display: flex; align-items: center; gap: 15px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
            .stat-icon { width: 50px; height: 50px; border-radius: 12px; display: flex; justify-content: center; align-items: center; font-size: 20px; }
            .stat-info h4 { margin: 0; font-size: 12px; color: #64748b; font-weight: 800; }
            .stat-info p { margin: 5px 0 0 0; font-size: 20px; font-weight: 900; color: #0f172a; }
            
            .toolbar { display: flex; justify-content: space-between; gap: 15px; margin-bottom: 20px; flex-wrap: wrap; }
            .search-box { flex: 1; min-width: 250px; position: relative; }
            .search-box i { position: absolute; right: 15px; top: 50%; transform: translateY(-50%); color: #94a3b8; }
            .search-box input { width: 100%; padding: 12px 40px 12px 15px; border: 1px solid #cbd5e1; border-radius: 10px; background: #fff; font-family: inherit; font-size: 14px; outline: none; }
            .search-box input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(242,92,5,0.1); }
            
            .add-btn { background: var(--primary); color: white; border: none; padding: 12px 20px; border-radius: 10px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 14px; box-shadow: 0 4px 10px rgba(242,92,5,0.3); transition: 0.2s; white-space: nowrap; }
            .add-btn:active { transform: scale(0.96); }

            .drivers-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px; padding-bottom: 30px; }
            .driver-card { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); transition: 0.3s; position: relative; overflow: hidden; }
            .driver-card:hover { border-color: #cbd5e1; box-shadow: 0 8px 15px rgba(0,0,0,0.05); }
            
            .driver-header { display: flex; gap: 15px; align-items: center; margin-bottom: 15px; }
            .driver-avatar { width: 50px; height: 50px; background: #f1f5f9; border-radius: 50%; display: flex; justify-content: center; align-items: center; font-size: 24px; color: #94a3b8; flex-shrink: 0; }
            .driver-info { flex: 1; }
            .driver-info h3 { margin: 0 0 4px 0; font-size: 16px; font-weight: 900; color: #0f172a; }
            .driver-info p { margin: 0; font-size: 12px; color: #64748b; font-weight: 600; display: flex; align-items: center; gap: 5px; }
            
            .status-badge { position: absolute; top: 20px; left: 20px; padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 900; }
            .status-active { background: #d1fae5; color: #059669; }
            .status-busy { background: #fef3c7; color: #d97706; }
            .status-offline { background: #f1f5f9; color: #64748b; }
            .status-suspended { background: #fee2e2; color: #dc2626; }

            .wallet-box { background: #f8fafc; padding: 12px; border-radius: 10px; margin-bottom: 15px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #f1f5f9; }
            .wallet-box.debt { background: #fff1f2; border-color: #fecdd3; }
            .wallet-label { font-size: 12px; color: #64748b; font-weight: 800; }
            .wallet-amount { font-size: 16px; font-weight: 900; color: #0f172a; }
            .wallet-box.debt .wallet-amount { color: #e11d48; }

            .driver-actions { display: flex; gap: 8px; flex-wrap: wrap; }
            .action-btn { flex: 1; text-align: center; border: none; padding: 8px; border-radius: 8px; font-weight: 800; font-size: 12px; cursor: pointer; transition: 0.2s; }
            .btn-edit { background: #f1f5f9; color: #475569; }
            .btn-edit:hover { background: #e2e8f0; }
            .btn-settle { background: #ecfdf5; color: #059669; border: 1px solid #a7f3d0; }
            .btn-suspend { background: #fee2e2; color: #dc2626; }
            .btn-activate { background: #eff6ff; color: #2563eb; }
            
            /* Styles for Modal */
            .form-input { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px; margin-bottom: 12px; font-family: inherit; font-size: 14px; background: #f8fafc; outline: none; }
            .form-input:focus { border-color: var(--primary); background: #fff; }
        </style>
        
        <div style="max-width: 1200px; margin: 0 auto;">
            
            <!-- Dashboard Stats -->
            <div class="dashboard-cards" id="driversStats">
                <div class="stat-card">
                    <div class="stat-icon" style="background:#eff6ff; color:#3b82f6;"><i class="fa-solid fa-motorcycle"></i></div>
                    <div class="stat-info"><h4>إجمالي المناديب</h4><p id="statTotal">0</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background:#d1fae5; color:#10b981;"><i class="fa-solid fa-check-circle"></i></div>
                    <div class="stat-info"><h4>نشط الآن</h4><p id="statActive">0</p></div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon" style="background:#fee2e2; color:#ef4444;"><i class="fa-solid fa-ban"></i></div>
                    <div class="stat-info"><h4>موقوف / محظور</h4><p id="statSuspended">0</p></div>
                </div>
                <div class="stat-card" style="border: 1px solid #fecdd3;">
                    <div class="stat-icon" style="background:#fff1f2; color:#e11d48;"><i class="fa-solid fa-wallet"></i></div>
                    <div class="stat-info"><h4>إجمالي العهد لديهم</h4><p id="statTotalDebt">0 ر.ي</p></div>
                </div>
            </div>

            <!-- Toolbar -->
            <div class="toolbar">
                <div class="search-box">
                    <i class="fa-solid fa-magnifying-glass"></i>
                    <input type="text" id="searchDriverInput" placeholder="ابحث بالاسم أو رقم الهاتف..." onkeyup="filterDrivers()">
                </div>
                <select id="filterStatus" class="search-box" style="flex:none; width:150px; padding:12px; border:1px solid #cbd5e1; border-radius:10px; font-weight:bold; outline:none;" onchange="filterDrivers()">
                    <option value="الكل">جميع الحالات</option>
                    <option value="نشط">نشط</option>
                    <option value="مشغول">مشغول (في طلب)</option>
                    <option value="غير متصل">غير متصل</option>
                    <option value="موقوف">موقوف</option>
                </select>
                <button class="add-btn" onclick="openDriverModal()"><i class="fa-solid fa-plus"></i> تسجيل مندوب جديد</button>
            </div>

            <!-- Drivers Grid -->
            <div class="drivers-grid" id="driversListContainer">
                <div style="grid-column: 1 / -1; text-align:center; padding:50px; color:#64748b;">
                    <i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--primary); margin-bottom:15px;"></i>
                    <p>جاري تحميل بيانات المناديب...</p>
                </div>
            </div>
        </div>
    `;

    loadDriversData();
};

let allDriversData = [];

async function loadDriversData() {
    try {
        const { data: drivers, error } = await window.supabaseClient
            .from('drivers')
            .select('*')
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        allDriversData = drivers || [];
        
        updateDashboardStats();
        renderDriversList(allDriversData);
    } catch(e) {
        document.getElementById('driversListContainer').innerHTML = `<div style="background:#fee2e2; color:#dc2626; padding:20px; border-radius:12px; text-align:center; font-weight:bold;">خطأ في تحميل البيانات: ${e.message}</div>`;
    }
}

function updateDashboardStats() {
    const total = allDriversData.length;
    const active = allDriversData.filter(d => d.status === 'نشط' || d.status === 'مشغول').length;
    const suspended = allDriversData.filter(d => d.status === 'موقوف').length;
    const totalDebt = allDriversData.reduce((sum, d) => sum + (parseFloat(d.wallet_balance) || 0), 0);

    document.getElementById('statTotal').innerText = total;
    document.getElementById('statActive').innerText = active;
    document.getElementById('statSuspended').innerText = suspended;
    document.getElementById('statTotalDebt').innerText = totalDebt.toLocaleString() + ' ر.ي';
}

window.filterDrivers = function() {
    const searchTerm = document.getElementById('searchDriverInput').value.toLowerCase();
    const statusFilter = document.getElementById('filterStatus').value;

    const filtered = allDriversData.filter(driver => {
        const matchesSearch = (driver.name && driver.name.toLowerCase().includes(searchTerm)) || 
                              (driver.phone && driver.phone.includes(searchTerm));
        const matchesStatus = statusFilter === 'الكل' || driver.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    renderDriversList(filtered);
}

function renderDriversList(drivers) {
    const container = document.getElementById('driversListContainer');
    
    if(drivers.length === 0) {
        container.innerHTML = `<div style="grid-column: 1 / -1; text-align:center; color:#64748b; padding:50px; background:#fff; border-radius:16px; border:1px solid #e2e8f0;"><i class="fa-solid fa-motorcycle fa-3x" style="opacity:0.2; margin-bottom:15px;"></i><h3>لا يوجد مناديب مطابقين للبحث</h3></div>`;
        return;
    }

    let html = '';
    drivers.forEach(driver => {
        const name = driver.name || 'غير محدد';
        const phone = driver.phone || 'بدون رقم';
        const status = driver.status || 'غير متصل';
        const vehicle = driver.vehicle_type || 'دراجة نارية';
        const wallet = parseFloat(driver.wallet_balance) || 0;
        const rating = driver.rating || '5.0';

        let statusClass = 'status-offline';
        if(status === 'نشط') statusClass = 'status-active';
        if(status === 'مشغول') statusClass = 'status-busy';
        if(status === 'موقوف') statusClass = 'status-suspended';

        let vehicleIcon = vehicle.includes('سيارة') ? 'fa-car' : 'fa-motorcycle';
        const isDebt = wallet > 0;

        let toggleStatusBtn = '';
        if(status === 'موقوف') {
            toggleStatusBtn = `<button class="action-btn btn-activate" onclick="toggleDriverStatus('${driver.id}', 'نشط')"><i class="fa-solid fa-check"></i> تنشيط</button>`;
        } else {
            toggleStatusBtn = `<button class="action-btn btn-suspend" onclick="toggleDriverStatus('${driver.id}', 'موقوف')"><i class="fa-solid fa-ban"></i> إيقاف</button>`;
        }

        html += `
            <div class="driver-card">
                <span class="status-badge ${statusClass}">${status}</span>
                
                <div class="driver-header">
                    <div class="driver-avatar"><i class="fa-solid fa-user-helmet"></i></div>
                    <div class="driver-info">
                        <h3>${name}</h3>
                        <p><i class="fa-solid fa-phone"></i> ${phone} &nbsp;•&nbsp; <i class="fa-solid fa-star" style="color:#f59e0b;"></i> ${rating}</p>
                    </div>
                </div>

                <p style="font-size:12px; color:#64748b; font-weight:800; margin-bottom:10px;"><i class="fa-solid ${vehicleIcon}"></i> نوع المركبة: ${vehicle}</p>

                <div class="wallet-box ${isDebt ? 'debt' : ''}">
                    <span class="wallet-label">العهدة المالية (لدى المندوب)</span>
                    <span class="wallet-amount">${wallet.toLocaleString()} ر.ي</span>
                </div>

                <div class="driver-actions">
                    <button class="action-btn btn-settle" onclick="openSettleWalletModal('${driver.id}', '${name}', ${wallet})"><i class="fa-solid fa-hand-holding-dollar"></i> تصفية العهدة</button>
                    ${toggleStatusBtn}
                    <button class="action-btn btn-edit" onclick="openDriverModal('${driver.id}')"><i class="fa-solid fa-pen"></i></button>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

window.openDriverModal = function(driverId = null) {
    let driver = null;
    if (driverId) driver = allDriversData.find(d => d.id === driverId);

    const isEditing = !!driver;
    const modalId = 'driverModal';

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; display:flex; justify-content:center; align-items:center; backdrop-filter: blur(4px);">
            <div style="background:#fff; width:90%; max-width:400px; border-radius:20px; padding:24px; position:relative; box-shadow:0 10px 40px rgba(0,0,0,0.2);">
                <button onclick="document.getElementById('${modalId}').remove()" style="position:absolute; left:20px; top:20px; background:none; border:none; font-size:20px; color:#64748B; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
                <h3 style="margin-top:0; border-bottom:1px solid #E2E8F0; padding-bottom:15px; margin-bottom:15px; color:#0f172a; font-weight:900;"><i class="fa-solid fa-id-card"></i> ${isEditing ? 'تعديل بيانات المندوب' : 'تسجيل مندوب جديد'}</h3>
                
                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">اسم المندوب الرباعي</label>
                <input type="text" id="driverName" class="form-input" placeholder="اسم المندوب..." value="${driver ? driver.name : ''}">
                
                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">رقم الهاتف</label>
                <input type="text" id="driverPhone" class="form-input" placeholder="07XXXXXXXX" value="${driver ? driver.phone : ''}">
                
                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">نوع المركبة</label>
                <select id="driverVehicle" class="form-input" style="font-weight:bold;">
                    <option value="دراجة نارية" ${driver && driver.vehicle_type === 'دراجة نارية' ? 'selected' : ''}>دراجة نارية</option>
                    <option value="سيارة" ${driver && driver.vehicle_type === 'سيارة' ? 'selected' : ''}>سيارة</option>
                </select>

                <button onclick="saveDriver('${driverId || ''}')" style="width:100%; background:var(--primary); color:white; border:none; padding:14px; border-radius:12px; font-weight:900; font-size:15px; cursor:pointer; margin-top:10px;">${isEditing ? 'حفظ التعديلات' : 'تسجيل المندوب'}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

window.saveDriver = async function(driverId) {
    const name = document.getElementById('driverName').value.trim();
    const phone = document.getElementById('driverPhone').value.trim();
    const vehicle_type = document.getElementById('driverVehicle').value;

    if(!name || !phone) { alert("يرجى إدخال اسم المندوب ورقم هاتفه."); return; }

    const payload = { name: name, phone: phone, vehicle_type: vehicle_type };
    let responseError = null;

    if (driverId) {
        const { error } = await window.supabaseClient.from('drivers').update(payload).eq('id', driverId);
        responseError = error;
    } else {
        const { error } = await window.supabaseClient.from('drivers').insert([payload]);
        responseError = error;
    }

    if (responseError) {
        alert("فشل الحفظ في قاعدة البيانات!\nتأكد من مطابقة أسماء الأعمدة. السبب: " + responseError.message);
        return;
    }

    document.getElementById('driverModal').remove();
    loadDriversData();
}

window.openSettleWalletModal = function(driverId, driverName, currentWallet) {
    const modalId = 'walletModal';
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; display:flex; justify-content:center; align-items:center; backdrop-filter: blur(4px);">
            <div style="background:#fff; width:90%; max-width:400px; border-radius:20px; padding:24px; position:relative; box-shadow:0 10px 40px rgba(0,0,0,0.2);">
                <button onclick="document.getElementById('${modalId}').remove()" style="position:absolute; left:20px; top:20px; background:none; border:none; font-size:20px; color:#64748B; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
                <h3 style="margin-top:0; border-bottom:1px solid #E2E8F0; padding-bottom:15px; margin-bottom:15px; color:#0f172a; font-weight:900;"><i class="fa-solid fa-hand-holding-dollar" style="color:#10b981;"></i> تسوية عهدة المندوب</h3>
                
                <div style="background:#f8fafc; padding:15px; border-radius:12px; margin-bottom:20px; text-align:center;">
                    <p style="margin:0; font-size:13px; color:#64748b; font-weight:800;">إجمالي العهدة المطلوبة من (${driverName})</p>
                    <h2 style="margin:5px 0 0 0; color:#e11d48; font-weight:900;">${currentWallet.toLocaleString()} ر.ي</h2>
                </div>

                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">المبلغ المستلم (ر.ي)</label>
                <input type="number" id="settleAmount" class="form-input" placeholder="أدخل المبلغ الذي سلمه المندوب..." value="${currentWallet}">
                
                <button onclick="settleDriverWallet('${driverId}', ${currentWallet})" style="width:100%; background:#10b981; color:white; border:none; padding:14px; border-radius:12px; font-weight:900; font-size:15px; cursor:pointer;">تأكيد الاستلام وخصم العهدة</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

window.settleDriverWallet = async function(driverId, currentWallet) {
    const amountToSettle = parseFloat(document.getElementById('settleAmount').value) || 0;
    if(amountToSettle <= 0) { alert("يرجى إدخال مبلغ صحيح."); return; }
    
    const newWalletBalance = currentWallet - amountToSettle;

    const { error } = await window.supabaseClient.from('drivers').update({ wallet_balance: newWalletBalance }).eq('id', driverId);
    
    if(error) {
        alert("فشل التحديث: " + error.message);
        return;
    }

    alert(`تم تصفية مبلغ ${amountToSettle} ر.ي بنجاح.`);
    document.getElementById('walletModal').remove();
    loadDriversData();
}

window.toggleDriverStatus = async function(driverId, newStatus) {
    const actionText = newStatus === 'موقوف' ? 'إيقاف هذا المندوب ومنعه من استلام الطلبات' : 'إعادة تنشيط هذا المندوب';
    if(!confirm(`هل أنت متأكد من ${actionText}؟`)) return;

    const { error } = await window.supabaseClient.from('drivers').update({ status: newStatus }).eq('id', driverId);
    
    if(error) {
        alert("فشل التحديث: " + error.message);
        return;
    }
    
    loadDriversData();
}
