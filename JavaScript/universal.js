// universal.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ---------- Firebase config ----------
const firebaseConfig = {
    apiKey: "AIzaSyDHRDRRm2KBmCuUf3qvTIRI5hO0aXFFx3w",
    authDomain: "asprients-95c1f.firebaseapp.com",
    projectId: "asprients-95c1f",
    storageBucket: "asprients-95c1f.appspot.com",
    messagingSenderId: "453218332819",
    appId: "1:453218332819:web:5740173fa4d8156dae9d66"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUserId = null;
const LECTURES = window.LECTURES || [];

// ---------- UI Helpers ----------
function escapeHtml(s){ return (s||'').replace(/"/g,'&quot;').replace(/'/g,"&apos;"); }

function updateOverall(){ 
  const avg = Math.round((LECTURES.reduce((s,l)=>s+(l.progress||0),0)/LECTURES.length)*100);
  const overallPercentEl = document.getElementById('overallPercent');
  const ringPercentEl = document.getElementById('ringPercent');
  const overallBarEl = document.getElementById('overallBar');
  if(overallPercentEl) overallPercentEl.innerText = avg+'%';
  if(ringPercentEl) ringPercentEl.innerText = avg+'%';
  if(overallBarEl) overallBarEl.style.width = avg+'%';
}

// ---------- Render cards ----------
function renderAll(){
  const grid=document.getElementById('cardsGrid');
  const notesGrid=document.getElementById('notesGrid');
  const pyqGrid=document.getElementById('pyqGrid');
  if(!grid) return;

  grid.innerHTML=''; 
  if(notesGrid) notesGrid.innerHTML=''; 
  if(pyqGrid) pyqGrid.innerHTML='';

  LECTURES.forEach(l=>{
    const div=document.createElement('div'); div.className='card';
    div.innerHTML=`
      <div class="row">
        <div class="badge">CH • ${l.id}</div>
        <div class="muted">${l.teacher}</div>
      </div>
      <div class="chapter-title">${l.title}</div>
      <div class="muted">Lecture: 1 • Duration — ${l.min}</div>
      <div style="display:flex; gap:12px; align-items:center">
        <div class="ring">${Math.round((l.progress||0)*100)}%</div>
        <div style="flex:1"><div class="progress"><i style="width:${(l.progress||0)*100}%"></i></div></div>
      </div>
      <div class="actions">
        <button class="small play" onclick="openVideo('${escapeHtml(l.video)}','${escapeHtml(l.title)}','${l.id}')">Play</button>
        <a class="small view" href="${l.notes}" target="_blank">Notes</a>
        <a class="small view" href="${l.pyq}" target="_blank">PYQ</a>
      </div>`;
    grid.appendChild(div);

    if(notesGrid){
      const n=document.createElement('div'); n.className='card';
      n.innerHTML=`<div class="badge">Notes</div><div class="chapter-title">${l.title}</div><div class="muted">Format: PDF / Doc</div><div class="actions"><a class="small view" href="${l.notes}" target="_blank">Open</a></div>`;
      notesGrid.appendChild(n);
    }

    if(pyqGrid){
      const p=document.createElement('div'); p.className='card';
      p.innerHTML=`<div class="badge">PYQ</div><div class="chapter-title">${l.title}</div><div class="muted">Yearwise PYQs</div><div class="actions"><a class="small view" href="${l.pyq}" target="_blank">Open</a></div>`;
      pyqGrid.appendChild(p);
    }
  });

  updateOverall();
}

// ---------- Video modal ----------
function openVideoOriginal(rawUrl,title){
  if(!rawUrl){ alert('Video will be uploaded soon.'); return; }
  const iframe=document.getElementById('videoIframe');
  const modal=document.getElementById('videoModal');
  if(document.getElementById('modalTitle')) document.getElementById('modalTitle').innerText = title||'Lecture';
  let embed=rawUrl;
  if(!embed.includes('embed')){
    const m=rawUrl.match(/[?&]v=([A-Za-z0-9_-]+)/)||rawUrl.match(/youtu\.be\/([A-Za-z0-9_-]+)/);
    if(m&&m[1]) embed='https://www.youtube-nocookie.com/embed/'+m[1];
  }
  const sep=embed.includes('?')?'&':'?';
  if(iframe) iframe.src=embed+sep+'autoplay=1&rel=0&modestbranding=1';
  if(modal){ modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
}

// ---------- Close modal ----------
function closeModal(){ 
  const iframe=document.getElementById('videoIframe'); 
  const modal=document.getElementById('videoModal');
  if(iframe) iframe.src=''; 
  if(modal){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }
  document.body.style.overflow='';
  stopLectureTimer(); // stop lecture timer
}

// ---------- Tabs & filters ----------
function openTab(e){ 
  const tab=e.currentTarget.dataset.tab; 
  document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active', t.dataset.tab===tab)); 
  document.querySelectorAll('.tabpanel').forEach(p=>p.style.display=p.id===tab?'':'none'); 
}

function filterBy(mode, event){ 
  // 1️⃣ Active tab switch
  document.querySelectorAll('.tab').forEach(btn => btn.classList.remove('active'));
  if(event && event.target) event.target.classList.add('active');

  // 2️⃣ Filter logic
  document.querySelectorAll('#cardsGrid .card').forEach((card, idx) => {
    const prog = LECTURES[idx].progress || 0;
    if(mode === 'completed') card.style.display = prog >= 0.99 ? '' : 'none';
    else if(mode === 'pending') card.style.display = prog < 0.99 ? '' : 'none';
    else card.style.display = '';
  });
}

// ---------- Lecture progress ----------
async function saveLectureProgress(lectureId, value){
  if(!currentUserId) return;
  try{
    const userRef = doc(db, "users", currentUserId);
    await updateDoc(userRef, { [`progress.${lectureId}`]: value });
  } catch(err){ console.error(err); }
}

function markCompleted(lectureId){
  const lec = LECTURES.find(l => l.id === lectureId);
  if(!lec) return;
  if(lec.progress < 1){ lec.progress = 1; updateOverall(); }
  renderAll();
  saveLectureProgress(lectureId,1);
}

// // ---------- Timers ----------
// let siteSeconds = 0, siteTimerInterval = null;
// let lectureSeconds = 0, lectureTimerInterval = null;

// // Format seconds to hh:mm:ss
// function formatTime(seconds){
//   const h = Math.floor(seconds / 3600);
//   const m = Math.floor((seconds % 3600) / 60);
//   const s = seconds % 60;
//   return `${h}h ${m}m ${s}s`;
// }

// // ---------- Site timer ----------
// function updateTimeDisplay() {
//   const siteEl = document.getElementById("websiteTime");
//   if(siteEl) siteEl.innerText = formatTime(siteSeconds);
// }

// async function saveTimeToFirestore() {
//   if(!currentUserId) return;
//   try{
//     const userRef = doc(db, "users", currentUserId);
//     await updateDoc(userRef, { totalSiteSeconds: siteSeconds });
//   } catch(err){ console.error(err); }
// }

// function startSiteTimer() {
//   if(siteTimerInterval) clearInterval(siteTimerInterval);
//   siteTimerInterval = setInterval(()=>{
//     siteSeconds++;
//     updateTimeDisplay();
//     saveTimeToFirestore();
//   }, 1000);
// }

// // ---------- Lecture timer ----------
// function updateLectureTimeDisplay() {
//   const lecEl = document.getElementById("lectureTime");
//   if(lecEl) lecEl.innerText = formatTime(lectureSeconds);
// }

// async function saveLectureTimeToFirestore() {
//   if(!currentUserId) return;
//   try{
//     const userRef = doc(db, "users", currentUserId);
//     await updateDoc(userRef, { totalLectureSeconds: lectureSeconds });
//   } catch(err){ console.error(err); }
// }

// function startLectureTimer() {
//   if(lectureTimerInterval) clearInterval(lectureTimerInterval);
//   lectureTimerInterval = setInterval(()=>{
//     lectureSeconds++;
//     updateLectureTimeDisplay();
//     saveLectureTimeToFirestore();
//   }, 1000);
// }

// function stopLectureTimer() {
//   clearInterval(lectureTimerInterval);
//   lectureTimerInterval = null;
// }

// // ---------- Global wrapper ----------
// window.openVideoOriginal = openVideoOriginal;
// window.openVideo = function(rawUrl, title, lectureId){
//   openVideoOriginal(rawUrl, title);
//   if(lectureId) markCompleted(lectureId);
//   startLectureTimer();
// };
// window.closeModal = closeModal;
// window.filterBy = filterBy;
// window.openTab = openTab;

// ---------- Search & Theme ----------
document.addEventListener('DOMContentLoaded', ()=>{
  renderAll();

  document.getElementById('searchInput')?.addEventListener('input',(ev)=>{
    const q = ev.target.value.trim().toLowerCase();
    document.querySelectorAll('#cardsGrid .card').forEach(card=>{
      const title = card.querySelector('.chapter-title').innerText.toLowerCase();
      card.style.display = title.includes(q) ? '' : 'none';
    });
  });

  const themeToggleEl = document.getElementById('themeToggle');
  if(themeToggleEl){
    if(localStorage.getItem('theme')){
      document.body.setAttribute('data-theme', localStorage.getItem('theme'));
      themeToggleEl.textContent = localStorage.getItem('theme') === 'dark' ? '🌙' : '☀️';
    }
    themeToggleEl.addEventListener('click', ()=>{
      let currentTheme = document.body.getAttribute('data-theme');
      if(currentTheme === 'dark'){
        document.body.setAttribute('data-theme', 'light');
        themeToggleEl.textContent = '🌙';
        localStorage.setItem('theme','light');
      } else {
        document.body.setAttribute('data-theme', 'dark');
        themeToggleEl.textContent = '☀️';
        localStorage.setItem('theme','dark');
      }
    });
  }

  document.getElementById('videoModal')?.addEventListener('click',(e)=>{ if(e.target===e.currentTarget) closeModal(); });
  document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeModal(); });

  document.getElementById("logoutBtn")?.addEventListener("click", async ()=>{
    try{ await signOut(auth); }catch(err){ console.error(err); }
    window.location.href = "index.html";
  });
});

// ---------- Auth listener ----------
onAuthStateChanged(auth, async (user) => {
  if(user){
    currentUserId = user.uid;
    try{
      const snap = await getDoc(doc(db, "users", currentUserId));
      if(snap.exists()){
        const data = snap.data();
        siteSeconds = data.totalSiteSeconds || 0;
        lectureSeconds = data.totalLectureSeconds || 0;
        if(data.fullname){
          const nameEl = document.getElementById('usernameDisplay');
          if(nameEl) nameEl.innerText = data.fullname;
        }
      }
    } catch(err){ console.error(err); }
  }
  // // updateTimeDisplay();
  // updateLectureTimeDisplay();
  // startSiteTimer();
});

// ---------- Asprients Custom Video Player (Global) ----------

const playerModal = document.getElementById('playerModal');
const player = document.getElementById('customPlayer');
const playerSource = document.getElementById('playerSource');
const playerTitle = document.getElementById('playerTitle');

window.openPlayer = function (src, title) {
  if (!playerModal || !player || !playerSource) return;
  playerSource.src = src;
  playerTitle.textContent = title || "Lecture";
  player.load();
  playerModal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
};

window.closePlayer = function () {
  if (!playerModal || !player) return;
  player.pause();
  playerModal.classList.add('hidden');
  document.body.style.overflow = 'auto';
};
