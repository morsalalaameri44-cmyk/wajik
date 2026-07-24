// ==========================================
// 1. هيكل البيانات وإدارة الحالة (State Management)
// ==========================================
window.opsState = window.opsState || {
    tab: 'all',
    search: '',
    orders: [],
    realtimeInitialized: false
};

window.playAlertSound = function() {
    const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3');
    audio.play().catch(e => console.log('بانتظار تفاعل المستخدم للصوت'));
};

// ==========================================
// 2. دوال التفاعل مع الواجهة (UI Interactions)
// ==========================================
window.switchTab = function(tabName) {
    window.opsState.tab = tabName;
    renderTabsAndList(); 
};

window.handleSearchInput = function(query) {
    window.opsState.search = query.toLowerCase();
    renderOrderCards(); 
};

// مُفسّر الأصناف الذكي
function generateItemsHtml(orderItems) {
    if (!orderItems) return '<div style="text-align:center; color:#94A3B8; font-style:italic;">لا توجد أصناف</div>';
    
    let itemsArray = [];
    if (typeof orderItems === 'string') {
        try {
            let cleanStr = orderItems.replace(/,\s*([\]}])/g, '$1');
            itemsArray = JSON.parse(cleanStr);
        } catch (e) {
            return `<div dir="ltr" style="text-align:left; background:#F8FAFC; padding:12px; border-radius:10px; font-family:monospace; font-size:12px; white-space:pre-wrap; color:#334155;">${orderItems}</div>`;
        }
    } else if (Array.isArray(orderItems)) {
        itemsArray = orderItems;
    } else if (typeof orderItems === 'object') {
        itemsArray = Object.values(orderItems);
    }

    if (Array.isArray(itemsArray) && itemsArray.length > 0) {
        return itemsArray.map(item => `
            <div style="display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px dashed #E2E8F0;">
                <div>
                    <span style="font-weight:800; color:#0F172A; font-size:15px;">${item.name || item.title || 'صنف غير معروف'}</span>
                    <span style="color:#059669; font-weight:900; background:#D1FAE5; padding:3px 10px; border-radius:50px; font-size:12px; margin-right:10px;">x ${item.qty || item.quantity || 1}</span>
                </div>
                <strong style="color:#0F172A; font-size:15px;">${parseFloat(item.price || 0) * parseInt(item.qty || item.quantity || 1)} ر.ي</strong>
            </div>
        `).join('');
    }

    return '<div style="text-align:center; color:#94A3B8; font-style:italic;">صيغة الأصناف غير معروفة</div>';
}

// ==========================================
// 3. نوافذ العرض والتعديل الشاملة (Modals)
// ==========================================

window.openOrderDetails = function(orderId) {
    const order = window.opsState.orders.find(o => o.id == orderId);
    if(!order) return;
    
    const cName = order.customer_name || order.name || 'عميل غير مسجل';
    const cPhone = order.customer_phone || order.phone || '---';
    const address = order.address || order.location || 'غير محدد';
    
    const total = parseFloat(order.total_amount || order.total_price || order.price || order.total) || 0;
    const deliveryFee = parseFloat(order.delivery_fee) || 0;
    const subtotal = (total - deliveryFee > 0) ? (total - deliveryFee) : total; 
    
    const itemsHtml = generateItemsHtml(order.order_items || order.items_details);
    const notes = order.notes || order.customer_notes || 'لا توجد ملاحظات';

    const modal = document.createElement('div');
    modal.id = 'customModal';
    modal.innerHTML = `
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; display:flex; justify-content:center; align-items:center; backdrop-filter: blur(4px);">
            <div style="background:#F1F5F9; width:90%; max-width:450px; border-radius:24px; box-shadow:0 10px 40px rgba(0,0,0,0.2); position:relative; overflow:hidden; display:flex; flex-direction:column; max-height: 90vh;">
                <div style="background:#FFF; padding:20px; border-bottom:2px dashed #E2E8F0; text-align:center; position:relative;">
                    <button onclick="document.getElementById('customModal').remove()" style="position:absolute; left:20px; top:20px; background:none; border:none; font-size:20px; color:#64748B; cursor:pointer; transition:0.2s;"><i class="fa-solid fa-xmark"></i></button>
                    <div style="width:50px; height:50px; background:rgba(242,92,5,0.1); color:var(--primary); border-radius:50%; display:flex; justify-content:center; align-items:center; font-size:24px; margin:0 auto 10px auto;"><i class="fa-solid fa-receipt"></i></div>
                    <h3 style="margin:0; color:#0F172A; font-size:18px; font-weight:900;">فاتورة الطلب #${order.id.toString().substring(0,6).toUpperCase()}</h3>
                </div>
                <div style="padding:20px; overflow-y:auto;">
                    <div style="background:#FFF; border-radius:14px; padding:16px; margin-bottom:15px; box-shadow:0 2px 10px rgba(0,0,0,0.02);">
                        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                            <span style="color:#64748B; font-size:13px; font-weight:700;"><i class="fa-solid fa-user"></i> العميل</span>
                            <strong style="color:#0F172A; font-size:14px;">${cName}</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                            <span style="color:#64748B; font-size:13px; font-weight:700;"><i class="fa-solid fa-phone"></i> الهاتف</span>
                            <strong style="color:#0F172A; font-size:14px;" dir="ltr">${cPhone}</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span style="color:#64748B; font-size:13px; font-weight:700;"><i class="fa-solid fa-location-dot"></i> العنوان</span>
                            <strong style="color:#0F172A; font-size:14px; max-width:60%; text-align:left;">${address}</strong>
                        </div>
                    </div>
                    <h4 style="margin:0 0 10px 5px; color:#475569; font-size:14px; font-weight:800;"><i class="fa-solid fa-basket-shopping"></i> الأصناف المطلوبة</h4>
                    <div style="background:#FFF; border-radius:14px; padding:6px 16px; margin-bottom:15px; box-shadow:0 2px 10px rgba(0,0,0,0.02);">
                        ${itemsHtml}
                    </div>
                    <div style="background:#FEF3C7; color:#B45309; padding:14px; border-radius:14px; margin-bottom:15px; font-size:13px; font-weight:800; border:1px solid #FDE68A;">
                        <i class="fa-solid fa-circle-exclamation"></i> ملاحظة: ${notes}
                    </div>
                    <div style="background:#FFF; border-radius:14px; padding:16px; box-shadow:0 2px 10px rgba(0,0,0,0.02);">
                        <div style="display:flex; justify-content:space-between; margin-bottom:12px; font-size:14px; color:#475569; font-weight:700;">
                            <span>الإجمالي الفرعي للطلب</span>
                            <strong>${subtotal} ر.ي</strong>
                        </div>
                        <div style="display:flex; justify-content:space-between; margin-bottom:15px; font-size:14px; color:#475569; font-weight:700;">
                            <span>رسوم التوصيل</span>
                            <strong>${deliveryFee} ر.ي</strong>
                        </div>
                        <div style="border-top:1px dashed #CBD5E1; margin:0 -16px 15px -16px;"></div>
                        <div style="display:flex; justify-content:space-between; align-items:center;">
                            <span style="font-weight:900; color:#0F172A; font-size:16px;">الإجمالي النهائي</span>
                            <strong style="color:#059669; font-weight:900; font-size:20px; background:#D1FAE5; padding:6px 12px; border-radius:10px;">${total} ر.ي</strong>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

window.recalculateTotal = function() {
    let total = 0;
    const rows = document.querySelectorAll('#edit-items-container .item-row');
    rows.forEach(row => {
        const q = parseFloat(row.querySelector('.item-qty').value) || 0;
        const p = parseFloat(row.querySelector('.item-price').value) || 0;
        total += (q * p);
    });
    const delivery = parseFloat(document.getElementById('edit-delivery').value) || 0;
    document.getElementById('edit-total').value = total + delivery;
};

window.addEditItemRow = function(qty = 1, name = '', price = 0) {
    const container = document.getElementById('edit-items-container');
    const row = document.createElement('div');
    row.className = 'item-row';
    row.style.cssText = 'display:flex; gap:8px; margin-bottom:10px; align-items:center; background:#FFF; padding:8px; border-radius:10px; border:1px solid #E2E8F0;';
    row.innerHTML = `
        <input type="number" class="edit-input item-qty" value="${qty}" oninput="recalculateTotal()" style="width:60px; margin:0; padding:8px; text-align:center;" placeholder="العدد">
        <input type="text" class="edit-input item-name" value="${name}" style="flex:1; margin:0; padding:8px;" placeholder="اسم الصنف">
        <input type="number" class="edit-input item-price" value="${price}" oninput="recalculateTotal()" style="width:90px; margin:0; padding:8px; text-align:center;" placeholder="السعر">
        <button type="button" onclick="this.parentElement.remove(); recalculateTotal();" style="background:#FEE2E2; color:#DC2626; border:none; border-radius:8px; min-width:36px; height:36px; cursor:pointer;" title="حذف الصنف"><i class="fa-solid fa-trash"></i></button>
    `;
    if(container) container.appendChild(row);
    recalculateTotal();
};

window.openEditModal = function(orderId) {
    const order = window.opsState.orders.find(o => o.id == orderId);
    if(!order) return;
    
    const cName = order.customer_name || order.name || '';
    const cPhone = order.customer_phone || order.phone || '';
    const address = order.address || order.location || '';
    const deliveryFee = order.delivery_fee || 0;
    
    const total = order.total_amount || order.total_price || order.price || order.total || 0;
    const status = order.status || 'new';

    let itemsArray = null;
    let rawTextFallback = '';
    let showRawText = false;

    if (typeof order.order_items === 'string') {
        try {
            let cleanStr = order.order_items.replace(/,\s*([\]}])/g, '$1');
            itemsArray = JSON.parse(cleanStr);
        } catch(e) {
            rawTextFallback = order.order_items;
            showRawText = true;
        }
    } else if (Array.isArray(order.order_items)) {
        itemsArray = order.order_items;
    } else if (typeof order.order_items === 'object' && order.order_items !== null) {
        itemsArray = Object.values(order.order_items);
    } else {
        showRawText = true;
        rawTextFallback = order.order_items || '';
    }

    let dynamicItemsHtml = '';
    if (Array.isArray(itemsArray) && itemsArray.length > 0) {
        showRawText = false;
        itemsArray.forEach(item => {
            dynamicItemsHtml += `
            <div class="item-row" style="display:flex; gap:8px; margin-bottom:10px; align-items:center; background:#FFF; padding:8px; border-radius:10px; border:1px solid #E2E8F0;">
                <input type="number" class="edit-input item-qty" value="${item.qty || item.quantity || 1}" oninput="recalculateTotal()" style="width:60px; margin:0; padding:8px; text-align:center;" title="الكمية">
                <input type="text" class="edit-input item-name" value="${item.name || item.title || ''}" style="flex:1; margin:0; padding:8px;" title="اسم الصنف">
                <input type="number" class="edit-input item-price" value="${item.price || 0}" oninput="recalculateTotal()" style="width:90px; margin:0; padding:8px; text-align:center;" title="السعر">
                <button type="button" onclick="this.parentElement.remove(); recalculateTotal();" style="background:#FEE2E2; color:#DC2626; border:none; border-radius:8px; min-width:36px; height:36px; cursor:pointer;"><i class="fa-solid fa-trash"></i></button>
            </div>`;
        });
    }

    const modal = document.createElement('div');
    modal.id = 'editModal';
    modal.innerHTML = `
        <style>
            .edit-input { width: 100%; padding: 12px; border: 1px solid #CBD5E1; border-radius: 10px; margin-bottom: 12px; font-family: inherit; font-size: 14px; transition: 0.2s; background: #F8FAFC; }
            .edit-input:focus { outline: none; border-color: var(--primary); background: #FFF; box-shadow: 0 0 0 3px rgba(242,92,5,0.1); }
            .edit-label { display: block; margin-bottom: 6px; font-weight: 800; color: #334155; font-size: 13px; }
            .edit-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            input[type=number]::-webkit-inner-spin-button, 
            input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
        </style>
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; display:flex; justify-content:center; align-items:center; backdrop-filter: blur(4px);">
            <div style="background:#fff; width:90%; max-width:550px; border-radius:20px; padding:24px; box-shadow:0 10px 40px rgba(0,0,0,0.2); position:relative; max-height: 90vh; overflow-y: auto;">
                <button onclick="document.getElementById('editModal').remove()" style="position:absolute; left:20px; top:20px; background:none; border:none; font-size:20px; color:#64748B; cursor:pointer;"><i class="fa-solid fa-xmark"></i></button>
                <h3 style="margin-top:0; color:var(--text-dark); border-bottom:1px solid #E2E8F0; padding-bottom:15px; margin-bottom:15px;"><i class="fa-solid fa-pen-to-square"></i> تعديل الطلب #${order.id.toString().substring(0,6).toUpperCase()}</h3>
                
                <div style="display:flex; flex-direction:column;">
                    <label class="edit-label">حالة الطلب (تعديل إجباري)</label>
                    <select id="edit-status" class="edit-input" style="border-color:var(--primary); font-weight:bold;">
                        <option value="new" ${status==='new'?'selected':''}>طلب جديد</option>
                        <option value="processing" ${status==='processing'?'selected':''}>قيد التجهيز</option>
                        <option value="delivering" ${status==='delivering'?'selected':''}>مع الكابتن في الطريق</option>
                        <option value="completed" ${status==='completed'?'selected':''}>مكتمل</option>
                        <option value="canceled" ${status==='canceled'?'selected':''}>ملغي</option>
                    </select>

                    <div class="edit-grid">
                        <div>
                            <label class="edit-label">اسم العميل</label>
                            <input type="text" id="edit-name" class="edit-input" value="${cName}">
                        </div>
                        <div>
                            <label class="edit-label">رقم الهاتف</label>
                            <input type="text" id="edit-phone" class="edit-input" value="${cPhone}">
                        </div>
                    </div>

                    <label class="edit-label">العنوان / الموقع</label>
                    <input type="text" id="edit-address" class="edit-input" value="${address}">
                    
                    <label class="edit-label">تفاصيل الأصناف</label>
                    
                    <div id="dynamic-items-wrapper" style="display:${showRawText ? 'none' : 'block'};">
                        <div id="edit-items-container" style="background:#F8FAFC; padding:10px; border-radius:10px; border:1px solid #CBD5E1; margin-bottom:10px; max-height:180px; overflow-y:auto;">
                            ${dynamicItemsHtml}
                        </div>
                        <button type="button" onclick="addEditItemRow()" style="width:100%; background:#EFF6FF; color:#2563EB; border:1px dashed #93C5FD; padding:10px; border-radius:10px; font-weight:bold; cursor:pointer; margin-bottom:12px; transition:0.2s;"><i class="fa-solid fa-plus"></i> إضافة صنف جديد</button>
                    </div>

                    <textarea id="edit-details-raw" class="edit-input" style="height:80px; resize:none; display:${showRawText ? 'block' : 'none'};">${rawTextFallback}</textarea>

                    <div class="edit-grid">
                        <div>
                            <label class="edit-label">رسوم التوصيل</label>
                            <input type="number" id="edit-delivery" class="edit-input" value="${deliveryFee}" oninput="recalculateTotal()">
                        </div>
                        <div>
                            <label class="edit-label">الإجمالي النهائي</label>
                            <input type="number" id="edit-total" class="edit-input" value="${total}" style="color:var(--success); font-weight:bold; font-size:18px;">
                        </div>
                    </div>

                    <button onclick="saveOrderEdits('${order.id}')" style="width:100%; background:var(--primary); color:white; border:none; padding:14px; border-radius:12px; font-weight:800; font-size:16px; cursor:pointer; margin-top:10px; box-shadow:0 4px 15px rgba(242,92,5,0.3);"><i class="fa-solid fa-floppy-disk"></i> حفظ التعديلات</button>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
};

window.saveOrderEdits = async function(orderId) {
    try {
        let finalDetails = [];
        
        const dynamicWrapper = document.getElementById('dynamic-items-wrapper');
        if (dynamicWrapper && dynamicWrapper.style.display !== 'none') {
            const rows = document.querySelectorAll('#edit-items-container .item-row');
            rows.forEach(row => {
                const qty = parseInt(row.querySelector('.item-qty').value) || 1;
                const name = row.querySelector('.item-name').value.trim();
                const price = parseFloat(row.querySelector('.item-price').value) || 0;
                if (name) { 
                    finalDetails.push({ qty, name, price });
                }
            });
        } else {
            finalDetails = document.getElementById('edit-details-raw').value;
        }

        const updateData = {
            status: document.getElementById('edit-status').value,
            customer_name: document.getElementById('edit-name').value,
            customer_phone: document.getElementById('edit-phone').value,
            address: document.getElementById('edit-address').value,
            order_items: finalDetails, 
            delivery_fee: document.getElementById('edit-delivery').value,
            total_amount: document.getElementById('edit-total').value
        };

        const { error } = await window.supabaseClient.from('orders').update(updateData).eq('id', orderId);
        if (error) throw error;

        document.getElementById('editModal').remove();
        
        const toast = document.createElement('div');
        toast.innerHTML = `<div style="position:fixed; top:20px; left:50%; transform:translateX(-50%); background:#10B981; color:white; padding:12px 24px; border-radius:50px; font-weight:bold; z-index:10000; box-shadow:0 4px 15px rgba(16,185,129,0.3);"><i class="fa-solid fa-check"></i> تم حفظ التعديلات بنجاح</div>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);

        fetchAndRenderData();
    } catch (error) {
        alert("فشل الحفظ: " + error.message);
    }
};

// ==========================================
// 4. نظام إسناد المناديب المشترك (رادار تتبع + قائمة يدوية)
// ==========================================
// 🟢 تم تغيير اسم الدالة لتجنب التعارض مع ملف المناديب
window.openDispatchModal = async function(orderId) {
    const existingModal = document.getElementById('dispatchModal');
    if (existingModal) {
        existingModal.remove();
    }

    const modal = document.createElement('div');
    modal.id = 'dispatchModal';
    modal.innerHTML = `
        <style>
            #dispatchMap { width: 100%; height: 250px; border-radius: 16px; margin-top: 15px; margin-bottom: 15px; border: 2px solid #E2E8F0; z-index: 1; background: #F1F5F9;}
            .leaflet-popup-content-wrapper { text-align: right; font-family: 'Tajawal', sans-serif; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.15); }
            .leaflet-popup-content { margin: 15px; }
            .assign-map-btn { background: var(--primary); color: white; border: none; padding: 10px 15px; border-radius: 10px; font-weight: 800; cursor: pointer; width: 100%; margin-top: 10px; font-family: inherit; font-size: 14px; transition: 0.2s; box-shadow: 0 4px 10px rgba(242,92,5,0.3); }
            .assign-map-btn:active { transform: scale(0.96); }
        </style>
        <div style="position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.6); z-index:9999; display:flex; justify-content:center; align-items:center; backdrop-filter: blur(4px);">
            <div style="background:#fff; width:95%; max-width:600px; border-radius:24px; padding:24px; position:relative; box-shadow:0 10px 40px rgba(0,0,0,0.2); max-height: 90vh; overflow-y: auto;">
                <button onclick="document.getElementById('dispatchModal').remove()" style="position:absolute; left:20px; top:20px; background:none; border:none; font-size:24px; color:#64748B; cursor:pointer; z-index: 1000;"><i class="fa-solid fa-xmark"></i></button>
                <h3 style="margin-top:0; border-bottom:1px solid #E2E8F0; padding-bottom:15px; color:#0F172A; font-weight:900;">
                    <i class="fa-solid fa-satellite-dish" style="color:var(--info);"></i> إسناد الطلب #${orderId.toString().substring(0,6).toUpperCase()}
                </h3>
                
                <div id="dispatchMap"></div>
                
                <div id="mapStatus" style="text-align:center; padding-bottom:15px; border-bottom:1px solid #E2E8F0; margin-bottom:15px; color:#64748B; font-weight:800; font-size:14px;">
                    <i class="fa-solid fa-spinner fa-spin" style="color:var(--primary);"></i> جاري المسح وجلب الكباتن المتاحين...
                </div>

                <h4 style="margin:0 0 15px 0; color:#0F172A; font-size:15px;"><i class="fa-solid fa-list-ul"></i> الإسناد اليدوي المباشر</h4>
                <div id="manualDriversList" style="max-height:200px; overflow-y:auto; padding-right:5px;">
                    <div style="text-align:center; padding:20px; color:#94A3B8;"><i class="fa-solid fa-spinner fa-spin"></i> جاري التحميل...</div>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(modal);

    if (typeof L === 'undefined') {
        await new Promise((resolve) => {
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
            document.head.appendChild(link);

            const script = document.createElement('script');
            script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
            script.onload = resolve;
            document.head.appendChild(script);
        });
    }

    initDispatchSystem(orderId);
};

async function initDispatchSystem(orderId) {
    try {
        const adenCenter = [12.8222, 45.0381];
        
        const mapContainer = L.DomUtil.get('dispatchMap');
        if(mapContainer != null){
            mapContainer._leaflet_id = null;
        }

        const map = L.map('dispatchMap').setView(adenCenter, 12);
        
        L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; OpenStreetMap contributors &copy; CARTO'
        }).addTo(map);

        setTimeout(() => { map.invalidateSize(); }, 250);

        const driverIcon = L.divIcon({
            html: '<div style="background:var(--primary); color:white; width:40px; height:40px; border-radius:50%; display:flex; justify-content:center; align-items:center; border:3px solid white; box-shadow:0 4px 15px rgba(242,92,5,0.5); font-size:18px;"><i class="fa-solid fa-motorcycle"></i></div>',
            className: 'custom-driver-icon',
            iconSize: [40, 40],
            iconAnchor: [20, 20],
            popupAnchor: [0, -20]
        });

        const { data: drivers, error } = await window.supabaseClient.from('drivers').select('*').eq('status', 'نشط');
        if (error) throw error;

        const manualList = document.getElementById('manualDriversList');

        if (!drivers || drivers.length === 0) {
            document.getElementById('mapStatus').innerHTML = `<span style="color:var(--danger);"><i class="fa-solid fa-triangle-exclamation"></i> لا يوجد كباتن متاحين حالياً!</span>`;
            manualList.innerHTML = `<div style="text-align:center; padding:20px; color:var(--danger); font-weight:bold; background:#FEE2E2; border-radius:12px;">جميع الكباتن مشغولون أو متوقفون عن العمل.</div>`;
            return;
        }

        document.getElementById('mapStatus').innerHTML = `<span style="color:var(--success);"><i class="fa-solid fa-circle-check"></i> تم رصد ${drivers.length} كباتن متاحين. اختر من الخريطة أو القائمة.</span>`;

        let listHTML = '';

        drivers.forEach(d => {
            const dName = d.driver_name || d.full_name || d.name || 'مندوب غير محدد';
            
            const simulatedLat = 12.8222 + (Math.random() - 0.5) * 0.08;
            const simulatedLng = 45.0381 + (Math.random() - 0.5) * 0.08;
            const finalLat = d.lat || simulatedLat;
            const finalLng = d.lng || simulatedLng;

            const marker = L.marker([finalLat, finalLng], { icon: driverIcon }).addTo(map);
            
            const popupContent = `
                <div style="min-width:180px;">
                    <h4 style="margin:0 0 5px 0; color:#0F172A; font-weight:900; font-size:16px;">${dName}</h4>
                    <p style="margin:0 0 12px 0; color:#64748B; font-size:13px; font-weight:600;"><i class="fa-solid fa-phone"></i> ${d.phone || 'بدون رقم'} <br> <span style="color:var(--success);"><i class="fa-solid fa-circle" style="font-size:8px;"></i> جاهز</span></p>
                    <button class="assign-map-btn" onclick="assignDriver('${orderId}', '${d.id}', '${dName}')"><i class="fa-solid fa-paper-plane"></i> إرسال الطلب</button>
                </div>
            `;
            marker.bindPopup(popupContent);

            listHTML += `
                <div style="display:flex; justify-content:space-between; align-items:center; padding:12px; border:1px solid #E2E8F0; border-radius:12px; margin-bottom:10px; background:#F8FAFC;">
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div style="width:40px; height:40px; background:#EFF6FF; color:#2563EB; border-radius:10px; display:flex; justify-content:center; align-items:center; font-size:18px;"><i class="fa-solid fa-motorcycle"></i></div>
                        <div>
                            <div style="font-weight:800; color:#0F172A; font-size:14px;">${dName}</div>
                            <div style="font-size:12px; color:#64748B;"><i class="fa-solid fa-phone"></i> ${d.phone || 'بدون رقم'}</div>
                        </div>
                    </div>
                    <button onclick="assignDriver('${orderId}', '${d.id}', '${dName}')" style="background:#1E293B; color:white; border:none; padding:8px 16px; border-radius:8px; font-weight:bold; cursor:pointer; transition:0.2s;">إسناد</button>
                </div>
            `;
        });

        manualList.innerHTML = listHTML;

    } catch (err) {
        console.error("خطأ في جلب الكباتن أو الخريطة:", err);
        document.getElementById('mapStatus').innerHTML = `<span style="color:var(--danger); font-size:13px;"><i class="fa-solid fa-bug"></i> حدث خطأ: ${err.message || 'مشكلة في تحميل الخريطة'}</span>`;
        document.getElementById('manualDriversList').innerHTML = `<span style="color:red; text-align:center; display:block; padding:10px; font-family:monospace; font-size:12px; direction:ltr;">${err.message || err}</span>`;
    }
}

window.assignDriver = async function(orderId, driverId, driverName) {
    const modal = document.getElementById('dispatchModal');
    if (modal) modal.remove();
    
    try {
        const { error: orderError } = await window.supabaseClient.from('orders').update({ status: 'delivering', driver_name: driverName }).eq('id', orderId);
        if (orderError) throw orderError;
        
        const { error: driverError } = await window.supabaseClient.from('drivers').update({ status: 'مشغول' }).eq('id', driverId);
        if (driverError) console.error("لم يتم تحديث حالة المندوب إلى مشغول:", driverError);
        
        const toast = document.createElement('div');
        toast.innerHTML = `<div style="position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:#10B981; color:white; padding:12px 24px; border-radius:50px; font-weight:bold; z-index:10000; box-shadow:0 4px 15px rgba(16,185,129,0.3);"><i class="fa-solid fa-check"></i> تم إسناد الطلب للمندوب: ${driverName}</div>`;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
        
        fetchAndRenderData();
    } catch (e) {
        alert('فشل إسناد المندوب: ' + (e.message || e));
    }
};

window.updateOrderStatus = async function(orderId, newStatus) {
    try {
        const { error } = await window.supabaseClient.from('orders').update({ status: newStatus }).eq('id', orderId);
        if (error) throw error;
        
        if(newStatus === 'completed') {
            const { data: orderData } = await window.supabaseClient.from('orders').select('driver_name').eq('id', orderId).single();
            if(orderData && orderData.driver_name) {
                await window.supabaseClient.from('drivers').update({ status: 'نشط' }).eq('driver_name', orderData.driver_name);
            }
        }
        
        fetchAndRenderData();
    } catch (error) {
        alert("خطأ في التحديث: " + error.message);
    }
};

function getTimeElapsedHTML(createdAt) {
    if (!createdAt) return '';
    const diffMs = new Date() - new Date(createdAt);
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return `<span style="color:#059669; font-size:12px;"><i class="fa-regular fa-clock"></i> الآن</span>`;
    if (diffMins > 15) return `<span style="color:#DC2626; font-size:12px; font-weight:bold; background:#FEE2E2; padding:2px 6px; border-radius:4px;"><i class="fa-solid fa-triangle-exclamation"></i> منذ ${diffMins} دقيقة</span>`;
    return `<span style="color:#64748B; font-size:12px;"><i class="fa-regular fa-clock"></i> منذ ${diffMins} دقيقة</span>`;
}

// ==========================================
// 5. البناء الهيكلي والتحديث اللحظي
// ==========================================
window.renderLiveOrders = async function(container) {
    
    if (!document.getElementById('ops-container')) {
        container.innerHTML = `
            <style>
                .search-bar { width: 100%; padding: 16px 20px; border-radius: 14px; border: 1px solid var(--border); margin-bottom: 20px; font-size: 15px; background: var(--card-bg); outline: none; transition: 0.2s; }
                .search-bar:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(242, 92, 5, 0.1); }
                .tabs-container { display: flex; gap: 10px; margin-bottom: 20px; overflow-x: auto; padding-bottom: 5px; scrollbar-width: none; }
                .tabs-container::-webkit-scrollbar { display: none; }
                .tab-btn { padding: 10px 18px; border-radius: 50px; border: 1px solid var(--border); background: var(--card-bg); color: var(--text-gray); font-weight: 800; font-size: 13.5px; cursor: pointer; transition: 0.3s; white-space: nowrap; }
                .tab-btn.active { background: var(--primary); color: white; border-color: var(--primary); box-shadow: 0 4px 15px rgba(242, 92, 5, 0.3); }
                .delivery-card { background: var(--card-bg); border-radius: 16px; padding: 20px; margin-bottom: 16px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); border: 1px solid var(--border); position: relative; }
                .delivery-card::before { content: ''; position: absolute; right: 0; top: 0; bottom: 0; width: 4px; background: var(--primary); border-radius: 0 16px 16px 0; }
                .status-pill { padding: 6px 14px; border-radius: 50px; font-size: 12px; font-weight: 800; }
                .pill-new { background: rgba(242, 92, 5, 0.1); color: var(--primary); }
                .pill-prep { background: #FEF3C7; color: #D97706; }
                .pill-assigned { background: #DBEAFE; color: #1D4ED8; }
                .pill-completed { background: #D1FAE5; color: #059669; }
                .pill-canceled { background: #FEE2E2; color: #DC2626; }
                .action-btn { flex: 1; color: white; border: none; padding: 14px; border-radius: 12px; font-size: 14px; font-weight: 800; display: flex; justify-content: center; align-items: center; gap: 8px; cursor: pointer; transition: 0.2s; }
                .action-btn:active { transform: scale(0.96); }
                .btn-primary { background: var(--primary); }
                .btn-secondary { background: #1E293B; }
                .btn-success { background: var(--success); }
                .btn-danger { background: #FEE2E2; color: #DC2626; }
                .btn-outline { background: #F8FAFC; color: #475569; border: 1px solid #E2E8F0; }
                .btn-edit { background: #FEF3C7; color: #D97706; border: 1px solid #FDE68A; }
                .whatsapp-btn { background: #25D366; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; justify-content: center; align-items: center; text-decoration: none; font-size: 18px; box-shadow: 0 4px 10px rgba(37, 211, 102, 0.3); }
            </style>
            <div id="ops-container" style="max-width: 700px; margin: 0 auto;">
                <input type="text" id="searchInput" class="search-bar" placeholder="🔍 البحث برقم الطلب، أو هاتف واسم العميل..." oninput="handleSearchInput(this.value)">
                <div id="tabs-wrapper" class="tabs-container"></div>
                <div id="orders-list"></div>
            </div>
        `;
        document.getElementById('searchInput').value = window.opsState.search;
    }

    if (!window.opsState.realtimeInitialized && window.supabaseClient) {
        window.supabaseClient.channel('ops-channel').on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, payload => {
            if (payload.eventType === 'INSERT') window.playAlertSound();
            fetchAndRenderData();
        }).subscribe();
        window.opsState.realtimeInitialized = true;
    }

    if(!window.timerIntervalStarted){
        setInterval(() => renderOrderCards(), 60000);
        window.timerIntervalStarted = true;
    }

    fetchAndRenderData();
};

async function fetchAndRenderData() {
    try {
        const { data, error } = await window.supabaseClient.from('orders').select('*').order('created_at', { ascending: false });
        if (error) throw error;
        
        window.opsState.orders = data || [];
        renderTabsAndList();
    } catch (error) {
        document.getElementById('orders-list').innerHTML = `<p style="color:red; text-align:center;">خطأ: ${error.message}</p>`;
    }
}

function renderTabsAndList() {
    const orders = window.opsState.orders;
    
    const cAll = orders.length;
    const cNew = orders.filter(o => o.status === 'new' || !o.status).length;
    const cPrep = orders.filter(o => o.status === 'processing').length;
    const cAssigned = orders.filter(o => o.status === 'delivering').length;
    const cComp = orders.filter(o => o.status === 'completed').length;
    const cCanc = orders.filter(o => o.status === 'canceled').length;

    const sidebarBadge = document.getElementById('newOrdersCount');
    if (sidebarBadge) sidebarBadge.innerText = cNew;

    document.getElementById('tabs-wrapper').innerHTML = `
        <button class="tab-btn ${window.opsState.tab === 'all' ? 'active' : ''}" onclick="switchTab('all')">الكل (${cAll})</button>
        <button class="tab-btn ${window.opsState.tab === 'new' ? 'active' : ''}" onclick="switchTab('new')">جديدة (${cNew})</button>
        <button class="tab-btn ${window.opsState.tab === 'processing' ? 'active' : ''}" onclick="switchTab('processing')">تجهيز بالمطعم (${cPrep})</button>
        <button class="tab-btn ${window.opsState.tab === 'delivering' ? 'active' : ''}" onclick="switchTab('delivering')">مع الكابتن (${cAssigned})</button>
        <button class="tab-btn ${window.opsState.tab === 'completed' ? 'active' : ''}" onclick="switchTab('completed')">مكتملة (${cComp})</button>
        <button class="tab-btn ${window.opsState.tab === 'canceled' ? 'active' : ''}" onclick="switchTab('canceled')">ملغية (${cCanc})</button>
    `;

    renderOrderCards();
}

function renderOrderCards() {
    const listDiv = document.getElementById('orders-list');
    if(!listDiv) return;

    const searchStr = window.opsState.search;
    
    let filtered = window.opsState.orders.filter(o => {
        const status = o.status || 'new';
        let tabMatch = (window.opsState.tab === 'all') || 
                       (window.opsState.tab === 'new' && status === 'new') ||
                       (window.opsState.tab === 'processing' && status === 'processing') ||
                       (window.opsState.tab === 'delivering' && status === 'delivering') ||
                       (window.opsState.tab === 'completed' && status === 'completed') ||
                       (window.opsState.tab === 'canceled' && status === 'canceled');
                       
        let textMatch = true;
        if (searchStr) {
             const t = `${o.id} ${o.customer_name} ${o.name} ${o.customer_phone} ${o.phone}`.toLowerCase();
             textMatch = t.includes(searchStr);
        }
        return tabMatch && textMatch;
    });

    if (filtered.length === 0) {
         listDiv.innerHTML = `<div style="text-align:center; padding:50px; color:var(--text-gray);"><i class="fa-solid fa-box-open fa-3x" style="opacity:0.3; margin-bottom:15px;"></i><h3>لا توجد طلبات مطابقة</h3></div>`;
         return;
    }

    let html = '';
    filtered.forEach(order => {
        const cName = order.customer_name || order.name || 'عميل غير مسجل';
        const cPhone = order.customer_phone || order.phone || '000';
        
        const total = order.total_amount || order.total_price || order.price || order.total || '0';
        
        let itemsCount = 0;
        let detailsObj = order.order_items;
        if (typeof detailsObj === 'string') {
            try { detailsObj = JSON.parse(detailsObj.replace(/,\s*([\]}])/g, '$1')); } catch(e) {}
        }
        if (Array.isArray(detailsObj)) {
            itemsCount = detailsObj.length;
        } else {
            itemsCount = order.items_count || order.items || '0';
        }

        const id = order.id;
        const shortId = id.toString().substring(0, 6).toUpperCase();
        const status = order.status || 'new';
        const timeStr = getTimeElapsedHTML(order.created_at);
        
        let cleanPhone = cPhone.replace(/\D/g, '');
        if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
        if (cleanPhone.length > 0 && !cleanPhone.startsWith('967')) {
            cleanPhone = '967' + cleanPhone;
        }
        const waLink = `https://api.whatsapp.com/send?phone=${cleanPhone}`;
        
        let statusText, statusClass, actionUI;

        if (status === 'new') {
            statusText = 'طلب جديد'; statusClass = 'pill-new';
            actionUI = `
                <button class="action-btn btn-primary" onclick="updateOrderStatus('${id}', 'processing')"><i class="fa-solid fa-fire-burner"></i> توجيه للمطعم</button>
                <button class="action-btn btn-danger" style="flex: 0.3;" onclick="updateOrderStatus('${id}', 'canceled')" title="إلغاء"><i class="fa-solid fa-xmark"></i></button>`;
        } 
        else if (status === 'processing') {
            statusText = 'قيد التجهيز'; statusClass = 'pill-prep';
            // 🟢 التغيير الجوهري هنا: استدعاء الدالة المستقلة الجديدة
            actionUI = `
                <button class="action-btn btn-secondary" onclick="openDispatchModal('${id}')"><i class="fa-solid fa-motorcycle"></i> إسناد لكابتن التوصيل</button>`;
        } 
        else if (status === 'delivering') {
            statusText = 'مع الكابتن (في الطريق)'; statusClass = 'pill-assigned';
            const driverBadge = order.driver_name ? `(${order.driver_name})` : '';
            actionUI = `<button class="action-btn btn-success" onclick="updateOrderStatus('${id}', 'completed')"><i class="fa-solid fa-flag-checkered"></i> إقفال ${driverBadge}</button>`;
        } 
        else {
            statusText = status === 'completed' ? 'مكتمل' : 'ملغي'; 
            statusClass = status === 'completed' ? 'pill-completed' : 'pill-canceled';
            actionUI = `<div style="width:100%; text-align:center; padding:12px; border-radius:12px; font-weight:800; background:#F8FAFC; color:#64748B;">الطلب مغلق</div>`;
        }

        html += `
            <div class="delivery-card">
                <div style="display:flex; justify-content:space-between; margin-bottom:15px; border-bottom:1px dashed #E2E8F0; padding-bottom:12px;">
                    <div style="font-size:18px; font-weight:900;">#${shortId} <span style="font-weight:normal; margin-right:10px;">${timeStr}</span></div>
                    <div class="status-pill ${statusClass}">${statusText}</div>
                </div>
                
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <div style="display:flex; gap:12px; align-items:center;">
                        <div style="width:40px; height:40px; background:rgba(242,92,5,0.05); color:var(--primary); border-radius:10px; display:flex; justify-content:center; align-items:center; font-size:18px;"><i class="fa-solid fa-user"></i></div>
                        <div>
                            <div style="font-weight:800; font-size:15px;">${cName}</div>
                            <div style="font-size:13.5px; color:#64748B;" dir="ltr">${cPhone}</div>
                        </div>
                    </div>
                    <a href="${waLink}" target="_blank" class="whatsapp-btn"><i class="fa-brands fa-whatsapp"></i></a>
                </div>

                <div style="background:#F8FAFC; border-radius:10px; padding:12px 16px; display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <div style="color:#64748B; font-weight:700; font-size:14px;">${itemsCount > 0 ? itemsCount + ' أصناف' : ''}</div>
                    <div style="color:#059669; font-weight:900; font-size:18px;">${total} ر.ي</div>
                </div>
                
                <div style="display:flex; gap:10px;">
                    ${actionUI}
                    <button class="action-btn btn-edit" style="flex: 0.3;" onclick="openEditModal('${id}')" title="تعديل شامل للطلب"><i class="fa-solid fa-pen-to-square"></i></button>
                    <button class="action-btn btn-outline" style="flex: 0.3;" onclick="openOrderDetails('${id}')" title="التفاصيل الفاتورة"><i class="fa-solid fa-file-invoice"></i></button>
                </div>
            </div>
        `;
    });
    
    listDiv.innerHTML = html;
}
