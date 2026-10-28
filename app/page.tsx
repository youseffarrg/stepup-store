"use client";

import { useState } from "react";
import LeadCapture from "@/app/components/LeadCapture";

const whatsapp = "https://wa.me/201055676181";
const categories = [
  { title: "أحذية رجالي", subtitle: "ستايل يومي • كاجوال • رياضي", mark: "men", tone: "men", href: "/products?category=men" },
  { title: "أحذية حريمي", subtitle: "أناقة وراحة في كل خطوة", mark: "women", tone: "women", href: "/products?category=women" },
  { title: "أحذية أطفال", subtitle: "راحة وحركة لكل خطوة صغيرة", mark: "kids", tone: "kids", href: "/products?category=kids" },
  { title: "وصل حديثًا", subtitle: "أحدث الموديلات المضافة للمتجر", mark: "new", tone: "new", href: "/products?category=new" },
];


function CategoryIcon({ type }: { type: string }) {
  if (type === "women") return <svg viewBox="0 0 120 100" aria-hidden="true" className="category-icon"><path d="M18 69c10-2 19-8 27-20l12-20c3-5 8-6 12-2l11 13c7 8 16 13 27 16l-5 12c-15 2-28 4-43 4H24c-5 0-8-1-6-3Z" fill="currentColor" opacity=".13"/><path d="M17 70c13-3 22-11 30-24l10-17c3-5 8-5 12 0l10 12c7 8 16 12 27 15l-5 12c-14 3-29 4-44 4H24c-5 0-8-1-7-2Z" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round"/><path d="M18 71l-3 10h15l4-7M42 69l-2 8M56 45l13 7M69 42l-5 10" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M31 82h60" stroke="currentColor" strokeWidth="2" opacity=".25" strokeLinecap="round"/></svg>;
  if (type === "kids") return <svg viewBox="0 0 120 100" aria-hidden="true" className="category-icon"><path d="M17 62c9-2 17-8 24-17l12-14c3-4 8-3 11 1l12 15c6 7 16 10 26 13l5 10c-8 7-19 9-33 9H26c-10 0-14-7-9-17Z" fill="currentColor" opacity=".13"/><path d="M17 62c9-2 17-8 24-17l12-14c3-4 8-3 11 1l12 15c6 7 16 10 26 13l5 10c-8 7-19 9-33 9H26c-10 0-14-7-9-17Z" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round"/><path d="M48 43l11 5m-6-12 12 7m-7-13 12 8M17 68h87" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/><circle cx="85" cy="26" r="5" fill="#ff6a1a"/><path d="M94 20l3-5m4 15 6 1" stroke="#ff6a1a" strokeWidth="2.5" strokeLinecap="round"/></svg>;
  if (type === "new") return <svg viewBox="0 0 120 100" aria-hidden="true" className="category-icon"><path d="M60 12l9 28 29 10-29 10-9 28-10-28-28-10 28-10 10-28Z" fill="currentColor" opacity=".14"/><path d="M60 12l9 28 29 10-29 10-9 28-10-28-28-10 28-10 10-28Z" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round"/><path d="M94 17l3 8 8 3-8 3-3 8-3-8-8-3 8-3 3-8ZM23 62l3 6 6 3-6 2-3 7-2-7-7-2 7-3 2-6Z" fill="#ff6a1a"/></svg>;
  return <svg viewBox="0 0 120 100" aria-hidden="true" className="category-icon"><path d="M14 59c12-2 22-9 31-20l10-12c4-4 8-3 11 1l13 15c7 7 17 11 28 14l-1 13c-12 6-26 8-43 8H27c-11 0-17-8-13-19Z" fill="currentColor" opacity=".13"/><path d="M14 59c12-2 22-9 31-20l10-12c4-4 8-3 11 1l13 15c7 7 17 11 28 14l-1 13c-12 6-26 8-43 8H27c-11 0-17-8-13-19Z" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinejoin="round"/><path d="M48 42l12 5m-6-13 12 6m-6-13 11 7M15 66h91" fill="none" stroke="currentColor" strokeWidth="3.5" strokeLinecap="round"/><path d="M30 81h54" stroke="currentColor" strokeWidth="2" opacity=".25" strokeLinecap="round"/></svg>;
}

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
          <div className="hero-note"><span>✦</span> ستايل يناسبك <i/> <span>↗</span> اختيارك على مزاجك</div>
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
            <a className="category-browse" href={category.href} aria-label={"تصفح " + category.title}>
              <div className="category-top"><span>STEPUP / {category.title}</span><span>↙</span></div>
              <div className="category-shape"><div className="shape-ring"/><div className="shape-block"><CategoryIcon type={category.mark} /></div></div>
              <div className="category-info"><div><h3>{category.title}</h3><p>{category.subtitle}</p></div><span aria-hidden="true">←</span></div>
              <span className="category-browse-label">تصفح المنتجات</span>
            </a>
            <a className="category-whatsapp" href={whatsapp} target="_blank" rel="noreferrer" aria-label={"اسأل عن " + category.title}>اسألنا على واتساب ↗</a>
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
      <footer className="site-footer"><a className="brand footer-brand" href="#"><span>STEP</span><b>UP</b><small>MOVE WITH CONFIDENCE</small></a><p>ستايلك. اختيارك. خطوتك.</p><a href="/policies">الشحن والاستبدال والاسترجاع</a><span>© STEPUP 2026</span></footer>
    </main>
  );
}
