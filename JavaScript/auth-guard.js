import { auth } from "./universal.js";
import {
  onAuthStateChanged,
  signInAnonymously
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

const isDev =
  location.hostname === "localhost" ||
  location.hostname === "127.0.0.1";

onAuthStateChanged(auth, async (user) => {

  // 🔥 DEV MODE
  if (isDev) {
    if (!user) {
      // auto anonymous login
      await signInAnonymously(auth);
      return;
    }

    // ✅ already logged in → SKIP LOGIN PAGE
    if (location.pathname.endsWith("index.html") || location.pathname === "/") {
      window.location.href = "home.html";
    }
    return;
  }

  // 🌍 NORMAL USERS
  if (!user && !location.pathname.endsWith("index.html")) {
    window.location.href = "index.html";
  }
});
