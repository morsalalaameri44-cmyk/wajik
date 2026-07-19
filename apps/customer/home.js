// 1. إعداد الاتصال بقاعدة البيانات
const supabaseUrl = 'https://ldefaxirgruqulxhkaqh.supabase.co';
const supabaseKey = 'sb_publishable_Gsn2xn5DjAJehY0SGFubzw_KxV-hG-4'; 
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

// 🌟 دالة الانطلاق السينمائية (1 ثانية لكل حركة)
window.openCategoryTransition = function(element) {
    if (element.classList.contains('is-animating')) return;
    element.classList.add('is-animating');

    const categoryName = element.getAttribute('data-category');
    const imgEl = element.querySelector('.category-img');
    const imgSrc = imgEl ? imgEl.src : '';
    
    // سحب لون الخلفية لنقله للباب في الواجهة الثانية
    const computedStyle = window.getComputedStyle(element);
    const bgGradient = computedStyle.backgroundImage;

    // الحركة 1: الارتجاج لمدة (1 ثانية)
    element.style.animation = "shakeOneSecond 1s ease-in-out";

    setTimeout(() => {
        element.style.animation = ""; // إيقاف الارتجاج

        // الحركة 2: إخفاء جميع الأيقونات الأخرى (تلاشي 1 ثانية)
        document.querySelectorAll('.category-item').forEach(c => {
            if (c !== element) {
                c.style.transition = "opacity 1s ease";
                c.style.opacity = "0";
            }
        });

        // صناعة "نسخة" من الأيقونة للتحرك بحرية نحو المنتصف
        const rect = element.getBoundingClientRect();
        const clone = element.cloneNode(true);
        clone.style.position = "fixed";
        clone.style.top = rect.top + "px";
        clone.style.left = rect.left + "px";
        clone.style.width = rect.width + "px";
        clone.style.height = rect.height + "px";
        clone.style.margin = "0";
        clone.style.zIndex = "9999";
        clone.style.backgroundImage = bgGradient; // تثبيت لون الخلفية المنسوخ
        clone.style.transition = "all 1s ease-in-out"; // مدة الحركة 1 ثانية
        
        document.body.appendChild(clone);
        element.style.opacity = "0"; // إخفاء الأيقونة الأصلية

        // حساب مركز الشاشة لتنتقل إليه النسخة
        const centerX = window.innerWidth / 2;
        const centerY = window.innerHeight / 2;
        const moveX = centerX - (rect.left + rect.width / 2);
        const moveY = centerY - (rect.top + rect.height / 2);

        // تنفيذ التكبير والتمركز (1 ثانية)
        requestAnimationFrame(() => {
            clone.style.transform = `translate(${moveX}px, ${moveY}px) scale(2.2)`;
        });

        // الحركة 3: الانتقال للواجهة الجديدة بعد انتهاء التكبير (1 ثانية)
        setTimeout(() => {
            // نرسل الاسم والصورة واللون للواجهة الجديدة
            window.location.href = `category_stores.html?category=${encodeURIComponent(categoryName)}&img=${encodeURIComponent(imgSrc)}&bg=${encodeURIComponent(bgGradient)}`;
        }, 1000);

    }, 1000); // الانتظار حتى تنتهي حركة الارتجاج
};

// 2. دالة جلب الأقسام وعرضها مرتبة في الواجهة
async function fetchAndDisplayCategories() {
    try {
        const { data: categories, error } = await supabaseClient
            .from('categories')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) throw error;

        const container = document.getElementById('categoriesContainer');
        container.innerHTML = '';

        if (categories && categories.length > 0) {
            categories.forEach(category => {
                const cleanCatName = category.name.trim(); 
                
                // إضافة onclick لربط الحركة بالأيقونة
                const categoryHTML = `
                    <div class="category-item" data-category="${cleanCatName}" onclick="openCategoryTransition(this)" style="position: relative; display: flex; justify-content: center;">
                        <img class="category-img" src="${category.image_url}" alt="${cleanCatName}" onerror="this.src='https://via.placeholder.com/150?text=قسم'" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; object-fit: cover; border-radius: 20px; z-index: 1;">
                        <p class="category-title" style="position: absolute; bottom: 10px; z-index: 2; width: 90%; background-color: rgba(255, 255, 255, 0.95); backdrop-filter: blur(5px); -webkit-backdrop-filter: blur(5px); color: #1A1A1A; font-size: 13px; font-weight: 800; text-align: center; padding: 6px 4px; border-radius: 12px; box-shadow: 0 4px 10px rgba(0,0,0,0.15); margin: 0; white-space: normal; line-height: 1.4;">${cleanCatName}</p>
                    </div>
                `;
                container.insertAdjacentHTML('beforeend', categoryHTML);
            });
        }
    } catch (error) {
        console.error('حدث خطأ أثناء جلب الأقسام:', error.message);
    }
}

// 3. جلب المتاجر من قاعدة البيانات
async function loadStores(categoryName = 'الكل', searchQuery = '') {
    const storesList = document.getElementById('storesList');
    const cleanCategoryName = categoryName.trim();
    
    storesList.innerHTML = `
        <div style="text-align:center; padding:40px 10px; color:var(--text-gray);">
            <i class="fa-solid fa-spinner fa-spin" style="font-size:30px; margin-bottom:10px; color:var(--primary);"></i>
            <p style="font-weight:700;">جاري جلب المتاجر...</p>
        </div>`;

    let query = supabaseClient.from('stores').select('*');
    if (cleanCategoryName !== 'الكل') query = query.ilike('category', `%${cleanCategoryName}%`);

    const { data, error } = await query;

    if (error) {
        storesList.innerHTML = `<p style="text-align:center;color:red;">خطأ في جلب البيانات.</p>`;
        return;
    }

    let finalData = data;
    if (searchQuery !== '') {
        const cleanSearch = searchQuery.trim().toLowerCase();
        finalData = data.filter(store => 
            (store.name && store.name.toLowerCase().includes(cleanSearch)) || 
            (store.store_name && store.store_name.toLowerCase().includes(cleanSearch))
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

    finalData.forEach(store => {
        const storeName = store.name || store.store_name || 'متجر غير مسمى';
        const storeCategory = store.category || 'عام';
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

// 4. جعل جميع عناصر الواجهة تعمل بصورة تفاعلية
function setupInterfaceInteractions() {
    document.getElementById('viewAllCategoriesBtn').addEventListener('click', () => {
        window.location.href = 'category_stores.html?category=الكل';
    });

    document.getElementById('locationBtn').addEventListener('click', () => {
        alert('ستفتح خريطة تحديد موقع التوصيل في التحديث القادم!');
    });

    document.getElementById('notificationBtn').addEventListener('click', () => {
        alert('لا توجد إشعارات جديدة حالياً، طلباتك كلها تمام!');
    });

    document.getElementById('bannerBtn1').addEventListener('click', () => {
        window.location.href = 'category_stores.html?category=' + encodeURIComponent('سوبر ماركت');
    });

    document.getElementById('bannerBtn2').addEventListener('click', () => {
        window.location.href = 'category_stores.html?category=' + encodeURIComponent('صيدليات');
    });
}

// 5. تفعيل الأوامر عند تشغيل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayCategories();
    loadStores('الكل');
    setupInterfaceInteractions();

    const searchInput = document.getElementById('searchInput');
    searchInput.addEventListener('keyup', () => {
        loadStores('الكل', searchInput.value);
    });
});
