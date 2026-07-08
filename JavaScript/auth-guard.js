// auth-guard.js

import { ROUTES } from "./config/routes.js";import { APP } from "./config/version.js";

document.getElementById("version").textContent =
`${APP.NAME} v${APP.VERSION} (${APP.RELEASE})`; 
import { auth } from "./config/firebase.js";

import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {

  // Not Logged In
  if (!user) {

    if (!location.pathname.endsWith(ROUTES.HOME)) {

      window.location.href = ROUTES.HOME;

    }

    return;

  }

  // Logged In User
  if (
    location.pathname.endsWith(ROUTES.HOME) ||
    location.pathname === "/"
  ) {

    window.location.href = ROUTES.DASHBOARD;

  }

});