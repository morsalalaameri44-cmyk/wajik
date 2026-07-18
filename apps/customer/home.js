// 1. إعداد الاتصال بقاعدة البيانات
const supabaseUrl = 'https://ldefaxirgruqulxhkaqh.supabase.co';
const supabaseKey = 'sb_publishable_Gsn2xn5DjAJehY0SGFubzw_KxV-hG-4'; // 🛑 تذكر وضع مفتاحك هنا
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// 2. جلب المتاجر من قاعدة البيانات
async function loadStores(categoryName = 'الكل', searchQuery = '') {
    const storesList = document.getElementById('storesList');
    
    storesList.innerHTML = `
        <div style="text-align:center; padding:40px 10px; color:var(--text-gray);">
            <i class="fa-solid fa-spinner fa-spin" style="font-size:30px; margin-bottom:10px; color:var(--primary);"></i>
            <p style="font-weight:700;">جاري جلب المتاجر...</p>
        </div>`;

    // بناء استعلام قاعدة البيانات
    let query = supabaseClient.from('stores').select('*');
    
    if (categoryName !== 'الكل') {
        query = query.eq('category', categoryName);
    }

    const { data, error } = await query;

    if (error) {
        storesList.innerHTML = `<p style="text-align:center;color:red;">خطأ في جلب البيانات.</p>`;
        return;
    }

    // تصفية نتائج البحث (إذا كان المستخدم يكتب في مربع البحث)
    let finalData = data;
    if (searchQuery !== '') {
        finalData = data.filter(store => 
            (store.name && store.name.includes(searchQuery)) || 
            (store.store_name && store.store_name.includes(searchQuery))
        );
    }

    storesList.innerHTML = '';

    if (finalData.length === 0) {
        storesList.innerHTML = `
            <div style="text-align:center; padding:40px 10px; color:var(--text-gray);">
                <i class="fa-solid fa-store-slash" style="font-size:40px; margin-bottom:10px; color:#CCC;"></i>
                <p style="font-weight:700;">لا توجد متاجر مطابقة حالياً!</p>
            </div>`;
        return;
    }

    // عرض المتاجر الحقيقية بنفس تصميمك الجميل
    finalData.forEach(store => {
        const storeName = store.name || store.store_name || 'متجر غير مسمى';
        const storeCategory = store.category || 'عام';
        // يمكنك لاحقاً حفظ روابط صور حقيقية في قاعدة البيانات
        const storeImage = 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=200&q=80'; 

        const card = document.createElement("a");
        card.className = "store-card";
        card.href = `store.html?id=${store.id}`; // لتمرير رقم المتجر للصفحة القادمة
        
        card.innerHTML = `
            <div class="store-img-wrapper" style="background-image: url('${storeImage}');"></div>
            <div class="store-info">
                <h4>${storeName}</h4>
                <p class="store-tags">${storeCategory}</p>
                <div class="store-meta">
                    <div class="meta-item rating"><i class="fa-solid fa-star"></i> 4.5</div>
                    <div class="meta-item time"><i class="fa-solid fa-clock"></i> 30 دقيقة</div>
                    <div class="meta-item delivery"><i class="fa-solid fa-truck"></i> توصيل سريع</div>
                </div>
            </div>
        `;
        storesList.appendChild(card);
    });
}

// 3. تفعيل الأزرار والبحث عند تشغيل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    
    // تحميل المتاجر الافتراضية
    loadStores('الكل');

    // تفعيل أزرار الأقسام
    const categoryCards = document.querySelectorAll('.category-item');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            // قراءة القسم المختار من خاصية data-category
            const selectedCategory = card.getAttribute('data-category');
            
            // مسح مربع البحث عند تغيير القسم
            document.getElementById('searchInput').value = '';
            
            loadStores(selectedCategory);
        });
    });

    // تفعيل مربع البحث
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keyup', () => {
        const activeCategory = document.querySelector('.category-item.active').getAttribute('data-category');
        loadStores(activeCategory, searchInput.value);
    });
});
