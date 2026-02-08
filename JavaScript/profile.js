import { auth, db } from "./universal.js";
import { onAuthStateChanged } from
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc, updateDoc } from
  "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

function formatTime(sec = 0) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}h ${m}m ${s}s`;
}
function todayStr() {
  return new Date().toISOString().slice(0, 10);
}

function dayDiff(d1, d2) {
  const a = new Date(d1);
  const b = new Date(d2);
  return Math.round((a - b) / (1000 * 60 * 60 * 24));
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = "index.html";
    return;
  }

  const snap = await getDoc(doc(db, "users", user.uid));
  if (!snap.exists()) return;

  const d = snap.data();
  // ===== STREAK LOGIC =====
const today = todayStr();
let streak = d.streakCount || 0;
let last = d.lastActiveDate;

if (!last) {
  // first time user
  streak = 1;
} else {
  const diff = dayDiff(today, last);

  if (diff === 1) {
    streak += 1;        // continue
  } else if (diff > 1) {
    streak = 1;         // reset
  }
  // diff === 0 → same day, do nothing
}

// SAVE only once per day
if (last !== today) {
  await updateDoc(doc(db, "users", user.uid), {
    streakCount: streak,
    lastActiveDate: today
  });
}

// UI update
document.getElementById("streakCount").innerText = streak;


  // ===== COURSE COMPLETION =====
let percent = 0;

if (d.progress) {
  const values = Object.values(d.progress);
  const total = values.length;
  const done = values.reduce((s, v) => s + (v || 0), 0);
  percent = total === 0 ? 0 : Math.round((done / total) * 100);
}

animateProgress(percent);




  document.getElementById("profileName").innerText =
    d.fullname || "Student";

  document.getElementById("profileEmail").innerText =
    user.email;

  document.getElementById("siteTime").innerText =
    formatTime(d.totalSiteSeconds);

  document.getElementById("lectureTime").innerText =
    formatTime(d.totalLectureSeconds);

  document.getElementById("nameInput").value =
    d.fullname || "";
});

document.getElementById("saveNameBtn").onclick = async () => {
  const name = document.getElementById("nameInput").value.trim();
  if (name.length < 2) return alert("Name too short");

  const user = auth.currentUser;
  await updateDoc(doc(db, "users", user.uid), {
    fullname: name
  });

  document.getElementById("profileName").innerText = name;
  localStorage.setItem("fullname", name);

  alert("Profile updated");
};












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


let currentPercent = 0;

function animateProgress(target, duration = 900) {
  const ring = document.getElementById("progressRing");
  const text = document.getElementById("coursePercent");
  if (!ring || !text) return;

  const start = currentPercent;
  const diff = target - start;
  const startTime = performance.now();

  function easeOut(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function update(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const value = Math.round(start + diff * easeOut(t));

    ring.style.setProperty("--percent", value);
    text.textContent = value + "%";

    if (t < 1) requestAnimationFrame(update);
    else currentPercent = target;
  }

  requestAnimationFrame(update);
}


const avatarBox = document.getElementById("avatarBox");
const avatarInput = document.getElementById("avatarInput");
const avatarImg = document.getElementById("avatarImg");

avatarBox?.addEventListener("click", () => avatarInput.click());

avatarInput?.addEventListener("change", () => {
  const file = avatarInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    avatarImg.src = reader.result;
    localStorage.setItem("avatar", reader.result);
  };
  reader.readAsDataURL(file);
});

const savedAvatar = localStorage.getItem("avatar");
if (savedAvatar) avatarImg.src = savedAvatar;
