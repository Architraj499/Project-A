import { ROUTES } from "./config/routes.js";

import {
    db,
    doc,
    getDoc
} from "./config/firebase.js";

import {
    onUserChanged
} from "./core/auth.js";

onUserChanged(async (user) => {

    if (!user) {

        location.replace(ROUTES.HOME);
        return;

    }

    try {

        const snap = await getDoc(
            doc(db, "users", user.uid)
        );

        if (!snap.exists()) {

            location.replace(ROUTES.DASHBOARD);
            return;

        }

        const role =
        snap.data().role || "user";

        if (role !== "admin") {

            location.replace(ROUTES.DASHBOARD);
            return;

        }

        document.body.style.display =
        "block";

    }

    catch (err) {

        console.error(err);

        location.replace(
            ROUTES.DASHBOARD
        );

    }

});