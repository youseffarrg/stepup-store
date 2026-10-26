"use client";
// STEPUP deployment trigger: build fix follow-up

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type Product = { id:number; name:string; description:string; category:string; image_url:string; image_urls?:string[]; price:number; sale_price:number|null; bundle_2_price:number|null; bundle_3_price:number|null; stock_quantity:number; sizes:string; is_active:boolean };
function priceOf(p:Product){return p.sale_price!=null&&Number(p.sale_price)>0?Number(p.sale_price):Number(p.price||0);}

export default function ProductsPage(){
  const [products,setProducts]=useState<Product[]>([]); const [loading,setLoading]=useState(true); const [error,setError]=useState("");
  const [search,setSearch]=useState(""); const [selected,setSelected]=useState<Product|null>(null); const [imageIndexes,setImageIndexes]=useState<Record<number,number>>({}); const [lightbox,setLightbox]=useState<{images:string[];index:number;name:string}|null>(null);
  const [customer,setCustomer]=useState({name:"",phone:"",address:"",size:"",notes:""}); const [quantity,setQuantity]=useState(1);
  const [sending,setSending]=useState(false); const [orderMessage,setOrderMessage]=useState("");
  useEffect(()=>{let alive=true;async function load(){if(!supabase){setError("إعدادات قاعدة البيانات غير مكتملة.");setLoading(false);return;}
    const {data,error}=await supabase.from("stepup_products").select("id,name,description,category,image_url,image_urls,price,sale_price,bundle_2_price,bundle_3_price,stock_quantity,sizes,is_active").eq("is_active",true).order("created_at",{ascending:false}).limit(100);
    if(!alive)return;if(error)setError("مش قادرين نعرض المنتجات حاليًا. راجع جدول stepup_products وصلاحياته في Supabase.");else setProducts((data||[]) as Product[]);setLoading(false);}
    void load();return()=>{alive=false;};},[]);
  const visible=useMemo(()=>products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())),[products,search]);
  useEffect(()=>{const timer=setInterval(()=>setImageIndexes(old=>{const next={...old};for(const p of products){const imgs=(p.image_urls?.length?p.image_urls:(p.image_url?[p.image_url]:[]));if(imgs.length>1)next[p.id]=((old[p.id]||0)+1)%imgs.length;}return next;}),3000);return()=>clearInterval(timer);},[products]);
  function imagesOf(p:Product){return p.image_urls?.length?p.image_urls:(p.image_url?[p.image_url]:[]);}
  async function order(){
    if(!supabase||!selected||!customer.name.trim()||!customer.phone.trim()||!customer.address.trim())return;
    if(selected.stock_quantity<quantity){setOrderMessage("الكمية المطلوبة أكبر من المتاح في المخزون.");return;}
    setSending(true);setOrderMessage("");
    const unitPrice=priceOf(selected); const bundleTotal=quantity===3&&selected.bundle_3_price!=null?Number(selected.bundle_3_price):quantity===2&&selected.bundle_2_price!=null?Number(selected.bundle_2_price):unitPrice*quantity; const effectiveUnitPrice=bundleTotal/quantity;
    const {error}=await supabase.from("stepup_orders").insert({
      product_id:selected.id,product_name:selected.name,quantity,unit_price:effectiveUnitPrice,
      customer_name:customer.name.trim(),customer_phone:customer.phone.trim(),customer_address:customer.address.trim(),
      size:customer.size.trim(),notes:customer.notes.trim(),status:"new",payment_method:"cash_on_delivery"
    });
    setSending(false);
    if(error){setOrderMessage("لم نتمكن من حفظ الطلب في النظام: "+error.message);return;}
    const text=["طلب جديد من متجر STEPUP","رقم الطلب: سيتم تأكيده من المتجر","المنتج: "+selected.name,"الكمية: "+quantity+" قطعة","إجمالي السعر: "+bundleTotal+" جنيه","المقاس: "+(customer.size||"يُحدد بالتواصل"),"الاسم: "+customer.name,"الموبايل: "+customer.phone,"العنوان: "+customer.address,"ملاحظات: "+(customer.notes||"لا يوجد"),"الدفع: عند الاستلام"].join("\n");
    window.open("https://wa.me/201274907577?text="+encodeURIComponent(text),"_blank","noopener,noreferrer");
    setOrderMessage("تم تسجيل طلبك بنجاح. افتح واتساب لإرسال تفاصيله وتأكيده.");
    setSelected(null);setCustomer({name:"",phone:"",address:"",size:"",notes:""});setQuantity(1);
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
        {visible.map(p=>{const imgs=imagesOf(p);const idx=(imageIndexes[p.id]||0)%Math.max(imgs.length,1);return <article key={p.id} style={{background:"#fff",padding:14,border:"1px solid #e5e0d8"}}>
          {imgs.length?<div style={{position:"relative"}}><button type="button" onClick={()=>setLightbox({images:imgs,index:idx,name:p.name})} aria-label="تكبير الصورة" style={{display:"block",padding:0,border:0,background:"transparent",width:"100%",cursor:"zoom-in"}}><img src={imgs[idx]} alt={p.name+" - صورة "+(idx+1)} style={{width:"100%",height:220,objectFit:"contain",background:"#f7f7f7",display:"block"}}/></button>{imgs.length>1&&<><button type="button" aria-label="الصورة السابقة" onClick={()=>setImageIndexes(old=>({...old,[p.id]:(idx-1+imgs.length)%imgs.length}))} style={{position:"absolute",right:8,top:"45%",border:0,borderRadius:"50%",width:32,height:32,background:"#fff",cursor:"pointer"}}>›</button><button type="button" aria-label="الصورة التالية" onClick={()=>setImageIndexes(old=>({...old,[p.id]:(idx+1)%imgs.length}))} style={{position:"absolute",left:8,top:"45%",border:0,borderRadius:"50%",width:32,height:32,background:"#fff",cursor:"pointer"}}>‹</button><div style={{display:"flex",justifyContent:"center",gap:5,marginTop:7}}>{imgs.map((url,i)=><button type="button" key={url+i} onClick={()=>setImageIndexes(old=>({...old,[p.id]:i}))} aria-label={"عرض الصورة "+(i+1)} style={{width:8,height:8,padding:0,border:0,borderRadius:"50%",background:i===idx?"#ff6a1a":"#ccc"}}/>)}</div></>}</div>:<div style={{height:220,display:"grid",placeItems:"center",background:"#e8e2d8",color:"#ff6a1a",fontSize:42,fontWeight:900}}>STEPUP</div>}
          <h2 style={{fontSize:18,margin:"14px 0 5px"}}>{p.name}</h2><p style={{margin:"0 0 8px",color:"#666"}}>{p.category}</p>
          <p style={{margin:"0 0 8px",fontWeight:800}}>{priceOf(p).toLocaleString("ar-EG")+" جنيه"}{p.sale_price!=null&&Number(p.sale_price)>0&&Number(p.sale_price)<Number(p.price)&&<small style={{marginRight:8,color:"#777",textDecoration:"line-through"}}>{Number(p.price).toLocaleString("ar-EG")}</small>}</p>
          <p style={{fontSize:13,color:p.stock_quantity>0?"#26734d":"#a33"}}>{p.stock_quantity>0?"متاح — "+p.stock_quantity+" قطعة":"غير متوفر حاليًا"}</p>
          <button disabled={p.stock_quantity<1} onClick={()=>{setSelected(p);setOrderMessage("");}} style={{width:"100%",padding:13,background:p.stock_quantity>0?"#ff6a1a":"#bbb",border:0,font:"inherit",fontWeight:800,cursor:p.stock_quantity>0?"pointer":"not-allowed"}}>اطلب المنتج</button>
        </article>})}
      </div>
      {lightbox&&<div role="dialog" aria-modal="true" aria-label="عرض صورة المنتج" onClick={()=>setLightbox(null)} style={{position:"fixed",inset:0,zIndex:50,background:"#000e",display:"grid",placeItems:"center",padding:16}}><button type="button" onClick={()=>setLightbox(null)} aria-label="إغلاق الصورة" style={{position:"absolute",top:16,left:18,border:0,borderRadius:"50%",width:42,height:42,fontSize:28,cursor:"pointer"}}>×</button>{lightbox.images.length>1&&<button type="button" onClick={e=>{e.stopPropagation();setLightbox(old=>old?({...old,index:(old.index-1+old.images.length)%old.images.length}):old);}} aria-label="الصورة السابقة" style={{position:"absolute",right:12,top:"50%",fontSize:30,border:0,borderRadius:"50%",width:44,height:44,cursor:"pointer"}}>›</button>}<img src={lightbox.images[lightbox.index]} alt={lightbox.name} onClick={e=>e.stopPropagation()} style={{maxWidth:"92vw",maxHeight:"82vh",objectFit:"contain",cursor:"zoom-out"}}/>{lightbox.images.length>1&&<button type="button" onClick={e=>{e.stopPropagation();setLightbox(old=>old?({...old,index:(old.index+1)%old.images.length}):old);}} aria-label="الصورة التالية" style={{position:"absolute",left:12,top:"50%",fontSize:30,border:0,borderRadius:"50%",width:44,height:44,cursor:"pointer"}}>‹</button>}<p style={{position:"absolute",bottom:8,color:"#fff"}}>{lightbox.name} — {lightbox.index+1} / {lightbox.images.length}</p></div>}
      {orderMessage&&<p role="status" style={{marginTop:18,padding:14,background:"#fff",borderRight:"4px solid #ff6a1a",overflowWrap:"anywhere"}}>{orderMessage}</p>}
    </section>
    {selected&&<div role="dialog" aria-modal="true" aria-label="نموذج الطلب" style={{position:"fixed",inset:0,background:"#0009",zIndex:20,display:"grid",placeItems:"center",padding:16}}>
      <section style={{background:"#f5f2ec",width:"min(100%,520px)",maxHeight:"90vh",overflow:"auto",padding:22}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:10}}><h2 style={{marginTop:0}}>طلب {selected.name}</h2><button onClick={()=>setSelected(null)} aria-label="إغلاق" style={{border:0,background:"transparent",fontSize:24}}>×</button></div>
        <p>سعر القطعة: {priceOf(selected)} جنيه — الدفع عند الاستلام</p><label style={{display:"block",marginTop:12}}>الكمية المطلوبة<select value={quantity} onChange={e=>setQuantity(Number(e.target.value))} style={inputStyle}>{Array.from({length:Math.min(3,selected.stock_quantity)},(_,i)=>i+1).map(n=><option key={n} value={n}>{n} {n===1?"قطعة":"قطع"}</option>)}</select></label><div style={{marginTop:10,padding:12,background:"#fff"}}>{quantity===2&&selected.bundle_2_price!=null?<>عرض القطعتين: <strong>{Number(selected.bundle_2_price)} جنيه</strong></>:quantity===3&&selected.bundle_3_price!=null?<>عرض الثلاث قطع: <strong>{Number(selected.bundle_3_price)} جنيه</strong></>:<>الإجمالي: <strong>{priceOf(selected)*quantity} جنيه</strong></>}</div>
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
