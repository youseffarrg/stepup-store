"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type Product = Record<string, unknown> & { id?: string | number };

function value(product: Product, keys: string[], fallback = ""): string {
  for (const key of keys) {
    const item = product[key];
    if (item !== null && item !== undefined && String(item).trim()) return String(item);
  }
  return fallback;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Product | null>(null);
  const [customer, setCustomer] = useState({ name: "", phone: "", address: "", size: "", notes: "" });

  useEffect(() => {
    let alive = true;
    async function load() {
      if (!supabase) {
        setError("إعدادات الاتصال بقاعدة البيانات لسه مش مضافة للموقع.");
        setLoading(false);
        return;
      }
      const { data, error: queryError } = await supabase.from("products").select("*").limit(100);
      if (!alive) return;
      if (queryError) setError("مش قادرين نعرض المنتجات حاليًا. راجع أسماء الأعمدة وسياسات الوصول في Supabase.");
      else setProducts((data ?? []) as Product[]);
      setLoading(false);
    }
    void load();
    return () => { alive = false; };
  }, []);

  const visible = useMemo(() => products.filter((p) => {
    const active = value(p, ["is_active", "active", "is_available"], "true").toLowerCase();
    const name = value(p, ["name", "title", "product_name", "name_ar"], "منتج STEPUP");
    return !["false", "0", "inactive", "غير نشط"].includes(active) && name.toLowerCase().includes(search.toLowerCase());
  }), [products, search]);

  function order() {
    if (!selected || !customer.name.trim() || !customer.phone.trim() || !customer.address.trim()) return;
    const name = value(selected, ["name", "title", "product_name", "name_ar"], "منتج STEPUP");
    const price = value(selected, ["price", "sale_price", "selling_price"], "السعر يُؤكد");
    const text = [
      "طلب جديد من متجر STEPUP",
      "المنتج: " + name,
      "السعر: " + price + " جنيه",
      "المقاس: " + (customer.size || "يُحدد بالتواصل"),
      "الاسم: " + customer.name,
      "الموبايل: " + customer.phone,
      "العنوان: " + customer.address,
      "ملاحظات: " + (customer.notes || "لا يوجد"),
      "الدفع: عند الاستلام"
    ].join("\n");
    window.open("https://wa.me/201274907577?text=" + encodeURIComponent(text), "_blank", "noopener,noreferrer");
  }

  const inputStyle = { width: "100%", padding: "12px", border: "1px solid #ddd", background: "#fff", borderRadius: 0, font: "inherit", marginTop: "5px" };

  return <main dir="rtl" style={{ minHeight: "100vh", background: "#f5f2ec", color: "#151515" }}>
    <header style={{ padding: "20px 6%", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #ddd" }}>
      <Link href="/" style={{ fontSize: 25, fontWeight: 900, letterSpacing: -1 }}>STEP<span style={{ color: "#ff6a1a" }}>UP</span></Link>
      <Link href="/" style={{ fontWeight: 700 }}>الصفحة الرئيسية ←</Link>
    </header>
    <section style={{ padding: "38px 6% 20px", background: "#151515", color: "#fff" }}>
      <p style={{ color: "#ff6a1a", fontSize: 12, letterSpacing: 2 }}>STEPUP / THE COLLECTION</p>
      <h1 style={{ fontSize: "clamp(32px, 6vw, 56px)", margin: "8px 0" }}>اختار خطوتك الجاية.</h1>
      <p style={{ color: "#ccc", lineHeight: 1.9 }}>اختار المنتج والمقاس، وابعث طلبك على واتساب. الدفع عند الاستلام.</p>
    </section>
    <section style={{ padding: "28px 6%" }}>
      <input aria-label="ابحث عن منتج" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="ابحث عن موديل..." style={{ ...inputStyle, maxWidth: 440 }} />
      {loading && <p>جاري تحميل المنتجات...</p>}
      {!loading && error && <div style={{ padding: 18, background: "#fff", marginTop: 18, borderRight: "4px solid #ff6a1a", lineHeight: 1.9 }}><strong>الكتالوج محتاج إعداد بسيط</strong><p style={{ marginBottom: 0 }}>{error}</p></div>}
      {!loading && !error && visible.length === 0 && <p style={{ padding: "24px 0" }}>مفيش منتجات ظاهرة حاليًا. أضف منتجات من جدول products في Supabase.</p>}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 16, marginTop: 22 }}>
        {visible.map((p, i) => {
          const name = value(p, ["name", "title", "product_name", "name_ar"], "منتج STEPUP");
          const price = value(p, ["price", "sale_price", "selling_price"], "");
          const imageUrl = value(p, ["image_url", "image", "photo_url", "main_image", "image_path"], "");
          return <article key={String(p.id ?? i)} style={{ background: "#fff", padding: 14, border: "1px solid #e5e0d8" }}>
            {imageUrl ? <img src={imageUrl} alt={name} style={{ width: "100%", height: 220, objectFit: "cover", background: "#eee" }} /> : <div style={{ height: 220, display: "grid", placeItems: "center", background: "#e8e2d8", color: "#ff6a1a", fontSize: 42, fontWeight: 900 }}>STEPUP</div>}
            <h2 style={{ fontSize: 18, margin: "14px 0 5px" }}>{name}</h2>
            <p style={{ margin: "0 0 14px", fontWeight: 800 }}>{price ? price + " جنيه" : "السعر يُؤكد عند الطلب"}</p>
            <button onClick={() => setSelected(p)} style={{ width: "100%", padding: 13, background: "#ff6a1a", border: 0, font: "inherit", fontWeight: 800, cursor: "pointer" }}>اطلب المنتج</button>
          </article>;
        })}
      </div>
    </section>
    {selected && <div role="dialog" aria-modal="true" aria-label="نموذج الطلب" style={{ position: "fixed", inset: 0, background: "#0009", zIndex: 20, display: "grid", placeItems: "center", padding: 16 }}>
      <section style={{ background: "#f5f2ec", width: "min(100%,520px)", maxHeight: "90vh", overflow: "auto", padding: 22 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}><h2 style={{ marginTop: 0 }}>طلب {value(selected, ["name", "title", "product_name", "name_ar"], "منتج STEPUP")}</h2><button onClick={() => setSelected(null)} aria-label="إغلاق" style={{ border: 0, background: "transparent", fontSize: 24 }}>×</button></div>
        <p>الدفع عند الاستلام — هنبعت تفاصيل الطلب على واتساب لتأكيد المقاس والتوفر.</p>
        <label style={{ display: "block", marginTop: 12 }}>الاسم الكامل<input required value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} style={inputStyle} /></label>
        <label style={{ display: "block", marginTop: 12 }}>رقم الموبايل<input required inputMode="tel" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} style={inputStyle} /></label>
        <label style={{ display: "block", marginTop: 12 }}>العنوان بالتفصيل<textarea required value={customer.address} onChange={(e) => setCustomer({ ...customer, address: e.target.value })} style={{ ...inputStyle, minHeight: 75 }} /></label>
        <label style={{ display: "block", marginTop: 12 }}>المقاس المطلوب<input value={customer.size} onChange={(e) => setCustomer({ ...customer, size: e.target.value })} placeholder="مثال: 42" style={inputStyle} /></label>
        <label style={{ display: "block", marginTop: 12 }}>ملاحظات إضافية<textarea value={customer.notes} onChange={(e) => setCustomer({ ...customer, notes: e.target.value })} style={inputStyle} /></label>
        <button onClick={order} disabled={!customer.name.trim() || !customer.phone.trim() || !customer.address.trim()} style={{ width: "100%", marginTop: 18, padding: 15, background: "#151515", color: "#fff", border: 0, font: "inherit", fontWeight: 800, cursor: "pointer" }}>تأكيد الطلب على واتساب ↗</button>
      </section>
    </div>}
    <footer style={{ background: "#151515", color: "#ccc", padding: 24, textAlign: "center" }}>STEPUP — MOVE WITH CONFIDENCE</footer>
  </main>;
}
