import { auth, db } from "./universal.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

onAuthStateChanged(auth, async (user) => {

  // 1️⃣ Agar login hi nahi hai → login page
  if (!user) {
    if (!location.pathname.endsWith("index.html")) {
      window.location.href = "index.html";
    }
    return;
  }

  // 2️⃣ Login hai → allowlist check
  const allowRef = doc(db, "allow_users", user.uid);
  const allowSnap = await getDoc(allowRef);

  // 3️⃣ Agar trusted user hai → login skip
  if (allowSnap.exists()) {
    if (
      location.pathname.endsWith("index.html") ||
      location.pathname === "/"
    ) {
      window.location.href = "home.html";
    }
    return;
  }



  // 🌍 NORMAL USERS
  if (!user && !location.pathname.endsWith("index.html")) {
    window.location.href = "index.html";
  }
});
