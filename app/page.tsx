
export default function Home() {
  return (
    <main dir="rtl" style={{background:"#111",color:"white",minHeight:"100vh",fontFamily:"Arial",padding:"30px"}}>
      <h2 style={{fontSize:"32px"}}>STEP<span style={{color:"#ff6a1a"}}>UP</span></h2>
      <p style={{color:"#ff6a1a"}}>MOVE WITH CONFIDENCE</p>
      <h1 style={{fontSize:"48px"}}>MORE THAN<br/>JUST SHOES.</h1>
      <p>خطوتك الجاية تبدأ من هنا.</p>
      <a href="#products" style={{background:"#ff6a1a",color:"#111",padding:"14px",display:"inline-block",textDecoration:"none"}}>اكتشف منتجاتنا</a>
      <section id="products" style={{marginTop:"60px"}}>
        <h2>قريبًا — مجموعة STEPUP</h2>
        <p>ستايلك. اختيارك. خطوتك.</p>
        <a href="https://wa.me/201274907577" style={{color:"#ff6a1a"}}>تواصل معنا على واتساب</a>
      </section>
    </main>
  );
}

