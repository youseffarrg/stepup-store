"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type Product = { id:number; name:string; description:string; category:string; image_url:string; price:number; sale_price:number|null; stock_quantity:number; sizes:string; is_active:boolean };
function priceOf(p:Product){return p.sale_price!=null&&Number(p.sale_price)>0?Number(p.sale_price):Number(p.price||0);}

export default function ProductsPage(){
  const [products,setProducts]=useState<Product[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  const [search,setSearch]=useState(""); const [selected,setSelected]=useState<Product|null>(null);
  const [customer,setCustomer]=useState({name:"",phone:"",address:"",size:"",notes:""});
  const [sending,setSending]=useState(false); const [orderMessage,setOrderMessage]=useState("");
  useEffect(()=>{let alive=true;async function load(){if(!supabase){setError("إعدادات قاعدة البيانات غير مكتملة.");setLoading(false);return;}
    const {data,error}=await supabase.from("stepup_products").select("id,name,description,category,image_url,price,sale_price,stock_quantity,sizes,is_active").eq("is_active",true).order("created_at",{ascending:false}).limit(100);
    if(!alive)return;if(error)setError("مش قادرين نعرض المنتجات حاليًا. راجع جدول stepup_products وصلاحياته في Supabase.");else setProducts((data||[]) as Product[]);setLoading(false);}
    void load();return()=>{alive=false;};},[]);
  const visible=useMemo(()=>products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())),[products,search]);
  async function order(){
    if(!supabase||!selected||!customer.name.trim()||!customer.phone.trim()||!customer.address.trim())return;
    if(selected.stock_quantity<1){setOrderMessage("المنتج غير متوفر في المخزون حاليًا.");return;}
    setSending(true);setOrderMessage("");
    const unitPrice=priceOf(selected);
    const {data,error}=await supabase.from("stepup_orders").insert({
      product_id:selected.id,product_name:selected.name,quantity:1,unit_price:unitPrice,
      customer_name:customer.name.trim(),customer_phone:customer.phone.trim(),customer_address:customer.address.trim(),
      size:customer.size.trim(),notes:customer.notes.trim(),status:"new",payment_method:"cash_on_delivery"
    }).select("order_number").single();
    setSending(false);
    if(error){setOrderMessage("لم نتمكن من حفظ الطلب في النظام: "+error.message);return;}
    const text=["طلب جديد من متجر STEPUP","رقم الطلب: "+(data?.order_number||"سيتم تأكيده من المتجر"),"المنتج: "+selected.name,"السعر: "+unitPrice+" جنيه","المقاس: "+(customer.size||"يُحدد بالتواصل"),"الاسم: "+customer.name,"الموبايل: "+customer.phone,"العنوان: "+customer.address,"ملاحظات: "+(customer.notes||"لا يوجد"),"الدفع: عند الاستلام"].join("\n");
    window.open("https://wa.me/201274907577?text="+encodeURIComponent(text),"_blank","noopener,noreferrer");
    setOrderMessage("تم تسجيل طلبك بنجاح. افتح واتساب لإرسال تفاصيله وتأكيده.");
    setSelected(null);setCustomer({name:"",phone:"",address:"",size:"",notes:""});
  }
  const inputStyle={width:"100%",padding:"12px",border:"1px solid #ddd",background:"#fff",borderRadius:0,font:"inherit",marginTop:"5px",boxSizing:"border-box" as const};
  return <main dir="rtl" style={{minHeight:"100vh",background:"#f5f2ec",color:"#151515"}}>
    <header style={{padding:"20px 6%",display:"flex",justifyContent:"space-between",alignItems:"center",borderBottom:"1px solid #ddd",gap:12,flexWrap:"wrap"}}>
      <Link href="/" style={{fontSize:25,fontWeight:900,letterSpacing:-1}}>STEP<span style={{color:"#ff6a1a"}}>UP</span></Link><Link href="/" style={{fontWeight:700}}>الصفحة الرئيسية ←</Link>
    </header>
    <section style={{padding:"38px 6% 20px",background:"#151515",color:"#fff"}}><p style={{color:"#ff6a1a",fontSize:12,letterSpacing:2}}>STEPUP / THE COLLECTION</p><h1 style={{fontSize:"clamp(32px,6vw,56px)",margin:"8px 0"}}>اختار خطوتك الجاية.</h1><p style={{color:"#ccc",lineHeight:1.9}}>اختار المنتج والمقاس، وسجّل طلبك. هنفتح واتساب لإرسال التفاصيل وتأكيد الطلب. الدفع عند الاستلام.</p></section>
    <section style={{padding:"28px 6%"}}>
      <input aria-label="ابحث عن منتج" value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث عن موديل..." style={{...inputStyle,maxWidth:440}}/>
      {loading&&<p>جاري تحميل المنتجات...</p>}
      {!loading&&error&&<div style={{padding:18,background:"#fff",marginTop:18,borderRight:"4px solid #ff6a1a",lineHeight:1.9}}><strong>الكتالوج محتاج إعداد بسيط</strong><p>{error}</p></div>}
      {!loading&&!error&&visible.length===0&&<p style={{padding:"24px 0"}}>مفيش منتجات ظاهرة حاليًا. أضف موديلات من لوحة التحكم.</p>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:16,marginTop:22}}>
        {visible.map(p=><article key={p.id} style={{background:"#fff",padding:14,border:"1px solid #e5e0d8"}}>
          {p.image_url?<img src={p.image_url} alt={p.name} style={{width:"100%",height:220,objectFit:"cover",background:"#eee"}}/>:<div style={{height:220,display:"grid",placeItems:"center",background:"#e8e2d8",color:"#ff6a1a",fontSize:42,fontWeight:900}}>STEPUP</div>}
          <h2 style={{fontSize:18,margin:"14px 0 5px"}}>{p.name}</h2><p style={{margin:"0 0 8px",color:"#666"}}>{p.category}</p>
          <p style={{margin:"0 0 8px",fontWeight:800}}>{priceOf(p).toLocaleString("ar-EG")+" جنيه"}{p.sale_price!=null&&Number(p.sale_price)>0&&Number(p.sale_price)<Number(p.price)&&<small style={{marginRight:8,color:"#777",textDecoration:"line-through"}}>{Number(p.price).toLocaleString("ar-EG")}</small>}</p>
          <p style={{fontSize:13,color:p.stock_quantity>0?"#26734d":"#a33"}}>{p.stock_quantity>0?"متاح — "+p.stock_quantity+" قطعة":"غير متوفر حاليًا"}</p>
          <button disabled={p.stock_quantity<1} onClick={()=>{setSelected(p);setOrderMessage("");}} style={{width:"100%",padding:13,background:p.stock_quantity>0?"#ff6a1a":"#bbb",border:0,font:"inherit",fontWeight:800,cursor:p.stock_quantity>0?"pointer":"not-allowed"}}>اطلب المنتج</button>
        </article>)}
      </div>
      {orderMessage&&<p role="status" style={{marginTop:18,padding:14,background:"#fff",borderRight:"4px solid #ff6a1a",overflowWrap:"anywhere"}}>{orderMessage}</p>}
    </section>
    {selected&&<div role="dialog" aria-modal="true" aria-label="نموذج الطلب" style={{position:"fixed",inset:0,background:"#0009",zIndex:20,display:"grid",placeItems:"center",padding:16}}>
      <section style={{background:"#f5f2ec",width:"min(100%,520px)",maxHeight:"90vh",overflow:"auto",padding:22}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:10}}><h2 style={{marginTop:0}}>طلب {selected.name}</h2><button onClick={()=>setSelected(null)} aria-label="إغلاق" style={{border:0,background:"transparent",fontSize:24}}>×</button></div>
        <p>السعر: {priceOf(selected)} جنيه — الدفع عند الاستلام</p>
        <form onSubmit={e=>{e.preventDefault();void order();}}>
          <label style={{display:"block",marginTop:12}}>الاسم الكامل<input required value={customer.name} onChange={e=>setCustomer({...customer,name:e.target.value})} style={inputStyle}/></label>
          <label style={{display:"block",marginTop:12}}>رقم الموبايل<input required inputMode="tel" value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value})} style={inputStyle}/></label>
          <label style={{display:"block",marginTop:12}}>العنوان بالتفصيل<textarea required value={customer.address} onChange={e=>setCustomer({...customer,address:e.target.value})} style={{...inputStyle,minHeight:75}}/></label>
          <label style={{display:"block",marginTop:12}}>المقاس المطلوب<input value={customer.size} onChange={e=>setCustomer({...customer,size:e.target.value})} placeholder="مثال: 42" style={inputStyle}/></label>
          <label style={{display:"block",marginTop:12}}>ملاحظات إضافية<textarea value={customer.notes} onChange={e=>setCustomer({...customer,notes:e.target.value})} style={inputStyle}/></label>
          {orderMessage&&<p role="status" style={{overflowWrap:"anywhere"}}>{orderMessage}</p>}
          <button type="submit" disabled={sending||!customer.name.trim()||!customer.phone.trim()||!customer.address.trim()} style={{width:"100%",marginTop:18,padding:15,background:"#151515",color:"#fff",border:0,font:"inherit",fontWeight:800,cursor:"pointer"}}>{sending?"جاري حفظ الطلب...":"تسجيل الطلب وفتح واتساب ↗"}</button>
        </form>
      </section>
    </div>}
    <footer style={{background:"#151515",color:"#ccc",padding:24,textAlign:"center"}}>STEPUP — MOVE WITH CONFIDENCE</footer>
  </main>;
}
