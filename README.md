# STEPUP — Online Shoe Store

واجهة متجر أحذية STEPUP باللغة العربية، مع كتالوج المنتجات ونموذج طلب عبر واتساب للدفع عند الاستلام.

## إعداد Supabase وVercel

من إعدادات مشروع Supabase افتح **Project Settings → API** وانسخ:

- **Project URL**
- **Publishable key** أو **anon/public key** (حسب ما يظهر في لوحة التحكم)

في Vercel افتح مشروع STEPUP ثم **Settings → Environment Variables** وأضف المتغيرين التاليين لكل بيئات التشغيل المطلوبة (Production وPreview):

- `NEXT_PUBLIC_SUPABASE_URL` = رابط مشروع Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = المفتاح العام/anon الخاص بالمشروع

ثم افتح **Deployments** وأعد نشر آخر إصدار. لا تضع أبدًا `service_role` أو أي مفتاح سري داخل هذا المستودع أو أي متغير يبدأ بـ `NEXT_PUBLIC_`.

## تشغيل محلي

1. انسخ `.env.example` إلى `.env.local`.
2. املأ قيم Supabase الحقيقية في `.env.local`.
3. شغّل `npm install` ثم `npm run dev`.

## ملاحظات

- يجب أن تكون سياسات RLS في Supabase مضبوطة قبل إتاحة البيانات من المتصفح.
- الطلبات الحالية تُجهَّز للإرسال عبر واتساب ولا تُحفظ تلقائيًا في جدول `orders` بعد؛ ربط حفظ الطلبات والمخزون يحتاج مطابقة أعمدة الجداول وسياسات الإدخال الفعلية في Supabase.
- لا يوجد حاليًا ربط بوابة دفع إلكتروني؛ طريقة الطلب الحالية هي الدفع عند الاستلام.
