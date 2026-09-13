const h=document.getElementById("header"),b=document.getElementById("menuBtn"),m=document.getElementById("mobileMenu");
addEventListener("scroll",()=>h.classList.toggle("scrolled",scrollY>24));
b.addEventListener("click",()=>{const o=m.classList.toggle("open");document.body.classList.toggle("menu-open",o);b.setAttribute("aria-expanded",String(o))});
m.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{m.classList.remove("open");document.body.classList.remove("menu-open")}));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target)}}),{threshold:.12,rootMargin:"0px 0px -45px 0px"});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));
document.getElementById("year").textContent=new Date().getFullYear();
