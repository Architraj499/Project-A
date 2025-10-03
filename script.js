// ================== DROPDOWN TOGGLE ==================
const startBtn = document.getElementById('startBtn');
const dropdown = startBtn?.closest('.dropdown');

if (startBtn && dropdown) {
  startBtn.addEventListener('click', (e) => {
    e.preventDefault();
    dropdown.classList.toggle('open');
  });

  // Outside click → close dropdown
  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target)) dropdown.classList.remove('open');
  });

  // ESC key → close dropdown
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') dropdown.classList.remove('open');
  });
}

// ================== INNER TABS ==================
const innerButtons = document.querySelectorAll('.inner-tab-button');
const innerContents = document.querySelectorAll('.tab-content');

innerButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    innerButtons.forEach(b => b.classList.remove('active'));
    innerContents.forEach(c => c.classList.remove('active'));

    btn.classList.add('active');
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ================== VIDEO MODAL ==================
// VIDEO MODAL — paste/replace into script.js
document.addEventListener('DOMContentLoaded', () => {
  const modal = document.getElementById('videoModal');
  const iframe = document.getElementById('videoIframe');

  if (!modal || !iframe) {
    console.warn('Video modal or iframe not found. Ensure HTML contains #videoModal and #videoIframe');
    return;
  }

  // try multiple selectors for close button to be tolerant to class name mismatches
  const closeBtn = modal.querySelector('.close-btn') || modal.querySelector('.close') || modal.querySelector('[data-close]');

  function toEmbedUrl(raw) {
    if (!raw) return '';
    // already embed
    if (raw.includes('/embed/')) return raw.split('?')[0];
    // full watch url -> extract id
    let m = raw.match(/[?&]v=([A-Za-z0-9_-]{6,})/) || raw.match(/youtu\.be\/([A-Za-z0-9_-]{6,})/) || raw.match(/\/embed\/([A-Za-z0-9_-]{6,})/);
    if (m && m[1]) return `https://www.youtube-nocookie.com/embed/${m[1]}`;
    // maybe raw is just an id
    if (/^[A-Za-z0-9_-]{6,}$/.test(raw)) return `https://www.youtube-nocookie.com/embed/${raw}`;
    // fallback: return raw (could be already an embed)
    return raw;
  }

  function openModal(videoRaw) {
    const embed = toEmbedUrl(videoRaw);
    if (!embed) {
      console.warn('Invalid video value:', videoRaw);
      return;
    }
    // add autoplay params
    const sep = embed.includes('?') ? '&' : '?';
    iframe.src = embed + sep + 'autoplay=1&rel=0&modestbranding=1';
    modal.style.display = 'flex'; // modal should be flex-centered in CSS
    document.body.style.overflow = 'hidden'; // prevent background scroll
    modal.setAttribute('aria-hidden', 'false');
    console.log('Video opened:', iframe.src);
  }

  function closeModal() {
    modal.style.display = 'none';
    iframe.src = '';
    document.body.style.overflow = '';
    modal.setAttribute('aria-hidden', 'true');
    console.log('Video closed');
  }

  // open on each lecture button click
  document.querySelectorAll('.lecture-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const videoVal = btn.dataset.video;
      if (!videoVal) { console.warn('lecture-btn missing data-video', btn); return; }
      openModal(videoVal);
    });
  });

  // close handlers
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
});

// ================== FIREBASE AUTH ==================
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDvxGvUkBkOcYtn8_pl7E50pQd1B2oc904",
  authDomain: "project-a-c6f8a.firebaseapp.com",
  projectId: "project-a-c6f8a",
  storageBucket: "project-a-c6f8a.appspot.com",
  messagingSenderId: "855860821473",
  appId: "1:855860821473:web:bbc9d21bcf7f3ee5ee26a0",
  measurementId: "G-4FK33PZL8J"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const auth = firebase.auth();

// Show username from localStorage
const usernameDisplay = document.getElementById("usernameDisplay");
if (usernameDisplay) {
  usernameDisplay.textContent = localStorage.getItem("fullname") || 'User';
}

// Logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
      localStorage.removeItem("fullname");
      window.location.href = "index.html"; // redirect to login
    });
  });
}

// Redirect if user not logged in
onAuthStateChanged(auth, user => {
  if (!user) {
    localStorage.removeItem("fullname");
    window.location.href = "index.html";
  }
});

// ================== ACTIVE NAVIGATION HIGHLIGHT ==================
const links = document.querySelectorAll('.surf a');
const currentPage = window.location.pathname.split('/').pop();

links.forEach(link => {
  if (link.getAttribute('href') === currentPage) {
    link.classList.add('active');
  }
});





createUserWithEmailAndPassword(auth,email,password)
.then(()=>{ 
    localStorage.setItem("fullname", fullname);
    message.innerText=`Signup Successful ✅ Welcome, ${fullname}`;
    switchForm('login');
})



// Step 3: Auto-generate data-id
document.querySelectorAll('.subject-content').forEach((section) => {
    const sectionName = section.querySelector('h2').innerText.replace(/\s+/g, '_');
    const buttons = section.querySelectorAll('.lecture-btn');
    buttons.forEach((btn, index) => {
        btn.setAttribute('data-id', sectionName + '_Lecture' + (index + 1));
    });
});



document.querySelectorAll('.lecture-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    const userId = auth.currentUser.uid; // logged in user
    const lectureId = btn.getAttribute('data-id');

    // Firestore me save karo
    db.collection('progress').doc(userId).set({
      [lectureId]: true
    }, { merge: true });
    
    // Optional: button ko green karo
    btn.style.backgroundColor = 'green';
  });
});
