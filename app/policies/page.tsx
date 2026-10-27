"use client";

import Link from "next/link";

const sectionStyle: React.CSSProperties = { background: "#fff", border: "1px solid #e5e0d8", padding: 20, marginBottom: 14, lineHeight: 2 };

export default function PoliciesPage() {
  return <main dir="rtl" style={{ minHeight: "100vh", background: "#f5f2ec", color: "#171717", padding: "24px 5%", fontFamily: "Cairo, Arial, sans-serif" }}>
    <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
      <Link href="/" style={{ fontSize: 26, fontWeight: 900 }}>STEP<span style={{ color: "#ff6a1a" }}>UP</span></Link>
      <Link href="/products" style={{ textDecoration: "underline" }}>العودة للتسوق</Link>
    </header>
    <h1 style={{ fontSize: "clamp(28px,5vw,42px)" }}>سياسات STEPUP</h1>
    <p style={{ color: "#666", lineHeight: 1.9 }}>بنوضح هنا طريقة التوصيل والتواصل وحقوقك قبل الشراء. لازم تتأكد من تفاصيل الطلب معانا قبل ما نبدأ التوصيل.</p>
    <section style={sectionStyle}><h2>1. التوصيل وتكلفته</h2><p>التوصيل حاليًا عن طريق STEPUP مباشرة باستخدام الموتوسيكل، حسب المنطقة وإمكانية الوصول والعنوان. مفيش رسوم توصيل موحدة مضافة تلقائيًا. بعد استلام العنوان، هنتواصل معاك ونوضح تكلفة التوصيل والموعد المتوقع قبل اعتماد الطلب النهائي. لو التكلفة أو الموعد مش مناسبين، تقدر ترفض تأكيد الطلب.</p></section>
    <section style={sectionStyle}><h2>2. تأكيد الطلب وتوفر المنتج</h2><p>تسجيل الطلب على الموقع هو طلب مبدئي، مش تأكيد نهائي لتوفر كل لون ومقاس أو لموعد التوصيل. بنتواصل معاك لمراجعة الموديل والمقاس واللون والعنوان وتكلفة التوصيل قبل التجهيز.</p></section>
    <section style={sectionStyle}><h2>3. الاستبدال والاسترجاع</h2><p>لو محتاج استبدال أو استرجاع، تواصل معانا على واتساب قبل الاستخدام واحتفظ بالحذاء والتغليف بحالتهم قدر الإمكان. بنراجع حالة المنتج وسبب الطلب ونوضح لك الخيارات والتكاليف المتوقعة قبل الاتفاق. لازم يحدد صاحب المتجر هنا المدة والشروط النهائية بوضوح قبل بدء البيع؛ النص الحالي لا يغني عن مراجعة الالتزامات القانونية المعمول بها في مصر.</p></section>
    <section style={sectionStyle}><h2>4. الخصوصية واستخدام البيانات</h2><p>بنستخدم بيانات الاسم ورقم الهاتف والعنوان لتسجيل الطلب والتواصل بخصوصه. بيانات العروض التسويقية تُجمع بشكل اختياري بموافقتك. ما تدخلش بيانات دفع حساسة في خانة الملاحظات. للاستفسار عن بياناتك أو طلب عدم استقبال عروض، تواصل معانا على واتساب.</p></section>
    <section style={sectionStyle}><h2>5. التواصل</h2><p>واتساب: <a href="https://wa.me/201155676181" style={{ color: "#176b39", textDecoration: "underline" }}>01055676181</a></p><p>بنأكد تفاصيل كل طلب بشكل مباشر قبل التسليم.</p></section>
    <footer style={{ padding: 16, textAlign: "center", color: "#777" }}>STEPUP · Move With Confidence</footer>
  </main>;
}
