"use client";

import { useState } from "react";
import LeadCapture from "@/app/components/LeadCapture";

const whatsapp = "https://wa.me/201055676181";
const categories = [
  { title: "أحذية رجالي", subtitle: "ستايل يومي • كاجوال • رياضي", mark: "01", tone: "men" },
  { title: "أحذية حريمي", subtitle: "أناقة وراحة في كل خطوة", mark: "02", tone: "women" },
  { title: "وصل حديثًا", subtitle: "اختياراتك الجديدة تبدأ هنا", mark: "03", tone: "new" },
];

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <main className="store" dir="rtl">
      <LeadCapture />
      <div className="announcement">خطوتك الجاية تبدأ من هنا — تابعنا لمعرفة أحدث الموديلات</div>
      <header className="site-header">
        <a className="brand" href="#" aria-label="STEPUP الصفحة الرئيسية"><span>STEP</span><b>UP</b><small>MOVE WITH CONFIDENCE</small></a>
        <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="فتح القائمة">☰</button>
        <nav className={menuOpen ? "nav open" : "nav"}>
          <a href="#categories" onClick={() => setMenuOpen(false)}>تسوق حسب الفئة</a>
          <a href="#about" onClick={() => setMenuOpen(false)}>عن STEPUP</a>
          <a href="#contact" onClick={() => setMenuOpen(false)}>تواصل معنا</a>
        </nav>
        <a className="header-cta" href="/products">تصفح المنتجات ↗</a>
      </header>

      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> YOUR NEXT STEP STARTS HERE</p>
          <h1>مش مجرد<br/><em>جزمة.</em><br/>دي خطوتك.</h1>
          <p className="hero-desc">اختار ستايلك، وخلّي كل خطوة تعبّر عنك. اكتشف اختيارات STEPUP للرجالي والحريمي.</p>
          <div className="hero-actions">
            <a className="primary-button" href="/products">تصفح المنتجات <span>←</span></a>
            <a className="text-button" href={whatsapp} target="_blank" rel="noreferrer">اسألنا عن الموديلات ↗</a>
          </div>
          <div className="hero-note"><span>01</span> ستايل يناسبك <i/> <span>02</span> اختيارك على مزاجك</div>
        </div>
        <div className="hero-art" aria-label="تصميم فني تجريدي مستوحى من الأحذية">
          <div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/>
          <div className="art-circle"><span>STEP<br/><b>UP</b></span></div>
          <div className="art-label label-top">MOVE<br/>FORWARD</div>
          <div className="art-label label-bottom">EST. FOR YOUR EVERYDAY</div>
          <div className="art-number">S/01</div>
        </div>
        <div className="hero-side-label">STEPUP / EVERY STEP MATTERS</div>
      </section>

      <section className="trust-strip">
        <div><b>01</b><span>اختيارات للرجالي والحريمي</span></div>
        <div><b>02</b><span>اسألنا عن المقاس المتاح</span></div>
        <div><b>03</b><span>تواصل مباشر وسهل</span></div>
      </section>

      <section className="categories-section" id="categories">
        <div className="section-heading"><div><p className="eyebrow">FIND YOUR FIT</p><h2>اختار <em>ستايلك.</em></h2></div><p>كل خطوة ليها شكلها.<br/>ابدأ من هنا.</p></div>
        <div className="category-grid">
          {categories.map((category) => <article className={"category-card " + category.tone} key={category.mark}>
            <div className="category-top"><span>STEPUP / {category.mark}</span><span>↙</span></div>
            <div className="category-shape"><div className="shape-ring"/><div className="shape-block">{category.mark}</div></div>
            <div className="category-info"><div><h3>{category.title}</h3><p>{category.subtitle}</p></div><a href={whatsapp} target="_blank" rel="noreferrer" aria-label={"اسأل عن " + category.title}>↗</a></div>
          </article>)}
        </div>
        <p className="catalog-note">الموديلات والأسعار والمقاسات بتتأكد معانا مباشرة قبل الطلب.</p>
      </section>

      <section className="about-section" id="about">
        <div className="about-stamp">S<br/><b>U</b></div>
        <div><p className="eyebrow">MORE THAN JUST SHOES</p><h2>خطوتك.<br/><em>اختيارك.</em></h2></div>
        <p>في STEPUP بنؤمن إن الستايل مش بس شكل؛ هو إحساسك في كل خطوة. كلمنا عشان تعرف الموديلات المتاحة والمقاسات المناسبة ليك.</p>
      </section>

      <section className="contact-section" id="contact"><div><p className="eyebrow">LET'S TALK</p><h2>جاهز لخطوتك<br/><em>الجاية؟</em></h2></div><a className="primary-button" href={whatsapp} target="_blank" rel="noreferrer">كلمنا على واتساب <span>↗</span></a></section>
      <footer className="site-footer"><a className="brand footer-brand" href="#"><span>STEP</span><b>UP</b><small>MOVE WITH CONFIDENCE</small></a><p>ستايلك. اختيارك. خطوتك.</p><span>© STEPUP 2026</span></footer>
    </main>
  );
}
