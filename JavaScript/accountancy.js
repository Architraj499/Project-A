
// ---------- Firebase imports ----------
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ---------- Firebase config (your values) ----------
const firebaseConfig = {
    apiKey: "AIzaSyDHRDRRm2KBmCuUf3qvTIRI5hO0aXFFx3w",
    authDomain: "asprients-95c1f.firebaseapp.com",
    projectId: "asprients-95c1f",
    storageBucket: "asprients-95c1f.appspot.com",
    messagingSenderId: "453218332819",
    appId: "1:453218332819:web:5740173fa4d8156dae9d66"
};

// ---------- Init Firebase ----------
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let currentUserId = null;
const LECTURES = [
  { id: 'A1', min:'TBA', title: 'Partnership Fundamentals', video: 'https://www.youtube.com/embed/I5kdnDq8uHs', notes:'Cuet Accountancy.pdf', pyq:'#', progress:0., teacher:'Manish Sir' },
  { id: 'A2', min:'TBA', title: 'Accounting for Admission', video: '', notes:'#', pyq:'#', progress:0., teacher:'Ms. Y' },
  { id: 'A3', min:'TBA', title: 'Retirement & Death of Partner', video: '', notes:'#', pyq:'#', progress:0.0, teacher:'Mr. Z' },
  { id: 'A4', min:'TBA', title: 'Dissolution of Partnership', video: '', notes:'#', pyq:'#', progress:0., teacher:'Manish Sir' },
  { id: 'A5', min:'TBA', title: 'Company Accounts Basics', video: '', notes:'#', pyq:'#', progress:0., teacher:'Ms. Y' },
  { id: 'A6', min:'TBA', title: 'Issue of Shares', video: '', notes:'#', pyq:'#', progress:0.0, teacher:'Mr. Z' },
  { id: 'A7', min:'TBA', title: 'Redemption of Preference Shares', video: '', notes:'#', pyq:'#', progress:0.0, teacher:'Manish Sir' },
  { id: 'A8', min:'TBA', title: 'Debentures Accounting', video: '', notes:'#', pyq:'#', progress:1, teacher:'Ms. Y' },
  { id: 'A9', min:'TBA', title: 'Final Accounts of Companies', video: '', notes:'#', pyq:'#', progress:0.0, teacher:'Mr. Z' },
  { id: 'A10', min:'TBA', title: 'Analysis of Financial Statements', video: '', notes:'#', pyq:'#', progress:0., teacher:'Manish Sir' },
  { id: 'A11', min:'TBA', title: 'Cash Flow Statements', video: '', notes:'#', pyq:'#', progress:0.0, teacher:'Ms. Y' },
  { id: 'A12', min:'TBA', title: 'Accounting Ratios', video: '', notes:'#', pyq:'#', progress:0.0, teacher:'Mr. Z' },

];

// ---------- UI helper functions (kept same as yours) ----------
function escapeHtml(s){return (s||'').replace(/"/g,'&quot;').replace(/'/g,"&apos;");}

function updateOverall(){ 
  const avg = Math.round((LECTURES.reduce((s,l)=>s+(l.progress||0),0)/LECTURES.length)*100);
  const overallPercentEl = document.getElementById('overallPercent');
  const ringPercentEl = document.getElementById('ringPercent');
  const overallBarEl = document.getElementById('overallBar');
  if(overallPercentEl) overallPercentEl.innerText = avg+'%';
  if(ringPercentEl) ringPercentEl.innerText = avg+'%';
  if(overallBarEl) overallBarEl.style.width = avg+'%';
}

// ---------- RENDER (kept same, slight change: pass id to openVideo via global wrapper) ----------
function renderAll(){
  const grid=document.getElementById('cardsGrid');
  const notesGrid=document.getElementById('notesGrid');
  const pyqGrid=document.getElementById('pyqGrid');
  if(!grid) return;
  grid.innerHTML=''; if(notesGrid) notesGrid.innerHTML=''; if(pyqGrid) pyqGrid.innerHTML='';
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

// ---------- Video modal (unchanged logic) ----------
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
  if(modal) { modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden'; }
}

function closeModal(){ 
  const iframe=document.getElementById('videoIframe'); 
  const modal=document.getElementById('videoModal');
  if(iframe) iframe.src=''; 
  if(modal){ modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); }
  document.body.style.overflow='';
}

// ---------- tab/filter/search/theme (kept same) ----------
function openTab(e){ const tab=e.currentTarget.dataset.tab; document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active', t.dataset.tab===tab)); document.querySelectorAll('.tabpanel').forEach(p=>p.style.display=p.id===tab?'':'none'); }
function filterBy(mode){ document.querySelectorAll('#cardsGrid .card').forEach((card,idx)=>{ const prog=LECTURES[idx].progress; if(mode==='completed') card.style.display=prog>=0.99?'':'none'; else if(mode==='pending') card.style.display=prog<0.99?'':'none'; else card.style.display=''; }); }

// ---------- Expose some functions globally for inline onclick to work (will set real openVideo wrapper later) ----------
window.openVideo = null;
window.closeModal = closeModal;
window.filterBy = filterBy;
window.openTab = openTab;

// ---------- Auth & Firestore sync ----------

// Compute overall percent 0..100
function computeOverallPercent(){
  const avg = Math.round((LECTURES.reduce((s,l)=>s+(l.progress||0),0)/LECTURES.length)*100);
  return avg;
}

// Load user's saved progress to LECTURES array
async function loadUserProgress(uid){
  try{
    const userRef = doc(db, "users", uid);
    const snap = await getDoc(userRef);
    if(snap.exists()){
      const data = snap.data();
      // If user doc has a `progress` map, map it into LECTURES
      if(data.progress){
        LECTURES.forEach(l => {
          if(typeof data.progress[l.id] !== 'undefined') l.progress = data.progress[l.id];
        });
      } else {
        // no progress field yet — write default (merge)
        const defaultProgress = {};
        LECTURES.forEach(l => defaultProgress[l.id] = l.progress || 0);
        await setDoc(userRef, { progress: defaultProgress }, { merge: true });
      }

      // (optional) show stored name if present
      if(data.fullname){
        const nameEl = document.getElementById('usernameDisplay');
        if(nameEl) nameEl.innerText = data.fullname;
      }
    } else {
      // new user doc: create one with default progress
      const defaultProgress = {};
      LECTURES.forEach(l => defaultProgress[l.id] = l.progress || 0);
      await setDoc(userRef, { progress: defaultProgress }, { merge: true });
    }
    renderAll();
  } catch(err){
    console.error("Error loading user progress:", err);
    renderAll(); // still render UI
  }
}

// Save single lecture progress and overall percent
async function saveLectureProgress(lectureId, value){
  if(!currentUserId) return;
  try{
    const userRef = doc(db, "users", currentUserId);
    // update the single nested field
    await updateDoc(userRef, { [`progress.${lectureId}`]: value });
    // update overallProgress as percent
    const overall = computeOverallPercent();
    await updateDoc(userRef, { overallProgress: overall });
    console.log("Saved progress", lectureId, value, "overall:", overall);
  } catch(err){
    console.error("Error saving progress:", err);
  }
}

// Save all progress at once (fallback)
async function saveAllProgress(){
  if(!currentUserId) return;
  try{
    const userRef = doc(db, "users", currentUserId);
    const progressObj = {};
    LECTURES.forEach(l => progressObj[l.id] = l.progress || 0);
    await setDoc(userRef, { progress: progressObj, overallProgress: computeOverallPercent() }, { merge: true });
    console.log("Saved all progress");
  } catch(err){
    console.error("Error saving all progress:", err);
  }
}

// Mark lecture completed (update local array + Firestore)
function markCompleted(lectureId){
  const lec = LECTURES.find(l => l.id === lectureId);
  if(!lec) return;
  if(lec.progress < 1){
    lec.progress = 1;
    updateOverall();
  }
  // Save single lecture progress
  saveLectureProgress(lectureId, 1);
  // Re-render so UI updates immediately
  renderAll();
}

// ---------- AUTH listener ----------
onAuthStateChanged(auth, async (user) => {
  if(!user){
    // not logged in: redirect to index/login page
    // keep this if you want to require login
    // window.location.href = "index.html";
    console.log("User not logged in (Accounting page). UI will still load but progress won't sync.");
    renderAll();
    return;
  }
  currentUserId = user.uid;
  console.log("Auth user detected:", currentUserId);
  await loadUserProgress(currentUserId);
});

// ---------- Wire wrapper for openVideo so inline onclick works ------------
// store original (local) openVideo function reference and expose wrapper
window.openVideoOriginal = openVideoOriginal;

// global openVideo wrapper called by inline onclick
window.openVideo = function(rawUrl, title, lectureId){
  // call original player
  try{ window.openVideoOriginal(rawUrl, title); } catch(err){ console.error(err); }
  // mark completion for lectureId if provided (or match by title)
  if(lectureId){
    markCompleted(lectureId);
  } else {
    const lec = LECTURES.find(l => l.title === title);
    if(lec) markCompleted(lec.id);
  }
};

// Expose closeModal, filterBy, openTab already set above
window.closeModal = closeModal;
window.filterBy = filterBy;
window.openTab = openTab;

// ---------- Modal click + Escape handler (kept) ----------
document.getElementById('videoModal')?.addEventListener('click',(e)=>{ if(e.target===e.currentTarget) closeModal(); });
document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeModal() });

// ---------- Render UI initially (will be updated after auth load if logged in) ----------
renderAll();

// ---------- Search input ----------
document.getElementById('searchInput')?.addEventListener('input',(ev)=>{
  const q = ev.target.value.trim().toLowerCase();
  document.querySelectorAll('#cardsGrid .card').forEach(card=>{
    const title = card.querySelector('.chapter-title').innerText.toLowerCase();
    card.style.display = title.includes(q) ? '' : 'none';
  });
});

// ---------- Theme toggle (kept but safe-guarded) ----------
const themeToggleEl = document.getElementById('themeToggle');
if(themeToggleEl){
  if(localStorage.getItem('theme')){
      document.body.setAttribute('data-theme', localStorage.getItem('theme'));
      themeToggleEl.textContent = localStorage.getItem('theme') === 'dark' ? '🌙' : '☀️';
  }
  themeToggleEl.addEventListener('click', () => {
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

// ---------- Logout button ----------
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  // save all progress just before signout (optional)
  await saveAllProgress();
  localStorage.removeItem("loggedInUser");
  sessionStorage.removeItem("loggedInUser");
  try{
    await signOut(auth);
  }catch(err){ console.error("Signout failed", err); }
  window.location.href = "index.html";
});
