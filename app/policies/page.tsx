"use client";

import Link from "next/link";

const sectionStyle: React.CSSProperties = {
  background: "#fff",
  border: "1px solid #e5e0d8",
  borderRadius: 12,
  padding: 20,
  marginBottom: 14,
  lineHeight: 2,
};

export default function PoliciesPage() {
  return (
    <main dir="rtl" style={{ minHeight: "100vh", background: "#f5f2ec", color: "#171717", padding: "24px 5%", fontFamily: "Cairo, Arial, sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap", marginBottom: 28 }}>
        <Link href="/" style={{ fontSize: 26, fontWeight: 900, textDecoration: "none" }}>STEP<span style={{ color: "#ff6a1a" }}>UP</span></Link>
        <Link href="/products" style={{ textDecoration: "underline", color: "#171717" }}>العودة للتسوق</Link>
      </header>

      <p style={{ color: "#ff6a1a", fontWeight: 800, letterSpacing: 1 }}>STEPUP / CUSTOMER CARE</p>
      <h1 style={{ fontSize: "clamp(28px,5vw,42px)", marginBottom: 8 }}>الشحن والاستبدال والاسترجاع</h1>
      <p style={{ color: "#666", lineHeight: 1.9, maxWidth: 760 }}>
        هدفنا إن تجربة الشراء تكون واضحة من البداية. راجع التفاصيل التالية، ولو عندك أي سؤال تواصل معانا قبل تأكيد الطلب.
      </p>

      <section style={sectionStyle}>
        <h2 style={{ marginTop: 0 }}>1. التوصيل والشحن</h2>
        <ul style={{ paddingRight: 22 }}>
          <li>بعد تسجيل الطلب، هنتواصل معاك لتأكيد الموديل واللون والمقاس والعنوان وتوفر المنتج.</li>
          <li>تكلفة التوصيل وميعاده بيتحددوا حسب المنطقة والعنوان، وبنوضحهم لك قبل التأكيد النهائي.</li>
          <li>مش بنضيف رسوم شحن ثابتة تلقائيًا على إجمالي المنتجات في الموقع.</li>
          <li>لو تكلفة التوصيل أو الموعد مش مناسبين لك، تقدر ترفض تأكيد الطلب قبل تجهيزه.</li>
          <li>من فضلك تأكد إن رقم الموبايل والعنوان صحيحين، وخليك متاح على الهاتف لتنسيق التسليم.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={{ marginTop: 0 }}>2. تأكيد الطلب والدفع</h2>
        <ul style={{ paddingRight: 22 }}>
          <li>إرسال الطلب من الموقع هو طلب مبدئي؛ بنأكد معاك التوفر والتفاصيل وتكلفة التوصيل قبل التجهيز.</li>
          <li>الدفع المتاح حاليًا هو الدفع عند الاستلام، ما لم يتم إبلاغك بغير ذلك بوضوح قبل تأكيد الطلب.</li>
          <li>السعر المعروض هو سعر المنتجات، وتكلفة التوصيل — إن وجدت — بنوضحها بشكل منفصل قبل التأكيد.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={{ marginTop: 0 }}>3. الاستبدال والاسترجاع</h2>
        <p>
          تقدر تتواصل معانا لطلب استبدال المنتج أو استرجاعه، وهنراجع طلبك وفقًا لقانون حماية المستهلك المصري واللوائح المعمول بها.
        </p>
        <ul style={{ paddingRight: 22 }}>
          <li>لو المنتج به عيب أو وصل مختلف عن المواصفات المتفق عليها، تواصل معانا عشان نراجع المشكلة ونتخذ الإجراء المناسب وفقًا للقانون.</li>
          <li>لطلب الاستبدال أو الاسترجاع، ابعتلنا على واتساب رقم الطلب وتفاصيل المشكلة، واحتفظ بالمنتج وملحقاته والتغليف قدر الإمكان.</li>
          <li>أي تفاصيل خاصة بالشحن أو رد المبلغ هتتحدد بما يتفق مع القانون والحالة الفعلية للطلب.</li>
          <li>السياسة دي لا تنتقص من أي حقوق مقررة لك بموجب القانون.</li>
        </ul>
      </section>

      <section style={sectionStyle}>
        <h2 style={{ marginTop: 0 }}>4. الخصوصية وبيانات الطلب</h2>
        <p>
          بنستخدم الاسم ورقم الهاتف والعنوان لتسجيل الطلب والتواصل معاك بخصوصه والتسليم. ما تكتبش بيانات بنكية أو كلمات مرور في خانة الملاحظات. تقدر تتواصل معانا لو عندك استفسار عن بياناتك.
        </p>
      </section>

      <section style={sectionStyle}>
        <h2 style={{ marginTop: 0 }}>5. التواصل وخدمة العملاء</h2>
        <p>للاستفسار عن الشحن أو الاستبدال أو الاسترجاع، تواصل معانا على واتساب:</p>
        <a href="https://wa.me/201155676181" target="_blank" rel="noreferrer" style={{ display: "inline-block", background: "#176b39", color: "#fff", padding: "10px 16px", borderRadius: 8, textDecoration: "none", fontWeight: 800 }}>
          تواصل مع STEPUP على واتساب
        </a>
        <p style={{ color: "#666", marginBottom: 0 }}>يفضل الاحتفاظ برقم الطلب ورسائل تأكيد الطلب لتسهيل المتابعة.</p>
      </section>

      <footer style={{ padding: 16, textAlign: "center", color: "#777" }}>STEPUP · Move With Confidence</footer>
    </main>
  );
}
