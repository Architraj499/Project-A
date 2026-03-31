// index.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyDHRDRRm2KBmCuUf3qvTIRI5hO0aXFFx3w",
  authDomain: "asprients-95c1f.firebaseapp.com",
  projectId: "asprients-95c1f",
  storageBucket: "asprients-95c1f.firebasestorage.app",
  messagingSenderId: "453218332819",
  appId: "1:453218332819:web:5740173fa4d8156dae9d66"
};
const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const signupName = document.getElementById("signupName");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const signupConfirm = document.getElementById("signupConfirm");

const forgotPassword = document.getElementById("forgotPassword");
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const message = document.getElementById("message");

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");



function switchForm(type){
  loginForm.classList.toggle("active", type==="login");
  signupForm.classList.toggle("active", type==="signup");

  loginTab.classList.toggle("active", type==="login");
  signupTab.classList.toggle("active", type==="signup");
}

document.getElementById("loginTab").onclick = ()=>switchForm("login");
document.getElementById("signupTab").onclick = ()=>switchForm("signup");
document.getElementById("toSignup").onclick = ()=>switchForm("signup");
document.getElementById("toLogin").onclick = ()=>switchForm("login");

/* ---------- SIGNUP ---------- */
signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  message.innerText = "";

  const name = signupName.value.trim();
  const email = signupEmail.value.trim();
  const password = signupPassword.value;
  const confirm = signupConfirm.value;

  if (!name || !email || !password || !confirm) {
    message.innerText = "Please fill all fields";
    return;
  }

  if (password !== confirm) {
    message.innerText = "Passwords do not match";
    return;
  }

  try {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    const user = cred.user;

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      fullname: name,
      email: email,
      password: password,
      overallProgress: 0,
      progress: {},
      totalSiteSeconds: 0,
      totalLectureSeconds: 0,
      createdAt: Date.now(),
      role: "student",
      status: "active"
    });

    message.innerText = "Signup successful! Redirecting...";
    window.location.href = "home.html";

  } catch (err) {
    console.error("Signup Error:", err);

    switch (err.code) {
      case "auth/email-already-in-use":
        message.innerText = "This email is already registered. Please login instead.";
        break;

      case "auth/invalid-email":
        message.innerText = "Please enter a valid email address.";
        break;

      case "auth/weak-password":
        message.innerText = "Password should be at least 6 characters.";
        break;

      default:
        message.innerText = "Signup failed. Please try again.";
    }
  }
});
function showMessage(text, type = "error") {
  message.innerText = text;
  message.classList.add("show");

  if (type === "success") {
    message.style.color = "#22c55e";
  } else {
    message.style.color = "#ef4444";
  }
}

/* ---------- LOGIN ---------- */
loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  try {
    const cred = await signInWithEmailAndPassword(
      auth,
      loginEmail.value,
      loginPassword.value
    );

    const user = cred.user;
    const ref = doc(db, "users", user.uid);
    const snap = await getDoc(ref);

    //  If doc missing → auto-create
    if (!snap.exists()) {
      await setDoc(ref, {
        uid: user.uid,
        fullname: "User",
        email: user.email,
        password: loginPassword.value,
        totalSiteSeconds: 0,
        totalLectureSeconds: 0,
        createdAt: Date.now(),
        role: "student",
        status: "active",
        overallProgress: 0,
        progress: {}
      });
    }

    window.location.href = "home.html";

  } catch (err) {
    message.innerText = "Invalid credentials";
  }
});


/* ---------- FORGOT PASSWORD ---------- */
forgotPassword.onclick = async ()=>{
  if(!loginEmail.value){
    message.innerText="Enter email first";
    return;
  }
  await sendPasswordResetEmail(auth,loginEmail.value);
  message.innerText="Password reset link sent";
};
