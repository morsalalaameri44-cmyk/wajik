// ب. جلب منتجات/أصناف المتجر من جدول products
const { data: products, error: prodError } = await supabaseClient
    .from('products') 
    .select('*')
    .eq('store_id', storeId);

const menuList = document.getElementById('menuList');
const categoriesTabs = document.querySelector('.categories-tabs');

// تفريغ القوائم للبدء من جديد
menuList.innerHTML = '';
categoriesTabs.innerHTML = ''; 

if(prodError) throw prodError;

if (products && products.length > 0) {
    
    // 1. خوارزمية تجميع المنتجات حسب الصنف (مقبلات، عصائر، الخ)
    // نفترض أن لديك عمود في قاعدة البيانات باسم 'category' لتصنيف المنتج
    const groupedProducts = products.reduce((groups, product) => {
        const catName = product.category || 'أصناف متنوعة';
        if (!groups[catName]) {
            groups[catName] = [];
        }
        groups[catName].push(product);
        return groups;
    }, {});

    let isFirstTab = true;

    // 2. بناء الأقسام والتبويبات العلوية ديناميكياً
    for (const [categoryName, categoryProducts] of Object.entries(groupedProducts)) {
        
        // أ. إنشاء التبويب العلوي (Pill) لهذا الصنف
        const tab = document.createElement('div');
        tab.className = `cat-tab ${isFirstTab ? 'active' : ''}`;
        tab.innerText = categoryName;
        // حركة ذكية للتمرير عند النقر على التبويب
        tab.onclick = () => {
            document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(`section-${categoryName}`).scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
        categoriesTabs.appendChild(tab);
        isFirstTab = false;

        // ب. إنشاء قسم (Section) داخل القائمة يحتوي على عنوان الصنف
        const sectionContainer = document.createElement('div');
        sectionContainer.id = `section-${categoryName}`; // آيدي فريد للربط مع التبويب
        sectionContainer.style.paddingTop = '20px'; // مسافة تنفس

        const sectionTitle = document.createElement('h2');
        sectionTitle.className = 'menu-title';
        sectionTitle.innerText = categoryName;
        sectionContainer.appendChild(sectionTitle);

        // ج. إضافة المنتجات تحت هذا القسم
        categoryProducts.forEach((product, index) => {
            const prodName = product.name || 'منتج غير مسمى';
            const prodDesc = product.description || '';
            const prodPrice = product.price ? product.price.toLocaleString() : '0';
            const prodImg = product.image_url || 'https://via.placeholder.com/150?text=لا+توجد+صورة';

            const card = document.createElement('div');
            card.className = 'product-card';
            
            // تصميم كرت المنتج
            card.innerHTML = `
                <img src="${prodImg}" alt="${prodName}" class="product-img">
                <div class="product-info">
                    <h3>${prodName}</h3>
                    ${prodDesc ? `<p>${prodDesc}</p>` : ''}
                    <div class="product-bottom">
                        <span class="product-price">${prodPrice} ر.ي</span>
                        <button class="add-btn" onclick="addToCart(this, ${product.price || 0})"><i class="fa-solid fa-plus"></i></button>
                    </div>
                </div>
            `;
            sectionContainer.appendChild(card);
        });

        // د. إضافة القسم بالكامل إلى القائمة الرئيسية
        menuList.appendChild(sectionContainer);
    }

} else {
    menuList.innerHTML = `
        <div class="loading-state">
            <i class="fa-solid fa-box-open" style="color:#CCC;"></i>
            <p style="font-weight:700; font-size:16px;">لا توجد أصناف مضافة في هذا المتجر حالياً.</p>
        </div>`;
}
