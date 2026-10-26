"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Lead = { id: number; name: string | null; phone: string | null; email: string | null; interest: string; created_at: string };

export default function AdminPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [session, setSession] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) { setSession(true); void checkAdmin(); }
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      setSession(Boolean(next));
      if (!next) { setAuthorized(false); setLeads([]); }
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  async function checkAdmin() {
    if (!supabase) return;
    setLoading(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) { setLoading(false); return; }
    const { data: role, error } = await supabase.from("stepup_admins").select("user_id").eq("user_id", userData.user.id).maybeSingle();
    if (error || !role) {
      setAuthorized(false);
      setMessage("الحساب سجل دخول، لكنه مش مضاف كمدير للمتجر لسه. هنكمل إعداد صلاحية المدير من Supabase.");
      setLoading(false);
      return;
    }
    setAuthorized(true);
    const { data, error: leadsError } = await supabase.from("customer_leads").select("id,name,phone,email,interest,created_at").order("created_at", { ascending: false }).limit(500);
    if (leadsError) setMessage("تعذر تحميل بيانات العملاء. راجع صلاحيات الجدول في Supabase.");
    else { setLeads((data || []) as Lead[]); setMessage(""); }
    setLoading(false);
  }

  async function login(e: FormEvent) {
    e.preventDefault();
    if (!supabase) { setMessage("إعدادات Supabase غير مكتملة."); return; }
    setLoading(true); setMessage("");
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) setMessage("تعذر تسجيل الدخول. راجع البريد وكلمة المرور، وتأكد إن حساب المدير اتعمل في Supabase.");
    else await checkAdmin();
  }

  async function logout() {
    if (supabase) await supabase.auth.signOut();
    setSession(false); setAuthorized(false); setLeads([]); setPassword("");
  }

  return <main dir="rtl" style={{minHeight:"100vh",background:"#f5f2ec",color:"#171717",fontFamily:"Cairo,Arial,sans-serif",padding:20}}>
    <div style={{maxWidth:1050,margin:"0 auto"}}>
      <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,borderBottom:"2px solid #ff6a1a",paddingBottom:18,marginBottom:26}}>
        <a href="/" style={{fontWeight:900,fontSize:25,letterSpacing:-1}}>STEP<span style={{color:"#ff6a1a"}}>UP</span><small style={{display:"block",fontSize:10,letterSpacing:2,color:"#777"}}>ADMIN DASHBOARD</small></a>
        {session && <button onClick={logout} style={buttonStyle("#222","white")}>تسجيل الخروج</button>}
      </header>
      {!authorized ? <section style={{maxWidth:440,margin:"50px auto",background:"white",padding:24,border:"1px solid #e4dfd6",boxShadow:"0 12px 35px #00008"}}>
        <h1 style={{fontSize:25,margin:"0 0 8px"}}>لوحة تحكم المتجر</h1>
        <p style={{color:"#666",lineHeight:1.8,fontSize:14}}>سجّل دخولك بحساب المدير المخصص لـ STEPUP. الدخول وحده لا يكفي؛ لازم الحساب يكون معتمد كمدير.</p>
        <form onSubmit={login} style={{display:"grid",gap:13}}>
          <label style={{fontSize:13,fontWeight:700}}>البريد الإلكتروني<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" style={inputStyle}/></label>
          <label style={{fontSize:13,fontWeight:700}}>كلمة المرور<input required type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" style={inputStyle}/></label>
          <button disabled={loading} type="submit" style={buttonStyle("#ff6a1a","#171717")}>{loading?"جاري التحقق...":"تسجيل الدخول"}</button>
        </form>
        {message && <p role="status" style={{fontSize:13,lineHeight:1.9,marginTop:14}}>{message}</p>}
        <p style={{fontSize:12,color:"#777",lineHeight:1.8,marginBottom:0}}>لو دي أول مرة، لازم ننشئ حساب المدير ونضيف له الصلاحية الآمنة من Supabase قبل عرض بيانات العملاء.</p>
      </section> : <>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"end",gap:12,flexWrap:"wrap",marginBottom:20}}>
          <div><h1 style={{margin:0,fontSize:28}}>أهلًا بيك في STEPUP</h1><p style={{margin:"5px 0 0",color:"#666"}}>متابعة العملاء المهتمين بالعروض</p></div>
          <button onClick={()=>void checkAdmin()} style={buttonStyle("#222","white")}>تحديث البيانات ↻</button>
        </div>
        <section style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:14,marginBottom:24}}>
          <div style={statStyle}><span style={{color:"#777",fontSize:13}}>إجمالي العملاء المحتملين</span><strong style={{fontSize:34}}>{leads.length}</strong></div>
          <div style={statStyle}><span style={{color:"#777",fontSize:13}}>لديهم رقم موبايل</span><strong style={{fontSize:34}}>{leads.filter(x=>x.phone).length}</strong></div>
          <div style={statStyle}><span style={{color:"#777",fontSize:13}}>لديهم بريد إلكتروني</span><strong style={{fontSize:34}}>{leads.filter(x=>x.email).length}</strong></div>
        </section>
        <section style={{background:"white",padding:18,border:"1px solid #e4dfd6",overflowX:"auto"}}>
          <h2 style={{marginTop:0}}>العملاء المسجلون</h2>
          {loading ? <p>جاري تحميل البيانات...</p> : leads.length===0 ? <p style={{color:"#777"}}>لسه مفيش تسجيلات محفوظة.</p> : <table style={{width:"100%",borderCollapse:"collapse",minWidth:620,textAlign:"right",fontSize:13}}>
            <thead><tr>{["الاسم","الموبايل","الإيميل","الاهتمام","تاريخ التسجيل"].map(x=><th key={x} style={cellStyle}>{x}</th>)}</tr></thead>
            <tbody>{leads.map(x=><tr key={x.id}>{[x.name||"—",x.phone||"—",x.email||"—",x.interest,new Date(x.created_at).toLocaleDateString("ar-EG")].map((v,i)=><td key={i} style={cellStyle}>{v}</td>)}</tr>)}</tbody>
          </table>}
        </section>
      </>}
    </div>
  </main>;
}

const inputStyle: React.CSSProperties = {display:"block",width:"100%",boxSizing:"border-box",marginTop:7,padding:12,border:"1px solid #d6d0c6",background:"#fffdf9",fontSize:15};
const buttonStyle = (background:string,color:string):React.CSSProperties => ({background,color,border:0,padding:"12px 16px",fontWeight:800,cursor:"pointer"});
const statStyle: React.CSSProperties = {display:"flex",flexDirection:"column",gap:8,background:"white",padding:20,border:"1px solid #e4dfd6",borderTop:"4px solid #ff6a1a"};
const cellStyle: React.CSSProperties = {padding:"12px 10px",borderBottom:"1px solid #eee",whiteSpace:"nowrap"};
