// admin-guard.js
import { ROUTES } from "./routes.js";
import { auth, db } from "./universal.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

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