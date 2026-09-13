const header=document.getElementById("header");
const menuBtn=document.getElementById("menuBtn");
const mobileMenu=document.getElementById("mobileMenu");
addEventListener("scroll",()=>header.classList.toggle("scrolled",scrollY>24));
menuBtn.addEventListener("click",()=>{const open=mobileMenu.classList.toggle("open");document.body.classList.toggle("menu-open",open);});
mobileMenu.querySelectorAll("a").forEach(a=>a.addEventListener("click",()=>{mobileMenu.classList.remove("open");document.body.classList.remove("menu-open");}));
const io=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("visible");io.unobserve(e.target)}}),{threshold:.12,rootMargin:"0px 0px -45px 0px"});
document.querySelectorAll(".reveal").forEach(el=>io.observe(el));
document.getElementById("year").textContent=new Date().getFullYear();