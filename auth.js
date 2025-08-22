// Import Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged } 
from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// 🔹 Firebase config yahan apna paste karo
const firebaseConfig = {
  apiKey: "AIzaSyDvxGvUkBkOcYtn8_pl7E50pQd1B2oc904",
  authDomain: "project-a-c6f8a.firebaseapp.com",
  projectId: "project-a-c6f8a",
  storageBucket: "project-a-c6f8a.firebasestorage.app",
  messagingSenderId: "855860821473",
  appId: "1:855860821473:web:bbc9d21bcf7f3ee5ee26a0",
  measurementId: "G-4FK33PZL8J"
};
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// 🔹 Signup function
window.signup = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  createUserWithEmailAndPassword(auth, email, password)
    .then(() => {
      document.getElementById("message").innerText = "Signup Successful ✅";
    })
    .catch((error) => {
      document.getElementById("message").innerText = error.message;
    });
};

// 🔹 Login function
window.login = function () {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  signInWithEmailAndPassword(auth, email, password)
    .then(() => {
      document.getElementById("message").innerText = "Login Successful ✅";
      window.location.href = "home.html";  // 🔥 apna main page yahan open hoga
    })
    .catch((error) => {
      document.getElementById("message").innerText = error.message;
    });
};

// 🔹 Check if already logged in
onAuthStateChanged(auth, (user) => {
  if (user) {
    window.location.href = "home.html"; // agar already login hai to directly home le jao
  }
});



