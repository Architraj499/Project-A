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
const modal = document.getElementById("videoModal");
const iframe = document.getElementById("videoIframe");
const closeBtn = modal?.querySelector(".close");

if (modal && iframe && closeBtn) {
  document.querySelectorAll(".lecture-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const videoURL = btn.getAttribute("data-video");
      iframe.src = videoURL + "?autoplay=1";
      modal.style.display = "block";
    });
  });

  closeBtn.addEventListener("click", () => {
    modal.style.display = "none";
    iframe.src = "";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
      iframe.src = "";
    }
  });
}

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
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Show username from localStorage
const usernameDisplay = document.getElementById("usernameDisplay");
if (usernameDisplay) {
  usernameDisplay.textContent = localStorage.getItem("fullname") || "User";
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
