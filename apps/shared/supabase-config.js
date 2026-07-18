الملف الثاني :
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm'

// رابط مشروعك
const supabaseUrl = 'https://ldefaxirgruqulxhkaqh.supabase.co'

// مفتاحك القابل للنشر فقط
const supabaseKey = 'sb_publishable_Gsn2xn5DjAJehY0SGFubzw_KxV-hG-4'

// تصدير الاتصال لاستخدامه في باقي التطبيقات
export const supabase = createClient(supabaseUrl, supabaseKey)