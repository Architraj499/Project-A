// ======================================
// Asprients Updates Page
// updates.js
// ======================================

// ------------------------------
// Smooth Reveal Animation
// ------------------------------
import { APP } from "./config/version.js";

const version =
document.getElementById("version");

if(version){

    version.textContent =
    `${APP.NAME} v${APP.VERSION} (${APP.RELEASE})`;

}


const lastUpdatedEl =
document.getElementById("lastUpdated");
if(lastUpdatedEl){
    lastUpdatedEl.textContent = APP.UPDATE;
}



const revealElements = document.querySelectorAll(
".stat-card,.release-card,.update-card,.security-card,.list-item,.timeline-item,.roadmap-card,.feature-box"
);

const revealObserver = new IntersectionObserver((entries)=>{

entries.forEach(entry=>{

if(entry.isIntersecting){

entry.target.classList.add("show");

}

});

},{
threshold:.15
});

revealElements.forEach(el=>{

el.classList.add("hidden");

revealObserver.observe(el);

});

// ------------------------------
// Counter Animation
// ------------------------------

const counters=document.querySelectorAll(".stat-card h2");

counters.forEach(counter=>{

const text=counter.innerText;

const number=parseInt(text);

if(isNaN(number)) return;

counter.innerText="0";

let current=0;

const speed=Math.ceil(number/50);

const update=()=>{

current+=speed;

if(current<number){

counter.innerText=current;

requestAnimationFrame(update);

}else{

counter.innerText=text;

}

}

update();

});

// ------------------------------
// Back To Top Button
// ------------------------------

const topBtn=document.getElementById("backToTop");

window.addEventListener("scroll",()=>{

if(window.scrollY>400){

topBtn.style.opacity="1";

topBtn.style.pointerEvents="auto";

}else{

topBtn.style.opacity="0";

topBtn.style.pointerEvents="none";

}

});

topBtn.addEventListener("click",()=>{

window.scrollTo({

top:0,

behavior:"smooth"

});

});

// ------------------------------
// Navbar Active Highlight
// ------------------------------

const sections=document.querySelectorAll("section");

const navLinks=document.querySelectorAll("nav a");

window.addEventListener("scroll",()=>{

let current="";

sections.forEach(section=>{

const top=section.offsetTop-150;

const height=section.clientHeight;

if(scrollY>=top){

current=section.getAttribute("id");

}

});

navLinks.forEach(link=>{

link.classList.remove("active-scroll");

if(link.getAttribute("href")==="#"+current){

link.classList.add("active-scroll");

}

});

});

// ------------------------------
// Latest Release Glow
// ------------------------------

const release=document.querySelector(".release-card");

if(release){

setInterval(()=>{

release.classList.toggle("pulse");

},2500);

}

// ------------------------------
// Random Floating Rotation
// ------------------------------

document.querySelectorAll(".blob").forEach(blob=>{

let angle=Math.random()*360;

setInterval(()=>{

angle+=0.2;

blob.style.transform=`rotate(${angle}deg)`;

},30);

});

// ------------------------------
// Stagger Cards
// ------------------------------

const cards=document.querySelectorAll(".update-card");

cards.forEach((card,index)=>{

card.style.transitionDelay=`${index*80}ms`;

});

// ------------------------------
// Hover Sound (Optional)
// ------------------------------

document.querySelectorAll(".update-card,.roadmap-card").forEach(card=>{

card.addEventListener("mouseenter",()=>{

card.style.transform="translateY(-10px) scale(1.02)";

});

card.addEventListener("mouseleave",()=>{

card.style.transform="";

});

});

// ------------------------------
// Console Signature
// ------------------------------

console.log(
"%c🚀 Asprients",
"font-size:22px;color:#8b5cf6;font-weight:bold;"
);

console.log(
"%cVersion 1.0.0",
"font-size:14px;color:#06b6d4;"
);

console.log(
"%cDeveloped by Archit",
"font-size:13px;color:#22c55e;"
);