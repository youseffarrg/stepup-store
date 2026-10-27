"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Lead = { id: number; name: string | null; phone: string | null; email: string | null; interest: string; shoe_size: string | null; created_at: string };
type Product = { id: number; name: string; description: string; category: string; image_url: string; image_urls?: string[]; colors?: string; purchase_price: number; price: number; sale_price: number | null; bundle_2_price: number | null; bundle_3_price: number | null; stock_quantity: number; sizes: string; is_active: boolean };
type Order = { id: number; order_number: string; product_name: string; quantity: number; unit_price: number; customer_name: string; customer_phone: string; customer_address: string; size: string; notes: string; status: string; created_at: string };
const statuses: Record<string,string> = { new:"جديد", confirmed:"تم التأكيد", preparing:"قيد التجهيز", shipped:"تم الشحن", delivered:"تم التسليم", cancelled:"ملغي" };
const allowedTransitions: Record<string,string[]> = { new:["new","confirmed","cancelled"], confirmed:["confirmed","preparing","cancelled"], preparing:["preparing","shipped","cancelled"], shipped:["shipped","delivered"], delivered:["delivered"], cancelled:["cancelled"] };
const emptyProduct = { name:"", description:"", category:"رجالي", image_url:"", image_urls:[] as string[], purchase_price:"0", price:"0", sale_price:"", bundle_2_price:"", bundle_3_price:"", stock_quantity:"0", sizes:"", colors:"" };

export default function AdminPage() {
  const [email,setEmail] = useState(""); const [password,setPassword] = useState("");
  const [session,setSession] = useState(false); const [authorized,setAuthorized] = useState(false);
  const [leads,setLeads] = useState<Lead[]>([]); const [products,setProducts] = useState<Product[]>([]); const [orders,setOrders] = useState<Order[]>([]);
  const [loading,setLoading] = useState(false); const [message,setMessage] = useState(""); const [tab,setTab] = useState("dashboard");
  const [form,setForm] = useState(emptyProduct); const [editing,setEditing] = useState<number|null>(null); const [uploadingImage,setUploadingImage] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth.getSession().then(({data}) => { if(data.session){setSession(true); void checkAdmin();} });
    const {data:listener}=supabase.auth.onAuthStateChange((_event,next)=>{setSession(Boolean(next)); if(!next){setAuthorized(false);setLeads([]);setProducts([]);setOrders([]);}});
    return ()=>listener.subscription.unsubscribe();
  }, []);

  async function checkAdmin() {
    if(!supabase)return; setLoading(true);
    const {data:userData}=await supabase.auth.getUser();
    if(!userData.user){setLoading(false);return;}
    const {data:role,error}=await supabase.from("stepup_admins").select("user_id").eq("user_id",userData.user.id).maybeSingle();
    if(error||!role){setAuthorized(false);setMessage("الحساب مش مضاف كمدير للمتجر في جدول stepup_admins.");setLoading(false);return;}
    setAuthorized(true);
    const [l,p,o]=await Promise.all([
      supabase.from("customer_leads").select("id,name,phone,email,interest,shoe_size,created_at").order("created_at",{ascending:false}).limit(500),
      supabase.from("stepup_products").select("*").order("created_at",{ascending:false}).limit(500),
      supabase.from("stepup_orders").select("*").order("created_at",{ascending:false}).limit(500)
    ]);
    setLeads((l.data||[]) as Lead[]); setProducts((p.data||[]) as Product[]); setOrders((o.data||[]) as Order[]);
    const errors=[l.error,p.error,o.error].filter(Boolean);
    setMessage(errors.length ? "تم تحميل ما أمكن؛ راجع إعداد الجداول والصلاحيات في Supabase إذا كان قسم فارغًا." : "");
    setLoading(false);
  }
  async function login(e:FormEvent){e.preventDefault();if(!supabase){setMessage("إعدادات Supabase غير مكتملة.");return;}setLoading(true);setMessage("");const {error}=await supabase.auth.signInWithPassword({email:email.trim(),password});setLoading(false);if(error)setMessage("تعذر تسجيل الدخول. راجع البريد وكلمة المرور.");else await checkAdmin();}
  async function logout(){if(supabase)await supabase.auth.signOut();setSession(false);setAuthorized(false);setPassword("");}
  function editProduct(p:Product){setEditing(p.id);setForm({name:p.name,description:p.description||"",category:p.category||"رجالي",image_url:p.image_url||"",image_urls:Array.isArray(p.image_urls)?p.image_urls:(p.image_url?[p.image_url]:[]),purchase_price:String(p.purchase_price??0),price:String(p.price??0),sale_price:p.sale_price==null?"":String(p.sale_price),bundle_2_price:p.bundle_2_price==null?"":String(p.bundle_2_price),bundle_3_price:p.bundle_3_price==null?"":String(p.bundle_3_price),stock_quantity:String(p.stock_quantity??0),sizes:p.sizes||"",colors:p.colors||""});setTab("products");}
  function resetForm(){setForm(emptyProduct);setEditing(null);}
  async function uploadImages(files?:FileList|null){if(!supabase||!files||files.length===0)return;const selectedFiles=Array.from(files);if(selectedFiles.some(file=>!file.type.startsWith("image/"))){setMessage("اختار صور فقط.");return;}if(selectedFiles.some(file=>file.size>5*1024*1024)){setMessage("كل صورة لازم تكون أقل من 5 ميجابايت.");return;}setUploadingImage(true);setMessage("");const urls:string[]=[];for(const file of selectedFiles){const ext=(file.name.split(".").pop()||"jpg").toLowerCase().replace(/[^a-z0-9]/g,"");const path=Date.now()+"-"+Math.random().toString(36).slice(2)+"-"+urls.length+"."+ext;const {error}=await supabase.storage.from("stepup-product-images").upload(path,file,{upsert:false,contentType:file.type});if(error){setUploadingImage(false);setMessage("تعذر رفع إحدى الصور. راجع إعدادات مساحة الصور في Supabase.");return;}urls.push(supabase.storage.from("stepup-product-images").getPublicUrl(path).data.publicUrl);}setUploadingImage(false);setForm(old=>({...old,image_urls:[...old.image_urls,...urls],image_url:old.image_url||urls[0]}));setMessage("تم رفع الصور. احفظ المنتج لتثبيتها.");}
  async function saveProduct(e:FormEvent){e.preventDefault();if(!supabase)return;setLoading(true);setMessage("");
    const payload={name:form.name.trim(),description:form.description.trim(),category:form.category,image_url:form.image_url.trim()||(form.image_urls[0]||""),image_urls:form.image_urls.length?form.image_urls:(form.image_url.trim()?[form.image_url.trim()]:[]),purchase_price:Number(form.purchase_price)||0,price:Number(form.price)||0,sale_price:form.sale_price.trim()===""?null:Number(form.sale_price),bundle_2_price:form.bundle_2_price.trim()===""?null:Number(form.bundle_2_price),bundle_3_price:form.bundle_3_price.trim()===""?null:Number(form.bundle_3_price),stock_quantity:Math.max(0,Number(form.stock_quantity)||0),sizes:form.sizes.trim(),colors:form.colors.trim(),updated_at:new Date().toISOString()};
    const result=editing?await supabase.from("stepup_products").update(payload).eq("id",editing):await supabase.from("stepup_products").insert({...payload,is_active:true});
    setLoading(false);if(result.error){setMessage("لم يتم حفظ المنتج: "+result.error.message);return;}setMessage("تم حفظ المنتج بنجاح.");resetForm();await checkAdmin();
  }
  async function toggleProduct(p:Product){if(!supabase)return;const {error}=await supabase.from("stepup_products").update({is_active:!p.is_active,updated_at:new Date().toISOString()}).eq("id",p.id);if(error)setMessage("تعذر تغيير حالة المنتج: "+error.message);else await checkAdmin();}
  async function updateOrder(id:number,status:string){if(!supabase)return;setLoading(true);setMessage("");const {error}=await supabase.rpc("set_stepup_order_status",{p_order_id:id,p_status:status});setLoading(false);if(error)setMessage("تعذر تحديث الطلب أو المخزون: "+error.message);else{setMessage(status==="confirmed"?"تم تأكيد الطلب وخصم الكمية من المخزون بنجاح.":status==="cancelled"?"تم إلغاء الطلب. وإذا كان مؤكدًا أو قيد التجهيز، تمت إعادة الكمية للمخزون.":"تم تحديث حالة الطلب.");await checkAdmin();}}
  const money=(n:number)=>Number(n||0).toLocaleString("ar-EG")+" ج.م";
  return <main dir="rtl" style={{minHeight:"100vh",background:"#f5f2ec",color:"#171717",fontFamily:"Cairo,Arial,sans-serif",padding:16}}>
    <div style={{maxWidth:1200,margin:"0 auto"}}>
      <header style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap",borderBottom:"2px solid #ff6a1a",paddingBottom:18,marginBottom:22}}>
        <a href="/" style={{fontWeight:900,fontSize:25}}>STEP<span style={{color:"#ff6a1a"}}>UP</span><small style={{display:"block",fontSize:10,color:"#777"}}>ADMIN DASHBOARD</small></a>
        {session&&<button onClick={logout} style={btn("#222","#fff")}>تسجيل الخروج</button>}
      </header>
      {!authorized?<section style={{maxWidth:440,margin:"50px auto",background:"#fff",padding:24,border:"1px solid #e4dfd6"}}>
        <h1>لوحة تحكم STEPUP</h1><p style={{color:"#666",lineHeight:1.8}}>سجّل دخولك بحساب المدير المعتمد.</p>
        <form onSubmit={login} style={{display:"grid",gap:13}}>
          <label>البريد الإلكتروني<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" style={input}/></label>
          <label>كلمة المرور<input required type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" style={input}/></label>
          <button disabled={loading} style={btn("#ff6a1a","#171717")}>{loading?"جاري التحقق...":"تسجيل الدخول"}</button>
        </form>{message&&<p role="status">{message}</p>}
      </section>:<>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <div><h1 style={{margin:"0 0 4px"}}>إدارة متجر STEPUP</h1><p style={{margin:0,color:"#666"}}>المنتجات والمخزون والطلبات والعملاء</p></div>
          <button onClick={()=>void checkAdmin()} style={btn("#222","#fff")}>تحديث البيانات ↻</button>
        </div>
        <nav style={{display:"flex",gap:8,flexWrap:"wrap",margin:"20px 0"}}>{[["dashboard","الرئيسية"],["products","المنتجات والمخزون"],["orders","الطلبات"],["leads","العملاء المهتمون"]].map(([key,label])=><button key={key} onClick={()=>setTab(key)} style={btn(tab===key?"#ff6a1a":"#fff",tab===key?"#171717":"#222")}>{label}</button>)}</nav>
        {message&&<p role="status" style={{background:"#fff",padding:12,borderRight:"4px solid #ff6a1a",overflowWrap:"anywhere"}}>{message}</p>}
        {loading&&<p>جاري تحديث البيانات...</p>}
        {tab==="dashboard"&&<section style={grid}>
          {[["عدد المنتجات",products.length],["إجمالي الكمية بالمخزون",products.reduce((s,p)=>s+Number(p.stock_quantity||0),0)],["الطلبات",orders.length],["طلبات جديدة",orders.filter(o=>o.status==="new").length],["طلبات تم تسليمها",orders.filter(o=>o.status==="delivered").length],["العملاء المهتمون",leads.length]].map(([label,n])=><div key={String(label)} style={stat}><span style={{color:"#666"}}>{label}</span><strong style={{fontSize:30}}>{n}</strong></div>)}
          <div style={{...stat,gridColumn:"1/-1"}}><strong>ملخص المبيعات المسجلة</strong><span>إجمالي قيمة الطلبات التي حالتها «تم التسليم»: {money(orders.filter(o=>o.status==="delivered").reduce((s,o)=>s+Number(o.unit_price)*Number(o.quantity),0))}</span><small style={{color:"#777"}}>التقرير يعتمد على الطلبات المسجلة في الموقع فقط.</small></div>
        </section>}
        {tab==="products"&&<div style={{display:"grid",gap:18}}>
          <section style={panel}><h2 style={{marginTop:0}}>{editing?"تعديل المنتج":"إضافة موديل جديد"}</h2><form onSubmit={saveProduct} style={formGrid}>
            <label>اسم الموديل *<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={input}/></label>
            <label>الفئة<select value={form.category} onChange={e=>setForm({...form,category:e.target.value})} style={input}><option value="رجالي">رجالي</option><option value="حريمي">حريمي</option><option value="أطفال">أطفال</option><option value="رجالي وحريمي">رجالي وحريمي</option><option value="يونيسكس">يونيسكس</option></select></label>
            <label>سعر الشراء<input type="number" min="0" step="0.01" value={form.purchase_price} onChange={e=>setForm({...form,purchase_price:e.target.value})} style={input}/></label>
            <label>سعر البيع<input required type="number" min="0" step="0.01" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} style={input}/></label>
            <label>سعر العرض (اختياري)<input type="number" min="0" step="0.01" value={form.sale_price} onChange={e=>setForm({...form,sale_price:e.target.value})} style={input}/></label>
            <label>سعر عرض القطعتين (الإجمالي)<input type="number" min="0" step="0.01" value={form.bundle_2_price} onChange={e=>setForm({...form,bundle_2_price:e.target.value})} placeholder="اختياري" style={input}/></label><label>سعر عرض 3 قطع (الإجمالي)<input type="number" min="0" step="0.01" value={form.bundle_3_price} onChange={e=>setForm({...form,bundle_3_price:e.target.value})} placeholder="اختياري" style={input}/></label><label>كمية المخزون<input required type="number" min="0" step="1" value={form.stock_quantity} onChange={e=>setForm({...form,stock_quantity:e.target.value})} style={input}/></label>
            <label>الألوان المتاحة (افصل بفاصلة)<input value={form.colors} onChange={e=>setForm({...form,colors:e.target.value})} placeholder="أسود، أبيض، بني" style={input}/></label>\n            <label>المقاسات المتاحة<input value={form.sizes} onChange={e=>setForm({...form,sizes:e.target.value})} placeholder="مثال: 40, 41, 42, 43" style={input}/></label>
            <label>رفع صور المنتج (اختار أكتر من صورة)<input type="file" accept="image/*" multiple onChange={e=>{void uploadImages(e.target.files);e.currentTarget.value="";}} style={input}/><small style={{display:"block",marginTop:5,color:"#777"}}>{uploadingImage?"جاري رفع الصور...":"كل صورة حتى 5 ميجابايت"}</small><div style={{display:"flex",gap:6,flexWrap:"wrap",marginTop:8}}>{form.image_urls.map((url,i)=><div key={url} style={{position:"relative"}}><img src={url} alt={"صورة "+(i+1)} style={{width:64,height:64,objectFit:"cover"}}/><button type="button" onClick={()=>setForm(old=>({...old,image_urls:old.image_urls.filter((_,j)=>j!==i),image_url:old.image_urls.filter((_,j)=>j!==i)[0]||""}))} style={{position:"absolute",top:0,left:0,border:0,background:"#fff",cursor:"pointer"}} aria-label="حذف الصورة">×</button></div>)}</div></label><label>رابط الصورة (اختياري)<input type="url" value={form.image_url} onChange={e=>setForm({...form,image_url:e.target.value})} placeholder="https://..." style={input}/></label>
            <label style={{gridColumn:"1/-1"}}>الوصف<textarea value={form.description} onChange={e=>setForm({...form,description:e.target.value})} style={{...input,minHeight:75}}/></label>
            <div style={{gridColumn:"1/-1",display:"flex",gap:8,flexWrap:"wrap"}}><button disabled={loading} style={btn("#ff6a1a","#171717")}>{editing?"حفظ التعديلات":"إضافة المنتج"}</button>{editing&&<button type="button" onClick={resetForm} style={btn("#eee","#222")}>إلغاء التعديل</button>}</div>
          </form></section>
          <section style={panel}><h2 style={{marginTop:0}}>قائمة المنتجات والمخزون</h2>{products.length===0?<p>مفيش منتجات لسه. استخدم النموذج لإضافة أول موديل.</p>:<div style={{overflowX:"auto"}}><table style={table}><thead><tr>{["الموديل","الفئة","سعر الشراء","سعر البيع","العرض","المخزون","المقاسات","الحالة","إجراء"].map(x=><th key={x} style={cell}>{x}</th>)}</tr></thead><tbody>{products.map(p=><tr key={p.id}><td style={cell}>{p.name}</td><td style={cell}>{p.category}</td><td style={cell}>{money(p.purchase_price)}</td><td style={cell}>{money(p.price)}</td><td style={cell}>{p.sale_price==null?"—":money(p.sale_price)}</td><td style={cell}>{p.stock_quantity}</td><td style={cell}>{p.sizes||"—"}</td><td style={cell}>{p.is_active?"نشط":"مخفي"}</td><td style={cell}><div style={{display:"flex",gap:6}}><button onClick={()=>editProduct(p)} style={btn("#eee","#222")}>تعديل</button><button onClick={()=>void toggleProduct(p)} style={btn(p.is_active?"#fee2e2":"#dcfce7","#222")}>{p.is_active?"إخفاء":"تفعيل"}</button></div></td></tr>)}</tbody></table></div>}</section>
        </div>}
        {tab==="orders"&&<section style={panel}><h2 style={{marginTop:0}}>متابعة الطلبات</h2>{orders.length===0?<p>لا توجد طلبات مسجلة حتى الآن.</p>:<div style={{overflowX:"auto"}}><table style={table}><thead><tr>{["رقم الطلب","العميل","الهاتف","العنوان","المنتج","المقاس","الكمية","الإجمالي","ملاحظات / اللون","تاريخ الطلب","الحالة","تغيير الحالة"].map(x=><th key={x} style={cell}>{x}</th>)}</tr></thead><tbody>{orders.map(o=><tr key={o.id}><td style={cell}>{o.order_number}</td><td style={cell}>{o.customer_name}</td><td style={cell}><a href={"https://wa.me/2"+o.customer_phone.replace(/\D/g,"")} target="_blank" rel="noreferrer">{o.customer_phone}</a></td><td style={{...cell,whiteSpace:"normal",minWidth:160}}>{o.customer_address}</td><td style={cell}>{o.product_name}</td><td style={cell}>{o.size||"—"}</td><td style={cell}>{o.quantity}</td><td style={cell}>{money(o.unit_price*o.quantity)}</td><td style={{...cell,whiteSpace:"normal",minWidth:160}}>{o.notes||"—"}</td><td style={cell}>{new Date(o.created_at).toLocaleDateString("ar-EG")}</td><td style={cell}>{statuses[o.status]||o.status}</td><td style={cell}><select value={o.status} onChange={e=>void updateOrder(o.id,e.target.value)} style={{padding:8,minWidth:120}}>{Object.entries(statuses).filter(([v])=>(allowedTransitions[o.status]||[o.status]).includes(v)).map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></td></tr>)}</tbody></table></div>}</section>}
        {tab==="leads"&&<section style={panel}><h2 style={{marginTop:0}}>العملاء المهتمون</h2>{leads.length===0?<p>لا توجد تسجيلات محفوظة حتى الآن.</p>:<div style={{overflowX:"auto"}}><table style={table}><thead><tr>{["الاسم","الموبايل","الإيميل","الاهتمام","المقاس","تاريخ التسجيل"].map(x=><th key={x} style={cell}>{x}</th>)}</tr></thead><tbody>{leads.map(x=><tr key={x.id}>{[x.name||"—",x.phone||"—",x.email||"—",x.interest,x.shoe_size||"—",new Date(x.created_at).toLocaleDateString("ar-EG")].map((v,i)=><td key={i} style={cell}>{v}</td>)}</tr>)}</tbody></table></div>}</section>}
      </>}
    </div>
  </main>;
}
const input:React.CSSProperties={display:"block",width:"100%",boxSizing:"border-box",marginTop:6,padding:11,border:"1px solid #d6d0c6",background:"#fffdf9",fontSize:15,fontFamily:"inherit"};
const btn=(background:string,color:string):React.CSSProperties=>({background,color,border:0,padding:"11px 14px",fontWeight:800,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap"});
const panel:React.CSSProperties={background:"#fff",padding:16,border:"1px solid #e4dfd6",marginBottom:4};
const stat:React.CSSProperties={display:"flex",flexDirection:"column",gap:8,background:"#fff",padding:18,border:"1px solid #e4dfd6",borderTop:"4px solid #ff6a1a"};
const grid:React.CSSProperties={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))",gap:12,marginTop:20};
const formGrid:React.CSSProperties={display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:12};
const table:React.CSSProperties={width:"100%",borderCollapse:"collapse",minWidth:800,textAlign:"right",fontSize:13};
const cell:React.CSSProperties={padding:"10px 8px",borderBottom:"1px solid #eee",whiteSpace:"nowrap"};
