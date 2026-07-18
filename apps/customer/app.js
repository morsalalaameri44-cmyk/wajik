// 1. إعداد الاتصال بقاعدة البيانات مباشرة (مكتبة supabase أصبحت متوفرة من الـ HTML)
const supabaseUrl = 'https://ldefaxirgruqulxhkaqh.supabase.co';
const supabaseKey = 'sb_publishable_Gsn2xn5DjAJehY0SGFubzw_KxV-hG-4'; // <-- ضع المفتاح القابل للنشر speed_go_1 هنا
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// 2. ربط العناصر الموجودة في شاشة HTML
const registerBtn = document.getElementById('registerBtn');
const nameInput = document.getElementById('userName');
const phoneInput = document.getElementById('userPhone');

// 3. أمر الزر عند الضغط عليه
registerBtn.addEventListener('click', async () => {
    
    // جلب النصوص وإزالة المسافات الزائدة
    const nameValue = nameInput.value.trim();
    const phoneValue = phoneInput.value.trim();

    // التحقق من الحقول الفارغة (الآن ستظهر الرسالة بشكل صحيح)
    if (!nameValue || !phoneValue) {
        alert('يرجى إدخال اسمك ورقم جوالك لتتمكن من البدء!');
        return; 
    }

    // تغيير حالة الزر أثناء التحميل
    const originalText = registerBtn.textContent;
    registerBtn.textContent = 'جاري التسجيل...';
    registerBtn.disabled = true;

    // 4. إرسال البيانات الفعلية إلى قاعدة بيانات Supabase (جدول users)
    const { data, error } = await supabaseClient
        .from('users') 
        .insert([
            { 
                full_name: nameValue, 
                phone: phoneValue, 
                role: 'customer' 
            }
        ]);

    // 5. التحقق من النتيجة
    if (error) {
        console.error('تفاصيل الخطأ:', error);
        alert('عذراً، حدث خطأ أثناء التسجيل. تأكد من اتصالك بالإنترنت.');
        
        // إعادة الزر لحالته الطبيعية
        registerBtn.textContent = originalText;
        registerBtn.disabled = false;
    } else {
        alert('تم التسجيل بنجاح في قاعدة البيانات!');
        // توجيه العميل للصفحة الرئيسية
        window.location.href = 'home.html';
    }
});
