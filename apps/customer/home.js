// 1. إعداد الاتصال بقاعدة البيانات
const supabaseUrl = 'https://ldefaxirgruqulxhkaqh.supabase.co';
const supabaseKey = 'sb_publishable_Gsn2xn5DjAJehY0SGFubzw_KxV-hG-4'; 
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// 2. دالة جلب الأقسام وعرضها في الواجهة بالتصميم الشبكي الجديد
async function fetchAndDisplayCategories() {
    try {
        const { data: categories, error } = await supabaseClient
            .from('categories')
            .select('*');

        if (error) throw error;

        const container = document.querySelector('.categories-container');
        
        // تفريغ الحاوية الحالية وإبقاء زر "الكل" بتصميم الشبكة (Grid) الجديد
        container.innerHTML = `
            <div class="category-item all-btn active" data-category="الكل">
                <i class="fa-solid fa-border-all"></i>
                <p class="category-title">الكل</p>
            </div>
        `;

        // المرور على الأقسام المجلوبة وإضافتها بالتصميم الجديد (صورة كاملة مع نص بخلفية زجاجية شفافة)
        if (categories && categories.length > 0) {
            categories.forEach(category => {
                const categoryHTML = `
                    <div class="category-item" data-category="${category.name}" style="position: relative; display: flex; justify-content: center;">
                        <img class="category-img" src="${category.image_url}" alt="${category.name}" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 18px; z-index: 1;">
                        <p class="category-title" style="position: absolute; bottom: 8px; z-index: 2; width: max-content; max-width: 90%; background-color: rgba(255, 255, 255, 0.75); backdrop-filter: blur(4px); -webkit-backdrop-filter: blur(4px); color: #1A1A1A; font-size: 11px; font-weight: 800; text-align: center; padding: 4px 12px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${category.name}</p>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', categoryHTML);
            });
        }

        // 🌟 خطوة هامة: تفعيل أزرار الأقسام "بعد" إضافتها للشاشة
        setupCategoryListeners();

    } catch (error) {
        console.error('حدث خطأ أثناء جلب الأقسام:', error.message);
    }
}

// 3. جلب المتاجر من قاعدة البيانات
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
        query = query.eq('category', categoryName); // تأكد أن لديك عمود اسمه 'category' في جدول stores
    }

    const { data, error } = await query;

    if (error) {
        storesList.innerHTML = `<p style="text-align:center;color:red;">خطأ في جلب البيانات.</p>`;
        return;
    }

    // تصفية نتائج البحث
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

    // عرض المتاجر
    finalData.forEach(store => {
        const storeName = store.name || store.store_name || 'متجر غير مسمى';
        const storeCategory = store.category || 'عام';
        
        // استخدام صورة المطعم من قاعدة البيانات (logo_url) إذا توفرت، وإلا استخدام الصورة الافتراضية
        const storeImage = store.logo_url || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=200&q=80'; 

        const card = document.createElement("a");
        card.className = "store-card";
        card.href = `store.html?id=${store.id}`; 
        
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

// 4. دالة تفعيل أزرار الأقسام (مفصولة ليتم استدعاؤها بعد الجلب مع إضافة الحركة البهلوانية)
function setupCategoryListeners() {
    const categoryCards = document.querySelectorAll('.category-item');
    categoryCards.forEach(card => {
        card.addEventListener('click', () => {
            // إضافة كلاس الحركة البهلوانية (الجيلي)
            card.classList.add('pop-anim');
            
            // إزالة كلاس الحركة بعد 0.4 ثانية (لتكون جاهزة للضغط مرة أخرى)
            setTimeout(() => {
                card.classList.remove('pop-anim');
            }, 400);

            // باقي الأوامر الخاصة بتغيير القسم المختار
            categoryCards.forEach(c => c.classList.remove('active'));
            card.classList.add('active');
            
            const selectedCategory = card.getAttribute('data-category');
            
            document.getElementById('searchInput').value = '';
            
            loadStores(selectedCategory);
        });
    });
}

// 5. تفعيل الأوامر عند تشغيل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    
    // جلب الأقسام الحقيقية من قاعدة البيانات
    fetchAndDisplayCategories();

    // جلب المتاجر الافتراضية
    loadStores('الكل');

    // تفعيل مربع البحث
    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keyup', () => {
        // البحث عن القسم النشط حالياً، وإذا لم يجده يفترض أنه "الكل"
        const activeCategoryItem = document.querySelector('.category-item.active');
        const activeCategory = activeCategoryItem ? activeCategoryItem.getAttribute('data-category') : 'الكل';
        
        loadStores(activeCategory, searchInput.value);
    });
});
