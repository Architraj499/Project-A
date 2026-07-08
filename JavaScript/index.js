// index.js
import { ROUTES } from "./config/routes.js";
import { APP } from "./config/version.js";
import {
  auth,
  db,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  onAuthStateChanged,
  doc,
  getDoc,
  setDoc
} from "./config/firebase.js";


const loginEmail = document.getElementById("loginEmail");
const loginPassword = document.getElementById("loginPassword");

const signupName = document.getElementById("signupName");
const signupEmail = document.getElementById("signupEmail");
const signupPassword = document.getElementById("signupPassword");
const signupConfirm = document.getElementById("signupConfirm");

const forgotPassword = document.getElementById("forgotPassword");

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
      role: "user",
      status: "active",
      // PREMIUM SYSTEM
  plan: "free",
  planExpiry: null,
   termsAccepted: false,
  termsAcceptedAt: null,
  termsVersion: null
    });

    message.innerText = "Signup successful! Redirecting...";
   window.location.href = ROUTES.TERMS;

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
        role: "user",
        status: "active",
        overallProgress: 0,
        progress: {},
        // PREMIUM SYSTEM
  plan: "free",
  planExpiry: null,
  termsAccepted: false,
termsAcceptedAt: null,
termsVersion: null,
      });
    }

    const data = snap.data();

if (
    !data.termsAccepted ||
    data.termsVersion !== APP.TERMS_VERSION
) {

    window.location.href = ROUTES.TERMS;

} else {

    window.location.href = ROUTES.DASHBOARD;

}

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
