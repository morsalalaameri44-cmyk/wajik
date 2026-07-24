window.renderStores = async function(container) {
    container.innerHTML = `
        <style>
            .store-card { background: #fff; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
            .store-header { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #e2e8f0; padding-bottom: 12px; margin-bottom: 15px; }
            .add-btn { background: var(--primary); color: white; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 14px; box-shadow: 0 4px 10px rgba(242,92,5,0.3); }
            .add-btn:active { transform: scale(0.96); }
            .item-row-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px dashed #f1f5f9; }
            .form-input { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px; margin-bottom: 12px; font-family: inherit; font-size: 14px; background: #f8fafc; outline: none; }
            .form-input:focus { border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px rgba(242,92,5,0.1); }
        </style>
        
        <div style="max-width: 900px; margin: 0 auto; padding-bottom: 30px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:25px;">
                <h2 style="font-size: 18px; font-weight: 900; color: #0f172a;"><i class="fa-solid fa-store" style="color:var(--primary);"></i> إدارة المطاعم والوجبات</h2>
                <button class="add-btn" onclick="openAddStoreModal()"><i class="fa-solid fa-plus"></i> إضافة مطعم جديد</button>
            </div>
            
            <div id="storesListContainer">
                <div style="text-align:center; padding:50px; color:#64748b;">
                    <i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--primary); margin-bottom:15px;"></i>
                    <p>جاري تحميل المطاعم وقوائم الطعام...</p>
                </div>
            </div>
        </div>
    `;

    loadStoresData();
};

async function loadStoresData() {
    try {
        const { data: stores, error: sErr } = await window.supabaseClient.from('stores').select('*').order('created_at', { ascending: false });
        if (sErr) throw sErr;

        const { data: items, error: iErr } = await window.supabaseClient.from('store_items').select('*');
        if (iErr) throw iErr;

        renderStoresList(stores || [], items || []);
    } catch(e) {
        document.getElementById('storesListContainer').innerHTML = `<div style="background:#fee2e2; color:#dc2626; padding:20px; border-radius:12px; text-align:center; font-weight:bold;">خطأ في تحميل البيانات: ${e.message}</div>`;
    }
}

function renderStoresList(stores, items) {
    const container = document.getElementById('storesListContainer');
    if(stores.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:#64748b; padding:50px; background:#fff; border-radius:16px; border:1px solid #e2e8f0;"><h3>لا توجد مطاعم مسجلة حالياً</h3></div>`;
        return;
    }

    let html = '';
    stores.forEach(store => {
        const storeItems = items.filter(i => i.store_id === store.id);
        
        let itemsHtml = '';
        if(storeItems.length === 0) {
            itemsHtml = `<p style="color:#94a3b8; font-size:13px; font-style:italic; text-align:center; padding:10px 0;">لا توجد أصناف مضافة في منيو هذا المطعم بعد</p>`;
        } else {
            storeItems.forEach(item => {
                itemsHtml += `
                    <div class="item-row-row">
                        <div>
                            <strong style="color:#0f172a; font-size:14px;">${item.name}</strong>
                            <span style="color:#64748b; font-size:12px; display:block;">${item.description || ''}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:15px;">
                            <span style="color:#059669; font-weight:900; font-size:15px;">${item.price} ر.ي</span>
                            <button onclick="deleteStoreItem('${item.id}')" style="background:#fee2e2; color:#dc2626; border:none; width:30px; height:30px; border-radius:8px; cursor:pointer;" title="حذف الصنف"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                `;
            });
        }

        html += `
            <div class="store-card">
                <div class="store-header">
                    <div>
                        <h3 style="margin:0 0 5px 0; color:#0f172a; font-weight:900; font-size:16px;">${store.name}</h3>
                        <span style="color:#64748b; font-size:13px;"><i class="fa-solid fa-utensils"></i> ${store.category || 'عام'} • <i class="fa-solid fa-phone"></i> ${store.phone || 'بدون رقم'}</span>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button onclick="openAddItemModal('${store.id}', '${store.name}')" style="background:#eff6ff; color:#2563eb; border:1px solid #93c5fd; padding:8px 14px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:13px;"><i class="fa-solid fa-plus"></i> إضافة صنف للمنيو</button>
                        <button onclick="deleteStore('${store.id}')" style="background:#fee2e2; color:#dc2626; border:none; padding:8px 12px; border-radius:8px; cursor:pointer;" title="حذف المطعم"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                <div style="background:#f8fafc; padding:10px 15px; border-radius:12px; border:1px solid #f1f5f9;">
                    <h4 style="margin:0 0 10px 0; font-size:13px; color:#475569; font-weight:800;">قائمة الطعام (المنيو):</h4>
                    ${itemsHtml}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// نافذة إضافة مطعم جديد
window.openAddStoreModal = function() {
    const modal = document.createElement('div');
    modal.id = 'storeModal';
    modal.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; display:flex; justify-content:center; align-items:center; backdrop-filter: blur(4px);">
            <div style="background:#fff; width:90%; max-width:450px; border-radius:20px; padding:24px; position:relative; box-shadow:0 10px 40px rgba(0,0,0,0.2);">
                <button onclick="document.getElementById('storeModal').remove()" style="position:absolute; left:20px; top:20px; background:none; border:none; font-size:20px; color:#64748B; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
                <h3 style="margin-top:0; border-bottom:1px solid #E2E8F0; padding-bottom:15px; margin-bottom:15px; color:#0f172a; font-weight:900;"><i class="fa-solid fa-store"></i> إضافة مطعم شريك جديد</h3>
                
                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">اسم المطعم</label>
                <input type="text" id="newStoreName" class="form-input" placeholder="مثال: مطعم الشيباني">
                
                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">التصنيف (مثال: برجر، مأكولات شعبية)</label>
                <input type="text" id="newStoreCategory" class="form-input" placeholder="التصنيف">
                
                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">رقم الهاتف</label>
                <input type="text" id="newStorePhone" class="form-input" placeholder="02XXXXXX">

                <button onclick="saveNewStore()" style="width:100%; background:var(--primary); color:white; border:none; padding:14px; border-radius:12px; font-weight:900; font-size:15px; cursor:pointer; box-shadow:0 4px 15px rgba(242,92,5,0.3);">حفظ المطعم</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

window.saveNewStore = async function() {
    const name = document.getElementById('newStoreName').value.trim();
    const category = document.getElementById('newStoreCategory').value.trim();
    const phone = document.getElementById('newStorePhone').value.trim();

    if(!name) { alert("يرجى إدخال اسم المطعم"); return; }

    try {
        const { error } = await window.supabaseClient.from('stores').insert([{ name, category, phone }]);
        if(error) throw error;
        document.getElementById('storeModal').remove();
        loadStoresData();
    } catch(e) {
        alert("فشل الحفظ: " + e.message);
    }
}

// نافذة إضافة صنف للمنيو
window.openAddItemModal = function(storeId, storeName) {
    const modal = document.createElement('div');
    modal.id = 'itemModal';
    modal.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; display:flex; justify-content:center; align-items:center; backdrop-filter: blur(4px);">
            <div style="background:#fff; width:90%; max-width:450px; border-radius:20px; padding:24px; position:relative; box-shadow:0 10px 40px rgba(0,0,0,0.2);">
                <button onclick="document.getElementById('itemModal').remove()" style="position:absolute; left:20px; top:20px; background:none; border:none; font-size:20px; color:#64748B; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
                <h3 style="margin-top:0; border-bottom:1px solid #E2E8F0; padding-bottom:15px; margin-bottom:15px; color:#0f172a; font-weight:900;"><i class="fa-solid fa-utensils"></i> إضافة صنف إلى (${storeName})</h3>
                
                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">اسم الصنف أو الوجبة</label>
                <input type="text" id="newItemName" class="form-input" placeholder="مثال: برجر دجاج دابل">
                
                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">السعر (ر.ي)</label>
                <input type="number" id="newItemPrice" class="form-input" placeholder="0">
                
                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">وصف الصنف (اختياري)</label>
                <input type="text" id="newItemDesc" class="form-input" placeholder="مكونات الوجبة...">

                <button onclick="saveNewItem('${storeId}')" style="width:100%; background:var(--primary); color:white; border:none; padding:14px; border-radius:12px; font-weight:900; font-size:15px; cursor:pointer; box-shadow:0 4px 15px rgba(242,92,5,0.3);">إضافة الصنف للمنيو</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

window.saveNewItem = async function(storeId) {
    const name = document.getElementById('newItemName').value.trim();
    const price = parseFloat(document.getElementById('newItemPrice').value) || 0;
    const description = document.getElementById('newItemDesc').value.trim();

    if(!name || price <= 0) { alert("يرجى إدخال اسم الصنف وسعر صحيح"); return; }

    try {
        const { error } = await window.supabaseClient.from('store_items').insert([{ store_id: storeId, name, price, description }]);
        if(error) throw error;
        document.getElementById('itemModal').remove();
        loadStoresData();
    } catch(e) {
        alert("فشل الحفظ: " + e.message);
    }
}

window.deleteStore = async function(storeId) {
    if(!confirm("هل أنت متأكد من حذف هذا المطعم مع جميع أصناف المنيو التابعة له؟")) return;
    try {
        await window.supabaseClient.from('stores').delete().eq('id', storeId);
        loadStoresData();
    } catch(e) { alert("فشل الحذف: " + e.message); }
}

window.deleteStoreItem = async function(itemId) {
    if(!confirm("هل أنت متأكد من حذف هذا الصنف من المنيو؟")) return;
    try {
        await window.supabaseClient.from('store_items').delete().eq('id', itemId);
        loadStoresData();
    } catch(e) { alert("فشل الحذف: " + e.message); }
}
