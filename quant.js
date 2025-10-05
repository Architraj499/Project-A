const LECTURES = [
  // Part-A Business Mathematics
  { id: 'BM1', min:'TBA', title: 'Ratio and Proportion, Indices and Logarithms', video: 'https://www.youtube.com/embed/C7mg-WbYm-w?si=RGK-9UbUd1U4yUEj', notes: '#', pyq: '#', progress: 0, teacher: 'Math Sir' },
  { id: 'BM2', min:'TBA', title: 'Equations', video: 'https://www.youtube.com/embed/7MWGayP7Fss', notes: '#', pyq: '#', progress: 0, teacher: 'Math Sir' },
  { id: 'BM3', min:'TBA', title: 'Linear Inequalities with Objective Functions and Optimization', video: 'https://www.youtube.com/embed/e6VXKEczL-4', notes: '#', pyq: '#', progress: 0, teacher: 'Math Sir' },
  { id: 'BM4', min:'TBA', title: 'Mathematics of Finance', video: 'https://www.youtube.com/embed/qJm1ieRiae0', notes: '#', pyq: '#', progress: 0, teacher: 'Math Sir' },
  { id: 'BM5', min:'TBA', title: 'Permutations and Combinations', video: 'https://www.youtube.com/embed/lmNy6AozqUE', notes: '#', pyq: '#', progress: 0, teacher: 'Math Sir' },
  { id: 'BM6', min:'TBA', title: 'Sequence and Series', video: 'https://www.youtube.com/embed/0Qn7LnklT4c', notes: '#', pyq: '#', progress: 0, teacher: 'Math Sir' },
  { id: 'BM7', min:'TBA', title: 'Sets, Relations and Functions; Basics of Limits & Continuity', video: 'https://www.youtube.com/embed/5KZ-kMMorqY', notes: '#', pyq: '#', progress: 0, teacher: 'Math Sir' },
  { id: 'BM8', min:'TBA', title: 'Applications of Differential & Integral Calculus', video: 'soon.html', notes: '#', pyq: '#', progress: 0, teacher: 'Math Sir' },

  // Part-B Logical Reasoning
  { id: 'LR1', min:'TBA', title: 'Number Series, Coding & Decoding, Odd Man Out', video: 'https://www.youtube.com/embed/b3Y78ICAEpI', notes: '#', pyq: '#', progress: 0, teacher: 'Logical Sir' },
  { id: 'LR2', min:'TBA', title: 'Direction Tests', video: 'https://www.youtube.com/embed/ArobUb475ZUl', notes: '#', pyq: '#', progress: 0, teacher: 'Logical Sir' },
  { id: 'LR3', min:'TBA', title: 'Seating Arrangements', video: 'https://www.youtube.com/embed/ArobUb475ZUl', notes: '#', pyq: '#', progress: 0, teacher: 'Logical Sir' },
  { id: 'LR4', min:'TBA', title: 'Blood Relations', video: 'soon.html', notes: '#', pyq: '#', progress: 0, teacher: 'Logical Sir' },

  // Part-C Statistics
  { id: 'ST1', min:'TBA', title: 'Statistical Description of Data', video: 'https://www.youtube.com/embed/b3Y78ICAEpI', notes: '#', pyq: '#', progress: 0, teacher: 'Statistics Sir' },
  { id: 'ST2', min:'TBA', title: 'Measures of Central Tendency & Dispersion', video: 'https://www.youtube.com/embed/b3Y78ICAEpI', notes: '#', pyq: '#', progress: 0, teacher: 'Statistics Sir' },
  { id: 'ST3', min:'TBA', title: 'Probability', video: 'https://www.youtube.com/embed/b3Y78ICAEpI', notes: '#', pyq: '#', progress: 0, teacher: 'Statistics Sir' },
  { id: 'ST4', min:'TBA', title: 'Theoretical Distributions', video: 'https://www.youtube.com/embed/b3Y78ICAEpI', notes: '#', pyq: '#', progress: 0, teacher: 'Statistics Sir' },
  { id: 'ST5', min:'TBA', title: 'Correlation & Regression', video: 'https://www.youtube.com/embed/b3Y78ICAEpI', notes: '#', pyq: '#', progress: 0, teacher: 'Statistics Sir' },
  { id: 'ST6', min:'TBA', title: 'Index Numbers', video: 'https://www.youtube.com/embed/b3Y78ICAEpI', notes: '#', pyq: '#', progress: 0, teacher: 'Statistics Sir' },
];



function renderAll(){
  const grid=document.getElementById('cardsGrid');
  const notesGrid=document.getElementById('notesGrid');
  const pyqGrid=document.getElementById('pyqGrid');
  grid.innerHTML=''; notesGrid.innerHTML=''; pyqGrid.innerHTML='';
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
        <div class="ring">${Math.round(l.progress*100)}%</div>
        <div style="flex:1"><div class="progress"><i style="width:${l.progress*100}%"></i></div></div>
      </div>
      <div class="actions">
        <button class="small play" onclick="openVideo('${escapeHtml(l.video)}','${escapeHtml(l.title)}')">Play</button>
        <a class="small view" href="${l.notes}" target="_blank">Notes</a>
        <a class="small view" href="${l.pyq}" target="_blank">PYQ</a>
      </div>`;
    grid.appendChild(div);

    const n=document.createElement('div'); n.className='card';
    n.innerHTML=`<div class="badge">Notes</div><div class="chapter-title">${l.title}</div><div class="muted">Format: PDF / Doc</div><div class="actions"><a class="small view" href="${l.notes}" target="_blank">Open</a></div>`;
    notesGrid.appendChild(n);

    const p=document.createElement('div'); p.className='card';
    p.innerHTML=`<div class="badge">PYQ</div><div class="chapter-title">${l.title}</div><div class="muted">Yearwise PYQs</div><div class="actions"><a class="small view" href="${l.pyq}" target="_blank">Open</a></div>`;
    pyqGrid.appendChild(p);
  });
  updateOverall();
}

function openVideo(rawUrl,title){
  if(!rawUrl){ alert('Video will be uploaded soon.'); return; }
  const iframe=document.getElementById('videoIframe');
  const modal=document.getElementById('videoModal');
  document.getElementById('modalTitle').innerText=title||'Lecture';
  let embed=rawUrl;
  if(!embed.includes('embed')){
    const m=rawUrl.match(/[?&]v=([A-Za-z0-9_-]+)/)||rawUrl.match(/youtu\.be\/([A-Za-z0-9_-]+)/);
    if(m&&m[1]) embed='https://www.youtube-nocookie.com/embed/'+m[1];
  }
  const sep=embed.includes('?')?'&':'?';
  iframe.src=embed+sep+'autoplay=1&rel=0&modestbranding=1';
  modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
}
function closeModal(){ const iframe=document.getElementById('videoIframe'); const modal=document.getElementById('videoModal'); iframe.src=''; modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
function openTab(e){ const tab=e.currentTarget.dataset.tab; document.querySelectorAll('.tab').forEach(t=>t.classList.toggle('active', t.dataset.tab===tab)); document.querySelectorAll('.tabpanel').forEach(p=>p.style.display=p.id===tab?'':'none'); }
function filterBy(mode){ document.querySelectorAll('#cardsGrid .card').forEach((card,idx)=>{ const prog=LECTURES[idx].progress; if(mode==='completed') card.style.display=prog>=0.99?'':'none'; else if(mode==='pending') card.style.display=prog<0.99?'':'none'; else card.style.display=''; }); }
const themeBtn=document.getElementById('themeToggle'); themeBtn.addEventListener('click',()=>{ const root=document.documentElement; const cur=root.getAttribute('data-theme')||'dark'; const next=cur==='dark'?'light':'dark'; root.setAttribute('data-theme',next); themeBtn.innerText=next==='light'?'🌙':'☀️'; });
function updateOverall(){ const avg=Math.round((LECTURES.reduce((s,l)=>s+(l.progress||0),0)/LECTURES.length)*100); document.getElementById('overallPercent').innerText=avg+'%'; document.getElementById('ringPercent').innerText=avg+'%'; document.getElementById('overallBar').style.width=avg+'%'; }
function escapeHtml(s){return (s||'').replace(/"/g,'&quot;').replace(/'/g,"&apos;");}
document.getElementById('videoModal').addEventListener('click',(e)=>{ if(e.target===e.currentTarget) closeModal(); });
document.addEventListener('keydown',(e)=>{ if(e.key==='Escape') closeModal() });
renderAll();


/* search & filter */
document.getElementById('searchInput').addEventListener('input',(ev)=>{
  const q = ev.target.value.trim().toLowerCase();
  document.querySelectorAll('#cardsGrid .card').forEach(card=>{
    const title = card.querySelector('.chapter-title').innerText.toLowerCase();
    card.style.display = title.includes(q) ? '' : 'none';
  });
});
const themeToggle = document.getElementById('themeToggle');

  // Load saved theme from localStorage
  if(localStorage.getItem('theme')){
      document.body.setAttribute('data-theme', localStorage.getItem('theme'));
      themeToggle.textContent = localStorage.getItem('theme') === 'dark' ? '🌙' : '☀️';
  }

  themeToggle.addEventListener('click', () => {
      let currentTheme = document.body.getAttribute('data-theme');
      if(currentTheme === 'dark'){
          document.body.setAttribute('data-theme', 'light');
          themeToggle.textContent = '🌙';
          localStorage.setItem('theme','light');
      } else {
          document.body.setAttribute('data-theme', 'dark');
          themeToggle.textContent = '☀️';
          localStorage.setItem('theme','dark');
      }
  });
  // Logout button logic
document.getElementById("logoutBtn").addEventListener("click", () => {
  // Remove user data from storage (depends on your login logic)
  localStorage.removeItem("loggedInUser");
  sessionStorage.removeItem("loggedInUser");

  
  // Redirect to login page
  window.location.href = "index.html";
});
