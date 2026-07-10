// admin-guard.js
import { ROUTES } from "./config/routes.js";import { APP } from "./config/version.js";



import {
    auth,
    db,
    onAuthStateChanged,
    doc,
    getDoc
} from "./config/firebase.js";


onAuthStateChanged(auth, async (user) => {

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

    const role = snap.data().role || "user";

    if (role !== "admin") {
      location.replace(ROUTES.DASHBOARD);
      return;
    }
document.body.style.display = "block";
  } catch (err) {

    console.error(err);
    location.replace(ROUTES.DASHBOARD);

  }

});