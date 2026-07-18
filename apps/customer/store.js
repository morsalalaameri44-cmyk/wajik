// 1. إعداد الاتصال بقاعدة البيانات
const supabaseUrl = 'https://ldefaxirgruqulxhkaqh.supabase.co';
// 🛑 ضع المفتاح الخاص بك هنا
const supabaseKey = 'sb_publishable_Gsn2xn5DjAJehY0SGFubzw_KxV-hG-4';
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// --- 🛒 نظام سلة المشتريات المطور ---
let cartCount = 0; 
let cartTotal = 0; 
let cartItems = []; // 📦 مصفوفة (قائمة) لحفظ أسماء الوجبات وأسعارها

// دالة إضافة الوجبة للسلة (الآن تأخذ الاسم والسعر معاً)
window.addToCart = function(name, price) {
    cartCount += 1;
    cartTotal += price;
    
    // تسجيل الوجبة في القائمة
    cartItems.push({ name: name, price: price });
    
    // تحديث الشاشة
    document.getElementById('cartCountDisplay').innerText = cartCount;
    document.getElementById('cartTotalDisplay').innerText = cartTotal + ' ر.ي';
    
    // حفظ السلة في ذاكرة المتصفح لننقلها لصفحة الدفع لاحقاً
    localStorage.setItem('wajik_cart', JSON.stringify(cartItems));
    localStorage.setItem('wajik_total', cartTotal);
    
    const cartElement = document.getElementById('floatingCart');
    if (cartCount > 0) {
        cartElement.style.display = 'flex';
    }
};
// ------------------------------------

// 2. دالة جلب وعرض بيانات المطعم والوجبات
async function loadStoreDetails() {
    const urlParams = new URLSearchParams(window.location.search);
    const storeId = urlParams.get('id');

    if (!storeId) {
        alert('لم يتم تحديد المطعم!');
        window.location.href = 'home.html';
        return;
    }

    // تنظيف السلة القديمة عند فتح مطعم جديد
    localStorage.removeItem('wajik_cart');
    localStorage.removeItem('wajik_total');

    // جلب بيانات المطعم
    const { data: storeData, error: storeError } = await supabaseClient
        .from('stores')
        .select('*')
        .eq('id', storeId)
        .single(); 

    if (storeError || !storeData) {
        document.getElementById('storeNameDisplay').innerText = 'حدث خطأ';
        return;
    }

    document.getElementById('storeNameDisplay').innerText = storeData.name || storeData.store_name || 'متجر غير مسمى';
    document.getElementById('storeCategoryDisplay').innerText = `قسم ${storeData.category || 'عام'} - توصيل داخل عدن`;
    
    // جلب الوجبات
    const menuList = document.getElementById('menuList');
    
    const { data: products, error: productsError } = await supabaseClient
        .from('products')
        .select('*')
        .eq('store_id', storeId);

    if (productsError) {
        menuList.innerHTML = '<h2 class="menu-title">الأطباق الرئيسية</h2><p style="text-align:center; color:red;">عذراً، حدث خطأ.</p>';
        return;
    }

    menuList.innerHTML = '<h2 class="menu-title">الأطباق الرئيسية</h2>';

    if (products.length === 0) {
        menuList.innerHTML += '<p style="text-align:center; color:var(--text-gray); padding: 20px;">لا توجد وجبات مضافة.</p>';
        return;
    }

    // رسم الوجبات
    products.forEach(product => {
        const productName = product.name || 'وجبة غير مسماة';
        const productDesc = product.description || '';
        const productPrice = product.price || 0;

        // 🟢 التعديل الأهم هنا: نرسل اسم الوجبة بين علامتي تنصيص لكي يتعرف عليها الكود
        const productCard = `
        <div class="menu-item">
            <div class="item-info">
                <h3>${productName}</h3>
                <p>${productDesc}</p>
                <div class="item-price">${productPrice} ر.ي</div>
            </div>
            <button class="add-btn" onclick="addToCart('${productName}', ${productPrice})"><i class="fa-solid fa-plus"></i></button>
        </div>
        `;
        menuList.innerHTML += productCard;
    });
}

document.addEventListener('DOMContentLoaded', loadStoreDetails);
