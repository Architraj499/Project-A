// auth-guard.js


import { auth } from "./universal.js";

import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {

  // Not Logged In
  if (!user) {

    if (!location.pathname.endsWith("index.html")) {

      window.location.href = "index.html";

    }

    return;

  }

  // Logged In User
  if (
    location.pathname.endsWith("index.html") ||
    location.pathname === "/"
  ) {

    window.location.href = "../dashboard/home.html";

  }

});