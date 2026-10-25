"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LeadCapture() {
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [interest, setInterest] = useState("الكل");
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    try {
      if (localStorage.getItem("stepup-lead-dismissed")) return;
      const timer = window.setTimeout(() => setOpen(true), 9000);
      return () => window.clearTimeout(timer);
    } catch {}
  }, []);

  function close() {
    setOpen(false);
    try { localStorage.setItem("stepup-lead-dismissed", "1"); } catch {}
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!consent || (!phone.trim() && !email.trim())) {
      setStatus("اكتب رقم موبايل أو إيميل، ووافق على استقبال العروض.");
      return;
    }
    if (!supabase) {
      setStatus("التسجيل مش متاح حاليًا. جرّب التواصل معنا على واتساب.");
      return;
    }
    setBusy(true);
    setStatus("");
    const { error } = await supabase.from("customer_leads").insert([{
      name: name.trim() || null,
      phone: phone.trim() || null,
      email: email.trim().toLowerCase() || null,
      interest,
      marketing_consent: true,
      source: "website_popup"
    }]);
    setBusy(false);
    if (error) {
      setStatus("حصلت مشكلة في التسجيل. جرّب تاني بعد شوية أو كلمنا على واتساب.");
      return;
    }
    setStatus("تمام! سجلنا اهتمامك، وهتوصلك أخبار STEPUP حسب موافقتك.");
    try { localStorage.setItem("stepup-lead-dismissed", "1"); } catch {}
    window.setTimeout(() => setOpen(false), 2500);
  }

  if (!open) return null;

  return (
    <div role="presentation" onClick={close} style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(12,12,12,.72)",display:"grid",placeItems:"center",padding:18}}>
      <section role="dialog" aria-modal="true" aria-labelledby="stepup-lead-title" dir="rtl" onClick={e=>e.stopPropagation()} style={{width:"100%",maxWidth:440,background:"#f4f0e8",color:"#171717",padding:"28px 22px",position:"relative",borderTop:"5px solid #ff6a00",boxShadow:"0 24px 80px #0005",fontFamily:"inherit"}}>
        <button type="button" onClick={close} aria-label="إغلاق" style={{position:"absolute",left:14,top:12,border:0,background:"transparent",fontSize:26,cursor:"pointer"}}>×</button>
        <p style={{fontSize:11,letterSpacing:2,fontWeight:800,margin:"0 0 10px",color:"#e65d00"}}>STEPUP / STAY IN THE LOOP</p>
        <h2 id="stepup-lead-title" style={{fontSize:27,lineHeight:1.45,margin:"0 0 8px",fontWeight:900}}>خليك أول واحد يعرف الجديد 🔥</h2>
        <p style={{fontSize:14,lineHeight:1.9,color:"#555",margin:"0 0 18px"}}>سيب وسيلة تواصل واحدة عالأقل عشان توصلك الموديلات الجديدة والعروض. التسجيل اختياري وتقدر تلغي الاشتراك في أي وقت.</p>
        <form onSubmit={submit} style={{display:"grid",gap:11}}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="اسمك (اختياري)" maxLength={80} style={fieldStyle}/>
          <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="رقم الموبايل" inputMode="tel" maxLength={25} style={fieldStyle}/>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="الإيميل (اختياري)" type="email" maxLength={254} style={fieldStyle}/>
          <label style={{fontSize:13,fontWeight:700}}>مهتم بإيه؟</label>
          <select value={interest} onChange={e=>setInterest(e.target.value)} style={fieldStyle}>
            <option>الكل</option><option>أحذية رجالي</option><option>أحذية حريمي</option><option>العروض والخصومات</option>
          </select>
          <label style={{display:"flex",gap:9,alignItems:"flex-start",fontSize:12,lineHeight:1.8,color:"#444"}}>
            <input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)} style={{marginTop:5}}/>
            أوافق على استقبال أخبار وعروض STEPUP عبر وسيلة التواصل التي أدخلتها.
          </label>
          <button disabled={busy} type="submit" style={{border:0,background:"#ff6a00",color:"#111",padding:14,fontWeight:900,fontSize:15,cursor:"pointer",opacity:busy?.7:1}}>{busy?"جاري التسجيل...":"سجّلني في العروض ↗"}</button>
        </form>
        {status && <p role="status" style={{fontSize:13,lineHeight:1.8,margin:"12px 0 0"}}>{status}</p>}
        <button type="button" onClick={close} style={{width:"100%",border:0,background:"transparent",padding:"14px 0 0",color:"#666",fontSize:12,cursor:"pointer"}}>مش دلوقتي</button>
      </section>
    </div>
  );
}

const fieldStyle: React.CSSProperties = {width:"100%",boxSizing:"border-box",border:"1px solid #d6d0c6",background:"#fffdf9",padding:"12px 13px",fontSize:14,color:"#171717",borderRadius:0};
