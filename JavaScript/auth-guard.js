import { ROUTES } from "./config/routes.js";
import { APP } from "./config/version.js";

import {
    auth,
    db,
    doc,
    getDoc
} from "./config/firebase.js";

import { onAuthStateChanged }
from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

onAuthStateChanged(auth, async (user) => {

    // Not logged in
    if (!user) {

        if (!location.pathname.endsWith(ROUTES.HOME)) {
            location.replace(ROUTES.HOME);
        }

        return;
    }

    const snap = await getDoc(doc(db, "users", user.uid));

    if (!snap.exists()) return;

    const data = snap.data();

    const accepted =
        data.termsAccepted &&
        data.termsVersion === APP.TERMS_VERSION;

    // User is on login page
    if (
        location.pathname.endsWith(ROUTES.HOME) ||
        location.pathname === "/"
    ) {

        if (accepted) {
            location.replace(ROUTES.DASHBOARD);
        } else {
            location.replace(ROUTES.TERMS);
        }

        return;
    }

});