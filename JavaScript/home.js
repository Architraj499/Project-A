// ---------- Firebase imports ----------
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ---------- Firebase config ----------
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



// ---------- Website Time Tracking ----------
let siteSeconds = 0;
let siteTimerInterval = null;
let currentUserId = null;

// Convert seconds to hh:mm:ss
function formatTime(seconds){
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

// Update time display
function updateTimeDisplay() {
  const siteEl = document.getElementById("websiteTime");
  if(siteEl) siteEl.innerText = formatTime(siteSeconds);
}

// Save site time to Firestore
async function saveTimeToFirestore() {
  if(!currentUserId) return;
  try{
    const userRef = doc(db, "users", currentUserId);
    await updateDoc(userRef, { totalSiteSeconds: siteSeconds });
  } catch(err){ console.error(err); }
}

// Start site timer
function startSiteTimer() {
  if(siteTimerInterval) return; // prevent multiple intervals

  siteTimerInterval = setInterval(() => {
    // Only increment if tab is active
    if(!document.hidden){
      siteSeconds++;
      updateTimeDisplay();
      saveTimeToFirestore();
    }
  }, 1000);
}

// Load previous time and start timer once
onAuthStateChanged(auth, async (user) => {
  if(user){
    currentUserId = user.uid;
    const snap = await getDoc(doc(db, "users", currentUserId));
    if(snap.exists()){
      siteSeconds = snap.data().totalSiteSeconds || 0;
    }
    updateTimeDisplay();
    startSiteTimer();
  }
});

// ---------- Theme toggle ----------
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

// ---------- Logout ----------
document.getElementById("logoutBtn")?.addEventListener("click", async () => {
  localStorage.removeItem("loggedInUser");
  sessionStorage.removeItem("loggedInUser");
  try { await signOut(auth); } catch(err){ console.error("Signout failed", err); }
  window.location.href = "index.html";
});

// ---------- Auth listener ----------
onAuthStateChanged(auth, async (user) => {
  if(user){
    currentUserId = user.uid;
    // show name if available
    const snap = await getDoc(doc(db, "users", currentUserId));
    if(snap.exists() && snap.data().fullname){
      const fullnameEl = document.getElementById('fullname');
      if(fullnameEl) fullnameEl.innerText = snap.data().fullname;
    }
  }
  startSiteTimer();
});
