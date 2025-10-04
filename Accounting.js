const LECTURES = [
  { id: 'A1', title: 'Theoretical Framework', video: 'https://www.youtube-nocookie.com/embed/ahk3IfMxEN8', notes: '#', pyq: '#', progress: 1, teacher: 'Manish Sir' },
  { id: 'A2', title: 'Accounting Process', video: 'https://www.youtube-nocookie.com/embed/xHDPXnsOjPw', notes: '#', pyq: '#', progress: 1, teacher: 'Manish Sir' },
  { id: 'A3', title: 'Bank Reconciliation Statement', video: 'https://www.youtube-nocookie.com/embed/5JeAF7PU8dM', notes: '#', pyq: '#', progress: 1, teacher: 'Manish Sir' },
  { id: 'A4', title: 'Inventories', video: 'soon.html', notes: '#', pyq: '#', progress: 0, teacher: 'Manish Sir' },
  { id: 'A5', title: 'Depreciation and Amortisation', video: 'soon.html', notes: '#', pyq: '#', progress: 0, teacher: 'Manish Sir' },
  { id: 'A6', title: 'Bills of Exchange and Promissory Notes', video: 'soon.html', notes: '#', pyq: '#', progress: 0, teacher: 'Manish Sir' },
  { id: 'A7', title: 'Final Accounts of Sole Proprietors', video: 'soon.html', notes: '#', pyq: '#', progress: 0, teacher: 'Manish Sir' },
  { id: 'A8', title: 'Financial Statement of NPO', video: 'soon.html', notes: '#', pyq: '#', progress: 0, teacher: 'Manish Sir' },
  { id: 'A9', title: 'Accounts from Incomplete Records', video: 'soon.html', notes: '#', pyq: '#', progress: 0, teacher: 'Manish Sir' },
  { id: 'A10', title: 'Partnership and LLP Accounts', video: 'soon.html', notes: '#', pyq: '#', progress: 0, teacher: 'Manish Sir' },
  { id: 'A11', title: 'Company Accounts', video: 'soon.html', notes: '#', pyq: '#', progress: 0, teacher: 'Manish Sir' },
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
const root = document.documentElement;
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
root.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
document.getElementById('themeToggle').innerText = prefersDark ? '☀' : '🌙';

