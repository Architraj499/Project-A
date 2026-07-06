// auth-guard.js

import { ROUTES } from "./routes.js";
import { auth } from "./universal.js";

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