window.renderSettings = async function(container) {
    container.innerHTML = `
        <style>
            .settings-layout { display: flex; gap: 20px; flex-wrap: wrap; padding-bottom: 30px; }
            .settings-sidebar { width: 250px; background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 15px; display: flex; flex-direction: column; gap: 10px; height: fit-content; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
            .settings-content { flex: 1; min-width: 300px; background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; padding: 25px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); min-height: 400px; }
            
            .tab-btn { padding: 12px 15px; border-radius: 10px; border: none; background: transparent; color: #64748b; font-weight: 800; font-size: 14px; text-align: right; cursor: pointer; transition: 0.2s; display: flex; align-items: center; gap: 10px; }
            .tab-btn:hover { background: #f8fafc; color: #0f172a; }
            .tab-btn.active { background: var(--primary); color: white; box-shadow: 0 4px 10px rgba(242,92,5,0.2); }
            
            .add-btn { background: #10b981; color: white; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 14px; box-shadow: 0 4px 10px rgba(16,185,129,0.3); }
            .add-btn:active { transform: scale(0.96); }

            .account-row { display: flex; justify-content: space-between; align-items: center; padding: 15px; border: 1px solid #e2e8f0; border-radius: 12px; margin-bottom: 10px; background: #f8fafc; transition: 0.2s; }
            .account-row:hover { border-color: #cbd5e1; background: #fff; }
            .role-badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 900; }
            .role-admin { background: #fee2e2; color: #dc2626; }
            .role-store { background: #fef3c7; color: #d97706; }
            .role-driver { background: #d1fae5; color: #059669; }

            .action-btn { border: none; padding: 8px 12px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 5px; transition: 0.2s; }
            .btn-delete { background: #fee2e2; color: #dc2626; }
            .btn-delete:hover { background: #fca5a5; }

            .form-input { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px; margin-bottom: 12px; font-family: inherit; font-size: 14px; background: #f8fafc; outline: none; }
            .form-input:focus { border-color: var(--primary); background: #fff; }
            .form-label { display: block; font-weight: 800; font-size: 13px; color: #475569; margin-bottom: 6px; }
            
            .perm-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 10px; background: #f8fafc; padding: 12px; border-radius: 10px; border: 1px dashed #cbd5e1; margin-bottom: 15px; }
            .perm-item { display: flex; align-items: center; gap: 8px; font-size: 13px; font-weight: bold; color: #334155; cursor: pointer; }
        </style>
        
        <div style="max-width: 1100px; margin: 0 auto;">
            <div class="settings-layout">
                <div class="settings-sidebar">
                    <button class="tab-btn active" id="tab-accounts" onclick="switchSettingsTab('accounts')"><i class="fa-solid fa-users-gear"></i> حسابات الدخول والصلاحيات</button>
                    <button class="tab-btn" id="tab-general" onclick="switchSettingsTab('general')"><i class="fa-solid fa-sliders"></i> الإعدادات العامة</button>
                </div>
                <div class="settings-content" id="settingsContent"></div>
            </div>
        </div>
    `;

    await loadSystemData();
    switchSettingsTab('accounts');
};

let allAccounts = [];
let availableStores = [];
let availableDrivers = [];

async function loadSystemData() {
    try {
        const [accRes, storesRes, driversRes] = await Promise.all([
            window.supabaseClient.from('system_accounts').select('*').order('created_at', { ascending: false }),
            window.supabaseClient.from('stores').select('*'),
            window.supabaseClient.from('drivers').select('*')
        ]);
        
        allAccounts = accRes.data || [];
        availableStores = storesRes.data || [];
        availableDrivers = driversRes.data || [];
    } catch (e) {
        console.error("خطأ في تحميل بيانات الإعدادات:", e);
    }
}

window.switchSettingsTab = function(tab) {
    document.querySelectorAll('.settings-sidebar .tab-btn').forEach(btn => btn.classList.remove('active'));
    document.getElementById('tab-' + tab).classList.add('active');

    const content = document.getElementById('settingsContent');
    if (tab === 'accounts') renderAccountsTab(content);
    else if (tab === 'general') renderGeneralTab(content);
};

function renderAccountsTab(content) {
    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #e2e8f0; padding-bottom:15px; margin-bottom:20px;">
            <div>
                <h2 style="margin:0 0 5px 0; color:#0f172a; font-size:18px;"><i class="fa-solid fa-users-gear" style="color:var(--primary);"></i> إدارة الصلاحيات وحسابات الدخول</h2>
                <p style="margin:0; font-size:12px; color:#64748b;">قم بإنشاء حسابات مخصصة وتحديد الصلاحيات الدقيقة لكل موظف أو متجر أو مندوب.</p>
            </div>
            <button class="add-btn" onclick="openAccountModal()"><i class="fa-solid fa-user-plus"></i> إنشاء حساب جديد</button>
        </div>
        <div id="accountsList">
    `;

    if (allAccounts.length === 0) {
        html += `<div style="text-align:center; padding:40px; color:#94a3b8;"><i class="fa-solid fa-users-slash fa-3x" style="margin-bottom:10px; opacity:0.5;"></i><p>لا توجد حسابات مسجلة بعد</p></div>`;
    } else {
        allAccounts.forEach(acc => {
            let roleText, roleClass, linkedEntity = '---';
            
            if (acc.role === 'admin') {
                roleText = 'موظف عمليات'; roleClass = 'role-admin';
                const perms = acc.permissions || [];
                linkedEntity = perms.length > 0 ? `الصلاحيات: (${perms.join('، ')})` : 'صلاحيات مخصصة';
            } else if (acc.role === 'store') {
                roleText = 'متجر / مطعم'; roleClass = 'role-store';
                const store = availableStores.find(s => s.id === acc.reference_id);
                linkedEntity = store ? (store.store_name || store.name || 'متجر') : 'متجر غير مرتبط';
            } else if (acc.role === 'driver') {
                roleText = 'كابتن / مندوب'; roleClass = 'role-driver';
                const driver = availableDrivers.find(d => d.id === acc.reference_id);
                linkedEntity = driver ? (driver.driver_name || driver.name || 'مندوب') : 'مندوب غير مرتبط';
            }

            html += `
                <div class="account-row">
                    <div style="display:flex; gap:15px; align-items:center;">
                        <div style="width:40px; height:40px; background:#e2e8f0; border-radius:50%; display:flex; justify-content:center; align-items:center; color:#475569;"><i class="fa-solid fa-user-lock"></i></div>
                        <div>
                            <div style="font-weight:900; color:#0f172a; font-size:15px; margin-bottom:3px;">${acc.username} <span class="role-badge ${roleClass}" style="margin-right:8px;">${roleText}</span></div>
                            <div style="font-size:12px; color:#64748b;"><i class="fa-solid fa-link"></i> ${linkedEntity}</div>
                        </div>
                    </div>
                    <button class="action-btn btn-delete" onclick="deleteAccount('${acc.id}', '${acc.username}')"><i class="fa-solid fa-trash"></i> حذف</button>
                </div>
            `;
        });
    }

    html += `</div>`;
    content.innerHTML = html;
}

function renderGeneralTab(content) {
    content.innerHTML = `
        <h2 style="margin:0 0 15px 0; color:#0f172a; border-bottom:1px solid #e2e8f0; padding-bottom:15px;"><i class="fa-solid fa-sliders" style="color:var(--primary);"></i> الإعدادات العامة للنظام</h2>
        <div style="max-width:400px;">
            <label class="form-label">رسوم التوصيل الافتراضية (ر.ي)</label>
            <input type="number" class="form-input" value="1000" id="defaultDeliveryFee">
            <label class="form-label">حالة المنصة</label>
            <select class="form-input" id="platformStatus" style="font-weight:bold;">
                <option value="open">🟢 المنصة مفتوحة وتستقبل طلبات</option>
                <option value="closed">🔴 المنصة مغلقة (صيانة / طوارئ)</option>
            </select>
            <button style="background:var(--primary); color:white; border:none; padding:12px 20px; border-radius:10px; font-weight:800; cursor:pointer; width:100%; box-shadow:0 4px 10px rgba(242,92,5,0.3);" onclick="alert('تم حفظ الإعدادات بنجاح')"><i class="fa-solid fa-floppy-disk"></i> حفظ التغييرات</button>
        </div>
    `;
}

window.openAccountModal = function() {
    const modalId = 'accountModal';
    const modal = document.createElement('div');
    modal.id = modalId;
    modal.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; display:flex; justify-content:center; align-items:center; backdrop-filter: blur(4px);">
            <div style="background:#fff; width:90%; max-width:450px; border-radius:24px; padding:24px; position:relative; box-shadow:0 10px 40px rgba(0,0,0,0.2); max-height:90vh; overflow-y:auto;">
                <button onclick="document.getElementById('${modalId}').remove()" style="position:absolute; left:20px; top:20px; background:none; border:none; font-size:20px; color:#64748B; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
                
                <h3 style="margin-top:0; border-bottom:1px solid #E2E8F0; padding-bottom:15px; margin-bottom:20px; color:#0f172a; font-weight:900;">
                    <i class="fa-solid fa-user-shield" style="color:#10b981;"></i> إصدار حساب دخول جديد
                </h3>
                
                <label class="form-label">نوع الصلاحية / الحساب</label>
                <select id="accRole" class="form-input" onchange="toggleReferenceField()" style="font-weight:bold;">
                    <option value="admin">موظف عمليات (صلاحيات مخصصة)</option>
                    <option value="store">إدارة متجر / مطعم</option>
                    <option value="driver">كابتن / مندوب توصيل</option>
                </select>

                <!-- حقل اختيار المتجر أو المندوب المرتبط -->
                <div id="referenceWrapper" style="display:none; background:#f8fafc; padding:12px; border-radius:10px; border:1px dashed #cbd5e1; margin-bottom:12px;">
                    <label class="form-label" id="referenceLabel">اختر الجهة المرتبطة:</label>
                    <select id="accReference" class="form-input" style="margin-bottom:0;"></select>
                </div>

                <!-- حقل الصلاحيات الحبيبية لموظف العمليات -->
                <div id="permissionsWrapper" style="margin-bottom:12px;">
                    <label class="form-label">تحديد الصلاحيات المتاحة للموظف:</label>
                    <div class="perm-grid">
                        <label class="perm-item"><input type="checkbox" class="perm-box" value="الطلبات الحية" checked> الطلبات الحية</label>
                        <label class="perm-item"><input type="checkbox" class="perm-box" value="العملاء" checked> العملاء والحظر</label>
                        <label class="perm-item"><input type="checkbox" class="perm-box" value="المتاجر" checked> إدارة المتاجر</label>
                        <label class="perm-item"><input type="checkbox" class="perm-box" value="المناديب" checked> المناديب والعهد</label>
                        <label class="perm-item"><input type="checkbox" class="perm-box" value="المحاسبة" checked> المحاسبة والخزنة</label>
                        <label class="perm-item"><input type="checkbox" class="perm-box" value="الإعدادات"> إعدادات النظام</label>
                    </div>
                </div>
                
                <label class="form-label">اسم المستخدم (إيميل أو رقم الهاتف)</label>
                <input type="text" id="accUsername" class="form-input" placeholder="name@company.com" dir="ltr" style="text-align:right;">
                
                <label class="form-label">كلمة المرور</label>
                <input type="text" id="accPassword" class="form-input" placeholder="كلمة المرور..." dir="ltr" style="text-align:right;">

                <button onclick="saveAccount()" style="width:100%; background:#10b981; color:white; border:none; padding:14px; border-radius:12px; font-weight:900; font-size:16px; cursor:pointer; margin-top:10px; box-shadow:0 4px 15px rgba(16,185,129,0.3);">إنشاء وحفظ الحساب</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    toggleReferenceField();
}

window.toggleReferenceField = function() {
    const role = document.getElementById('accRole').value;
    const wrapper = document.getElementById('referenceWrapper');
    const permWrapper = document.getElementById('permissionsWrapper');
    const select = document.getElementById('accReference');
    const label = document.getElementById('referenceLabel');

    if (role === 'admin') {
        wrapper.style.display = 'none';
        permWrapper.style.display = 'block';
        select.innerHTML = '';
    } else if (role === 'store') {
        wrapper.style.display = 'block';
        permWrapper.style.display = 'none';
        label.innerText = 'اختر المتجر المرتبط بهذا الحساب:';
        if (availableStores.length === 0) {
            select.innerHTML = `<option value="">لا توجد متاجر مسجلة في النظام!</option>`;
        } else {
            select.innerHTML = availableStores.map(s => `<option value="${s.id}">${s.store_name || s.name || 'متجر #' + s.id}</option>`).join('');
        }
    } else if (role === 'driver') {
        wrapper.style.display = 'block';
        permWrapper.style.display = 'none';
        label.innerText = 'اختر المندوب المرتبط بهذا الحساب:';
        if (availableDrivers.length === 0) {
            select.innerHTML = `<option value="">لا توجد مناديب مسجلين في النظام!</option>`;
        } else {
            select.innerHTML = availableDrivers.map(d => `<option value="${d.id}">${d.driver_name || d.name || 'مندوب #' + d.id}</option>`).join('');
        }
    }
}

window.saveAccount = async function() {
    const role = document.getElementById('accRole').value;
    const username = document.getElementById('accUsername'].value.trim();
    const password = document.getElementById('accPassword').value.trim();
    const reference_id = document.getElementById('accReference')?.value || null;

    let selectedPerms = [];
    if (role === 'admin') {
        document.querySelectorAll('.perm-box:checked').forEach(box => {
            selectedPerms.push(box.value);
        });
    }

    if (!username || !password) { alert('يرجى إدخال اسم المستخدم وكلمة المرور'); return; }

    const payload = {
        username: username,
        password: password,
        role: role,
        reference_id: role === 'admin' ? null : reference_id,
        permissions: selectedPerms
    };

    try {
        const { error } = await window.supabaseClient.from('system_accounts').insert([payload]);
        if (error) {
            if(error.code === '23505') throw new Error("اسم المستخدم هذا مسجل مسبقاً لحساب آخر!");
            throw error;
        }
        
        document.getElementById('accountModal').remove();
        await loadSystemData();
        renderAccountsTab(document.getElementById('settingsContent'));
        
    } catch (e) {
        alert("فشل إنشاء الحساب: " + e.message);
    }
}

window.deleteAccount = async function(id, username) {
    if(!confirm(`هل أنت متأكد من حذف حساب (${username}) نهائياً؟`)) return;

    try {
        const { error } = await window.supabaseClient.from('system_accounts').delete().eq('id', id);
        if(error) throw error;
        
        await loadSystemData();
        renderAccountsTab(document.getElementById('settingsContent'));
    } catch (e) {
        alert("فشل الحذف: " + e.message);
    }
}
