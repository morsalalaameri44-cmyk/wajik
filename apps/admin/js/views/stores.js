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
            .category-badge { background: #f1f5f9; color: #475569; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: bold; margin-left: 10px; }
            
            /* تصميم التبويبات العلوية للأقسام الرئيسية */
            .main-tabs { display: flex; gap: 10px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 10px; }
            .main-tabs::-webkit-scrollbar { height: 6px; }
            .main-tabs::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
            .tab-btn { background: #f8fafc; border: 1px solid #e2e8f0; color: #64748b; padding: 10px 20px; border-radius: 20px; font-weight: 800; font-size: 14px; cursor: pointer; white-space: nowrap; transition: 0.3s; }
            .tab-btn.active { background: var(--primary); color: white; border-color: var(--primary); box-shadow: 0 4px 10px rgba(242,92,5,0.2); }
        </style>
        
        <div style="max-width: 900px; margin: 0 auto; padding-bottom: 30px;">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:20px;">
                <h2 style="font-size: 18px; font-weight: 900; color: #0f172a;"><i class="fa-solid fa-shop" style="color:var(--primary);"></i> إدارة المتاجر والأقسام</h2>
                <button class="add-btn" onclick="openAddStoreModal()"><i class="fa-solid fa-plus"></i> إضافة متجر</button>
            </div>
            
            <!-- حاوية التبويبات (الأقسام الرئيسية) -->
            <div class="main-tabs" id="mainCategoriesTabs">
                <button class="tab-btn active" onclick="filterStores('الكل', this)">الكل</button>
                <!-- سيتم تعبئة باقي التبويبات ديناميكياً من قاعدة البيانات -->
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
        // جلب الأقسام الرئيسية
        const { data: categories, error: cErr } = await window.supabaseClient.from('categories').select('*').order('sort_order', { ascending: true });
        if(categories) {
            allMainCategories = categories.map(c => c.name.trim());
            renderMainTabs();
        }

        // جلب المتاجر
        const { data: stores, error: sErr } = await window.supabaseClient.from('stores').select('*').order('created_at', { ascending: false });
        if (sErr) throw sErr;
        allStoresData = stores || [];

        // جلب الأصناف من جدول products (بناءً على طلب العميل)
        const { data: products, error: pErr } = await window.supabaseClient.from('products').select('*');
        if (pErr) throw pErr;
        allProductsData = products || [];

        renderStoresList('الكل');
    } catch(e) {
        document.getElementById('storesListContainer').innerHTML = `<div style="background:#fee2e2; color:#dc2626; padding:20px; border-radius:12px; text-align:center; font-weight:bold;">خطأ في تحميل البيانات: ${e.message}</div>`;
    }
}

// رسم التبويبات العلوية للأقسام
function renderMainTabs() {
    const tabsContainer = document.getElementById('mainCategoriesTabs');
    let html = `<button class="tab-btn active" onclick="filterStores('الكل', this)">الكل</button>`;
    
    allMainCategories.forEach(cat => {
        html += `<button class="tab-btn" onclick="filterStores('${cat}', this)">${cat}</button>`;
    });
    
    tabsContainer.innerHTML = html;
}

// دالة التصفية عند الضغط على تبويب قسم معين
window.filterStores = function(categoryName, btnElement) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    if(btnElement) btnElement.classList.add('active');
    
    renderStoresList(categoryName);
}

// رسم قائمة المتاجر
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
        
        let iconClass = 'fa-store';
        if(storeCategory.includes('صيدل')) iconClass = 'fa-notes-medical';
        else if(storeCategory.includes('سوبر') || storeCategory.includes('بقالة')) iconClass = 'fa-basket-shopping';

        const storeProducts = allProductsData.filter(p => p.store_id === store.id);
        
        let productsHtml = '';
        if(storeProducts.length === 0) {
            productsHtml = `<p style="color:#94a3b8; font-size:13px; font-style:italic; text-align:center; padding:10px 0;">لا توجد أصناف مضافة في هذا المتجر بعد</p>`;
        } else {
            storeProducts.forEach(product => {
                const prodName = product.name || product.item_name || 'صنف غير محدد';
                // جلب القسم الداخلي للمنتج
                const prodSection = product.category || product.category_name || 'عام';
                
                productsHtml += `
                    <div class="item-row-row">
                        <div>
                            <strong style="color:#0f172a; font-size:14px;">${prodName}</strong>
                            <span class="category-badge">${prodSection}</span>
                            <span style="color:#64748b; font-size:12px; display:block; margin-top:4px;">${product.description || ''}</span>
                        </div>
                        <div style="display:flex; align-items:center; gap:15px;">
                            <span style="color:#059669; font-weight:900; font-size:15px;">${product.price} ر.ي</span>
                            <button onclick="deleteProduct('${product.id}')" style="background:#fee2e2; color:#dc2626; border:none; width:30px; height:30px; border-radius:8px; cursor:pointer;" title="حذف الصنف"><i class="fa-solid fa-trash"></i></button>
                        </div>
                    </div>
                `;
            });
        }

        html += `
            <div class="store-card">
                <div class="store-header">
                    <div>
                        <h3 style="margin:0 0 5px 0; color:#0f172a; font-weight:900; font-size:16px;">${storeName}</h3>
                        <span style="color:#64748b; font-size:13px;"><i class="fa-solid ${iconClass}" style="color:var(--primary); margin-left:4px;"></i> ${storeCategory} • <i class="fa-solid fa-phone" style="margin-left:4px;"></i> ${storePhone}</span>
                    </div>
                    <div style="display:flex; gap:10px;">
                        <button onclick="openAddProductModal('${store.id}', '${storeName}')" style="background:#eff6ff; color:#2563eb; border:1px solid #93c5fd; padding:8px 14px; border-radius:8px; font-weight:bold; cursor:pointer; font-size:13px;"><i class="fa-solid fa-plus"></i> إضافة صنف</button>
                        <button onclick="deleteStore('${store.id}')" style="background:#fee2e2; color:#dc2626; border:none; padding:8px 12px; border-radius:8px; cursor:pointer;" title="حذف المتجر"><i class="fa-solid fa-trash"></i></button>
                    </div>
                </div>
                <div style="background:#f8fafc; padding:10px 15px; border-radius:12px; border:1px solid #f1f5f9;">
                    <h4 style="margin:0 0 10px 0; font-size:13px; color:#475569; font-weight:800;">قائمة الأصناف:</h4>
                    ${productsHtml}
                </div>
            </div>
        `;
    });

    container.innerHTML = html;
}

// نافذة إضافة متجر جديد
window.openAddStoreModal = function() {
    let categoryOptions = '';
    allMainCategories.forEach(cat => {
        categoryOptions += `<option value="${cat}">${cat}</option>`;
    });
    
    // إذا لم تكن الأقسام موجودة، نوفر خيارات افتراضية
    if(categoryOptions === '') {
        categoryOptions = `
            <option value="مطاعم">مطاعم</option>
            <option value="صيدليات">صيدليات</option>
            <option value="سوبر ماركت">سوبر ماركت</option>
        `;
    }

    const modal = document.createElement('div');
    modal.id = 'storeModal';
    modal.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; display:flex; justify-content:center; align-items:center; backdrop-filter: blur(4px);">
            <div style="background:#fff; width:90%; max-width:450px; border-radius:20px; padding:24px; position:relative; box-shadow:0 10px 40px rgba(0,0,0,0.2);">
                <button onclick="document.getElementById('storeModal').remove()" style="position:absolute; left:20px; top:20px; background:none; border:none; font-size:20px; color:#64748B; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
                <h3 style="margin-top:0; border-bottom:1px solid #E2E8F0; padding-bottom:15px; margin-bottom:15px; color:#0f172a; font-weight:900;"><i class="fa-solid fa-shop"></i> إضافة متجر شريك جديد</h3>
                
                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">اسم المتجر</label>
                <input type="text" id="newStoreName" class="form-input" placeholder="مثال: صيدلية الأمل، مطعم الشيباني">
                
                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">القسم الرئيسي المتواجد فيه التطبيق</label>
                <select id="newStoreCategory" class="form-input" style="font-weight:bold;">
                    ${categoryOptions}
                </select>
                
                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">رقم الهاتف</label>
                <input type="text" id="newStorePhone" class="form-input" placeholder="02XXXXXX">

                <button onclick="saveNewStore()" style="width:100%; background:var(--primary); color:white; border:none; padding:14px; border-radius:12px; font-weight:900; font-size:15px; cursor:pointer; box-shadow:0 4px 15px rgba(242,92,5,0.3);">حفظ المتجر</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

window.saveNewStore = async function() {
    const name = document.getElementById('newStoreName').value.trim();
    const category = document.getElementById('newStoreCategory').value.trim();
    const phone = document.getElementById('newStorePhone').value.trim();

    if(!name) { alert("يرجى إدخال اسم المتجر"); return; }

    try {
        const { error } = await window.supabaseClient.from('stores').insert([{ 
            name: name,
            category: category, 
            phone: phone 
        }]);
        if(error) throw error;
        document.getElementById('storeModal').remove();
        loadStoresData();
    } catch(e) {
        alert("فشل الحفظ: " + e.message);
    }
}

// نافذة إضافة صنف للمتجر
window.openAddProductModal = function(storeId, storeName) {
    const modal = document.createElement('div');
    modal.id = 'productModal';
    modal.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; display:flex; justify-content:center; align-items:center; backdrop-filter: blur(4px);">
            <div style="background:#fff; width:90%; max-width:450px; border-radius:20px; padding:24px; position:relative; box-shadow:0 10px 40px rgba(0,0,0,0.2);">
                <button onclick="document.getElementById('productModal').remove()" style="position:absolute; left:20px; top:20px; background:none; border:none; font-size:20px; color:#64748B; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
                <h3 style="margin-top:0; border-bottom:1px solid #E2E8F0; padding-bottom:15px; margin-bottom:15px; color:#0f172a; font-weight:900;"><i class="fa-solid fa-box"></i> إضافة صنف إلى (${storeName})</h3>
                
                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">اسم الصنف</label>
                <input type="text" id="newProductName" class="form-input" placeholder="مثال: بنادول، برجر، دفتر...">
                
                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">القسم الداخلي (مثال: مقبلات، مسكنات، معلبات)</label>
                <input type="text" id="newProductSection" class="form-input" placeholder="تصنيف الصنف داخل المتجر">

                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">السعر (ر.ي)</label>
                <input type="number" id="newProductPrice" class="form-input" placeholder="0">
                
                <label style="display:block; font-weight:800; font-size:13px; color:#475569; margin-bottom:5px;">الوصف (اختياري)</label>
                <input type="text" id="newProductDesc" class="form-input" placeholder="وصف المنتج...">

                <button onclick="saveNewProduct('${storeId}')" style="width:100%; background:var(--primary); color:white; border:none; padding:14px; border-radius:12px; font-weight:900; font-size:15px; cursor:pointer; box-shadow:0 4px 15px rgba(242,92,5,0.3);">إضافة الصنف للمتجر</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
}

window.saveNewProduct = async function(storeId) {
    const name = document.getElementById('newProductName').value.trim();
    const section = document.getElementById('newProductSection').value.trim();
    const price = parseFloat(document.getElementById('newProductPrice').value) || 0;
    const description = document.getElementById('newProductDesc').value.trim();

    if(!name || price <= 0) { alert("يرجى إدخال اسم الصنف وسعر صحيح"); return; }

    try {
        const { error } = await window.supabaseClient.from('products').insert([{ 
            store_id: storeId, 
            name: name,
            category: section, 
            price: price, 
            description: description 
        }]);
        if(error) throw error;
        document.getElementById('productModal').remove();
        loadStoresData();
    } catch(e) {
        alert("فشل الحفظ: " + e.message);
    }
}

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
