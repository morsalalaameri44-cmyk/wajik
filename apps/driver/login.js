// افتراض أنك قمت بتهيئة supabase مسبقاً في الملف
// const supabase = supabase.createClient('URL', 'KEY');

async function handleDriverLogin(event) {
    // منع إعادة تحميل الصفحة عند الضغط على زر الإرسال
    event.preventDefault(); 
    
    // تغيير حالة الزر لـ "جاري التحقق..." لمنع الضغط المتكرر
    const submitBtn = document.getElementById('login-btn'); // عدل المعرف إذا لزم الأمر
    const originalBtnText = submitBtn.innerText;
    submitBtn.innerText = 'جاري التحقق...';
    submitBtn.disabled = true;

    // الحصول على القيم من حقول الإدخال
    const email = document.getElementById('email-input').value.trim(); // عدل المعرفات
    const password = document.getElementById('password-input').value;

    try {
        // الاتصال بـ Supabase لمصادقة المستخدم
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (error) {
            // معالجة الخطأ (مثل "Invalid login credentials" الذي ظهر لك)
            console.error('خطأ في تسجيل الدخول:', error.message);
            
            // هنا يمكنك تحديث واجهة المستخدم لإظهار الخطأ (استبدل الدالة حسب طريقتك في إظهار الرسائل)
            alert("فشل تسجيل الدخول: البريد الإلكتروني أو كلمة المرور غير صحيحة."); 
            
        } else if (data.session) {
             console.log('تم تسجيل الدخول بنجاح!', data.user);
            
            // التحقق مما إذا كان المستخدم فعلاً موصلاً (اختياري، يفضل تخزين دور المستخدم في قاعدة البيانات)
            // const { data: driverData } = await supabase.from('drivers').select('*').eq('id', data.user.id).single();

            // إعادة التوجيه إلى صفحة الموصل الرئيسية
            window.location.href = 'driver-dashboard.html'; // استبدل بالمسار الصحيح
        }
        
    } catch (unexpectedError) {
         console.error('حدث خطأ غير متوقع:', unexpectedError);
         alert("حدث خطأ في الاتصال. يرجى المحاولة لاحقاً.");
    } finally {
        // إعادة الزر لحالته الطبيعية
        submitBtn.innerText = originalBtnText;
        submitBtn.disabled = false;
    }
}

// ربط الدالة بالنموذج (Form)
// تأكد من أن الـ form في ملف HTML يحمل id='login-form' أو عدل الكود ليناسب واجهتك
document.getElementById('login-form').addEventListener('submit', handleDriverLogin);
