window.renderStores = async function(container) {
    container.innerHTML = `
        <style>
            .store-card { background: #fff; padding: 20px; border-radius: 16px; border: 1px solid #e2e8f0; margin-bottom: 20px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
            .store-header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #e2e8f0; padding-bottom: 15px; margin-bottom: 15px; flex-wrap: wrap; gap: 15px; }
            .add-btn { background: var(--primary); color: white; border: none; padding: 10px 18px; border-radius: 10px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 14px; box-shadow: 0 4px 10px rgba(242,92,5,0.3); }
            .add-btn:active { transform: scale(0.96); }
            .action-btn { border: none; padding: 8px 12px; border-radius: 8px; font-weight: bold; cursor: pointer; font-size: 13px; display: flex; align-items: center; gap: 5px; }
            .btn-edit { background: #f3f4f6; color: #4b5563; }
            .btn-edit:hover { background: #e5e7eb; }
            .btn-delete { background: #fee2e2; color: #dc2626; }
            .btn-delete:hover { background: #fca5a5; }
            .item-row-row { display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px dashed #f1f5f9; }
            .form-input { width: 100%; padding: 12px; border: 1px solid #cbd5e1; border-radius: 10px; margin-bottom: 12px; font-family: inherit; font-size: 14px; background: #f8fafc; outline: none; }
            .form-input:focus { border-color: var(--primary); background: #fff; box-shadow: 0 0 0 3px rgba(242,92,5,0.1); }
            .category-badge { background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; margin-left: 10px; }
            .status-badge { padding: 4px 10px; border-radius: 6px; font-size: 11px; font-weight: 900; }
            .status-open { background: #d1fae5; color: #059669; }
            .status-closed { background: #fee2e2; color: #dc2626; }
            
            .main-tabs { display: flex; gap: 10px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 10px; }
            .main-tabs::-webkit-scrollbar { height: 6px; }
            .main-tabs::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            .tab-btn { background: #f8fafc; border: 1px solid #e2e8f0; color: #64748b; padding: 10px 20px; border-radius: 20px; font-weight: 800; font-size: 14px; cursor: pointer; white-space: nowrap; transition: 0.3s; }
            .tab-btn.active { background: var(--primary); color: white; border-color: var(--primary); box-shadow: 0 4px 10px rgba(242,92,5,0.2); }
        </style>
        
        <div style="max-width: 950px; margin: 0 auto; padding-bottom: 30px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2 style="font-size: 18px; font-weight: 900; color: #0f172a;"><i class="fa-solid fa-shop" style="color:var(--primary);"></i> إدارة المتاجر والأقسام</h2>
                <button class="add-btn" onclick="openStoreModal()"><i class="fa-solid fa-plus"></i> إضافة متجر</button>
            </div>
            
            <div class="main-tabs" id="mainCategoriesTabs">
                <button class="tab-btn active" onclick="filterStores('الكل', this)">الكل</button>
            </div>

            <div id="storesListContainer">
                <div style="text-align:center; padding:50px; color:#64748b;">
                    <i class="fa-solid fa-spinner fa-spin fa-2x" style="color:var(--primary); margin-bottom:15px;"></i>
                    <p>جاري تحميل المتاجر والأصناف...</p>
                </div>
            </div>
        </div>
    `;

    loadStoresData();
};

let allStoresData = [];
let allProductsData = [];
let allMainCategories = [];

async function loadStoresData() {
    try {
        const { data: categories } = await window.supabaseClient.from('categories').select('*').order('sort_order', { ascending: true });
        if(categories) {
            allMainCategories = categories.map(c => c.name.trim());
            renderMainTabs();
        }

        const { data: stores, error: sErr } = await window.supabaseClient.from('stores').select('*').order('created_at', { ascending: false });
        if (sErr) throw sErr;
        allStoresData = stores || [];

        const { data: products, error: pErr } = await window.supabaseClient.from('products').select('*');
        if (pErr) throw pErr;
        allProductsData = products || [];

        const currentActiveTab = document.querySelector('.tab-btn.active');
        const filterVal = currentActiveTab ? currentActiveTab.innerText : 'الكل';
        renderStoresList(filterVal);
    } catch(e) {
        document.getElementById('storesListContainer').innerHTML = `<div style="background:#fee2e2; color:#dc2626; padding:20px; border-radius:12px; text-align:center; font-weight:bold;">خطأ في تحميل البيانات: ${e.message}</div>`;
    }
}

function renderMainTabs() {
    const tabsContainer = document.getElementById('mainCategoriesTabs');
    const currentActive = document.querySelector('.tab-btn.active')?.innerText || 'الكل';
    
    let html = `<button class="tab-btn ${currentActive === 'الكل' ? 'active' : ''}" onclick="filterStores('الكل', this)">الكل</button>`;
    allMainCategories.forEach(cat => {
        html += `<button class="tab-btn ${currentActive === cat ? 'active' : ''}" onclick="filterStores('${cat}', this)">${cat}</button>`;
    });
    tabsContainer.innerHTML = html;
}

window.filterStores = function(categoryName, btnElement) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');
    renderStoresList(categoryName);
}

function renderStoresList(filterCategory) {
    const container = document.getElementById('storesListContainer');
    
    let filteredStores = allStoresData;
    if (filterCategory !== 'الكل') {
        filteredStores = allStoresData.filter(s => {
            const cat = s.category || s.store_category || '';
            return cat.includes(filterCategory);
        });
    }

    if(filteredStores.length === 0) {
        container.innerHTML = `<div style="text-align:center; color:#64748b; padding:50px; background:#fff; border-radius:16px; border:1px solid #e2e8f0;"><i class="fa-solid fa-store-slash fa-3x" style="opacity:0.3; margin-bottom:15px;"></i><h3>لا توجد متاجر في هذا القسم</h3></div>`;
        return;
    }

    let html = '';
    filteredStores.forEach(store => {
        const storeName = store.name || store.store_name || 'متجر غير محدد';
        const storeCategory = store.category || store.store_category || 'عام';
        const storePhone = store.phone || store.store_phone || 'بدون رقم';
        const storeStatus = store.status || 'مفتوح';
        const storeLogo = store.logo_url ? `<img src="${store.logo_url}" style="width:40px; height:40px; border-radius:8px; object-fit:cover; border:1px solid #e2e8f0;">` : `<div style="width:40px; height:40px; border-radius:8px; background:#f1f5f9; display:flex; justify-content:center; align-items:center; color:#94a3b8;"><i class="fa-solid fa-image"></i></div>`;
        
        const isStoreOpen = storeStatus === 'مفتوح';

        const storeProducts = allProductsData.filter(p => p.store_id === store.id);
        
        let productsHtml = '';
        if(storeProducts.length === 0) {
            productsHtml = `<p style="color:#94a3b8; font-size:13px; font-style:italic; text-align:center; padding:10px 0;">لا توجد أصناف مضافة في هذا المتجر بعد</p>`;
        } else {
            storeProducts.forEach(product => {
                const prodName = product.name || product.item_name || 'صنف غير محدد';
                const prodSection = product.category || product.category_name || 'عام';
                const prodAvail = product.is_available !== false; // افتراضياً متوفر
                const prodImg = product.image_url ? `<img src="${product.image_url}" style="width:40px; height:40px; border-radius:8px; object-fit:cover;">` : '';

                productsHtml += `
                    <div class="item-row-row" style="${prodAvail ? '' : 'opacity:0.5; background:#f8fafc;'}">
                        <div style="display:flex; gap:10px; align-items:center;">
                            ${prodImg}
                            <div>
                                <strong style="color:#0f172a; font-size:14px;">${prodName} ${prodAvail ? '' : '<span style="color:red;font-size:10px;">(غير متوفر)</span>'}</strong>
                                <span class="category-badge">${prodSection}</span>
                                <span style="color:#64748b; font-size:12px; display:block; margin-top:4px;">${product.description || ''}</span>
                            </div>
                        </div>
                        <div style="display:flex; align-items:center; gap:10px;">
                            <span style="color:#059669; font-weight:900; font-size:15px; min-width:70px;">${product.price} ر.ي</span>
                            <button class="action-btn btn-edit" onclick="openProductModal('${store.id}', '${product.id}')" title="تعديل"><i class="fa-solid fa-pen"></i></button>
                            <button class="action-btn btn-delete" onclick="deleteProduct('${product.id}')" title="حذف"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                `;
            });
        }

        html += `
            <div class="store-card">
                <div class="store-header">
                    <div style="display:flex; gap:15px; align-items:center;">
                        ${storeLogo}
                        <div>
                            <h3 style="margin:0 0 5px 0; color:#0f172a; font-weight:900; font-size:16px;">${storeName} <span class="status-badge ${isStoreOpen ? 'status-open' : 'status-closed'}">${storeStatus}</span></h3>
                            <span style="color:#64748b; font-size:13px;"><i class="fa-solid fa-tag"></i> ${storeCategory} • <i class="fa-solid fa-phone"></i> ${storePhone}</span>
                        </div>
                    </div>
                    <div style="display:flex; gap:8px; flex-wrap:wrap;">
                        <button onclick="openProductModal('${store.id}')" class="add-btn"><i class="fa-solid fa-plus"></i> إضافة صنف</button>
                        <button onclick="openStoreModal('${store.id}')" class="action-btn btn-edit"><i class="fa-solid fa-pen"></i> تعديل المتجر</button>
                        <button onclick="deleteStore('${store.id}')" class="action-btn btn-delete"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                <div style="background:#fff; padding:10px 15px; border-radius:12px; border:1px solid #f1f5f9;">
                    <h4 style="margin:0 0 10px 0; font-size:13px; color:#475569; font-weight:800;">المنيو / الأصناف:</h4>
                    ${productsHtml}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// نافذة المتجر (لإضافة أو تعديل)
window.openStoreModal = function(storeId = null) {
    let store = null;
    if (storeId) {
        store = allStoresData.find(s => s.id === storeId);
    }

    let categoryOptions = '';
    allMainCategories.forEach(cat => {
        const selected = (store && store.category === cat) ? 'selected' : '';
        categoryOptions += `<option value="${cat}" ${selected}>${cat}</option>`;
    });

    const isEditing = !!store;
    const modalId = 'storeModal';
    const statusSelect = isEditing ? `
        <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">حالة المتجر</label>
        <select id="storeStatus" class="form-input" style="font-weight:bold;">
            <option value="مفتوح" ${store.status === 'مفتوح' ? 'selected' : ''}>مفتوح (يستقبل طلبات)</option>
            <option value="مغلق" ${store.status === 'مغلق' ? 'selected' : ''}>مغلق مؤقتاً</option>
        </select>
    ` : '';

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; display:flex; justify-content:center; align-items:center; backdrop-filter: blur(4px);">
            <div style="background:#fff; width:90%; max-width:450px; border-radius:20px; padding:24px; position:relative; box-shadow:0 10px 40px rgba(0,0,0,0.2); max-height:90vh; overflow-y:auto;">
                <button onclick="document.getElementById('${modalId}').remove()" style="position:absolute; left:20px; top:20px; background:none; border:none; font-size:20px; color:#64748B; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
                <h3 style="margin-top:0; border-bottom:1px solid #E2E8F0; padding-bottom:15px; margin-bottom:15px; color:#0f172a; font-weight:900;"><i class="fa-solid fa-shop"></i> ${isEditing ? 'تعديل بيانات المتجر' : 'إضافة متجر جديد'}</h3>
                
                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">اسم المتجر</label>
                <input type="text" id="storeName" class="form-input" placeholder="اسم المتجر..." value="${store ? (store.name || store.store_name) : ''}">
                
                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">القسم الرئيسي</label>
                <select id="storeCategory" class="form-input" style="font-weight:bold;">
                    ${categoryOptions}
                </select>
                
                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">رقم الهاتف</label>
                <input type="text" id="storePhone" class="form-input" placeholder="02XXXXXX" value="${store ? (store.phone || '') : ''}">
                
                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">رابط صورة الشعار (Logo URL)</label>
                <input type="text" id="storeLogo" class="form-input" placeholder="https://..." value="${store ? (store.logo_url || '') : ''}">

                ${statusSelect}

                <button onclick="saveStore('${storeId || ''}')" style="width:100%; background:var(--primary); color:white; border:none; padding:14px; border-radius:12px; font-weight:900; font-size:15px; cursor:pointer; margin-top:10px;">${isEditing ? 'حفظ التعديلات' : 'إضافة المتجر'}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

window.saveStore = async function(storeId) {
    const name = document.getElementById('storeName').value.trim();
    const category = document.getElementById('storeCategory').value.trim();
    const phone = document.getElementById('storePhone').value.trim();
    const logo_url = document.getElementById('storeLogo').value.trim();
    const statusEl = document.getElementById('storeStatus');
    const status = statusEl ? statusEl.value : 'مفتوح';

    if(!name) { alert("يرجى إدخال اسم المتجر"); return; }

    const payload = { name, store_name: name, category, phone, logo_url, status };

    try {
        if (storeId) {
            await window.supabaseClient.from('stores').update(payload).eq('id', storeId);
        } else {
            await window.supabaseClient.from('stores').insert([payload]);
        }
        document.getElementById('storeModal').remove();
        loadStoresData();
    } catch(e) { alert("فشل الحفظ: " + e.message); }
}

// نافذة الصنف (لإضافة أو تعديل)
window.openProductModal = function(storeId, productId = null) {
    let product = null;
    if (productId) {
        product = allProductsData.find(p => p.id === productId);
    }

    const isEditing = !!product;
    const modalId = 'productModal';

    const availSelect = isEditing ? `
        <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">حالة توفر الصنف</label>
        <select id="productAvail" class="form-input" style="font-weight:bold;">
            <option value="true" ${product.is_available !== false ? 'selected' : ''}>متوفر</option>
            <option value="false" ${product.is_available === false ? 'selected' : ''}>غير متوفر (نفد)</option>
        </select>
    ` : '';

    const modal = document.createElement('div');
    modal.id = modalId;
    modal.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; display:flex; justify-content:center; align-items:center; backdrop-filter: blur(4px);">
            <div style="background:#fff; width:90%; max-width:450px; border-radius:20px; padding:24px; position:relative; box-shadow:0 10px 40px rgba(0,0,0,0.2); max-height:90vh; overflow-y:auto;">
                <button onclick="document.getElementById('${modalId}').remove()" style="position:absolute; left:20px; top:20px; background:none; border:none; font-size:20px; color:#64748B; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
                <h3 style="margin-top:0; border-bottom:1px solid #E2E8F0; padding-bottom:15px; margin-bottom:15px; color:#0f172a; font-weight:900;"><i class="fa-solid fa-box"></i> ${isEditing ? 'تعديل الصنف' : 'إضافة صنف جديد'}</h3>
                
                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">اسم الصنف</label>
                <input type="text" id="prodName" class="form-input" placeholder="اسم الصنف..." value="${product ? (product.name || product.item_name) : ''}">
                
                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">القسم الداخلي (مقبلات، مشروبات...)</label>
                <input type="text" id="prodSection" class="form-input" placeholder="القسم" value="${product ? (product.category || product.category_name || '') : ''}">

                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">السعر (ر.ي)</label>
                <input type="number" id="prodPrice" class="form-input" placeholder="0" value="${product ? (product.price || '') : ''}">
                
                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">رابط صورة الوجبة (Image URL)</label>
                <input type="text" id="prodImg" class="form-input" placeholder="https://..." value="${product ? (product.image_url || '') : ''}">

                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">الوصف (اختياري)</label>
                <input type="text" id="prodDesc" class="form-input" placeholder="المكونات..." value="${product ? (product.description || '') : ''}">
                
                ${availSelect}

                <button onclick="saveProduct('${storeId}', '${productId || ''}')" style="width:100%; background:var(--primary); color:white; border:none; padding:14px; border-radius:12px; font-weight:900; font-size:15px; cursor:pointer; margin-top:10px;">${isEditing ? 'حفظ التعديلات' : 'إضافة الصنف'}</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

window.saveProduct = async function(storeId, productId) {
    const name = document.getElementById('prodName').value.trim();
    const category = document.getElementById('prodSection').value.trim();
    const price = parseFloat(document.getElementById('prodPrice').value) || 0;
    const description = document.getElementById('prodDesc').value.trim();
    const image_url = document.getElementById('prodImg').value.trim();
    const availEl = document.getElementById('productAvail');
    const is_available = availEl ? availEl.value === 'true' : true;

    if(!name || price <= 0) { alert("يرجى إدخال اسم الصنف وسعر صحيح"); return; }

    const payload = { store_id: storeId, name, item_name: name, category, category_name: category, price, description, image_url, is_available };

    try {
        if (productId) {
            await window.supabaseClient.from('products').update(payload).eq('id', productId);
        } else {
            await window.supabaseClient.from('products').insert([payload]);
        }
        document.getElementById('productModal').remove();
        loadStoresData();
    } catch(e) { alert("فشل الحفظ: " + e.message); }
}

// دوال الحذف
window.deleteStore = async function(storeId) {
    if(!confirm("هل أنت متأكد من حذف هذا المتجر؟ سيتم حذف جميع الأصناف التابعة له أيضاً.")) return;
    try {
        await window.supabaseClient.from('stores').delete().eq('id', storeId);
        loadStoresData();
    } catch(e) { alert("فشل الحذف: " + e.message); }
}

window.deleteProduct = async function(productId) {
    if(!confirm("هل أنت متأكد من حذف هذا الصنف؟")) return;
    try {
        await window.supabaseClient.from('products').delete().eq('id', productId);
        loadStoresData();
    } catch(e) { alert("فشل الحذف: " + e.message); }
}
