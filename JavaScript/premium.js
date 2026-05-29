import { auth, db } from "./universal.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";


// ---------- CHECK CURRENT PLAN ----------

onAuthStateChanged(auth, async (user) => {

  if (!user) return;

  const snap =
    await getDoc(doc(db, "users", user.uid));

  if (!snap.exists()) return;

  const data = snap.data();

  document.querySelectorAll(".buy-btn").forEach(btn => {

    const btnPlan = btn.dataset.plan;

    if (data.plan === btnPlan) {

      btn.innerHTML = "Let's Study";

      btn.style.background =
        "linear-gradient(135deg,#ffb703,#ff7b00)";

      btn.style.boxShadow =
        "0 0 18px rgba(255,183,3,0.45)";

      btn.style.color = "#111";
      btn.style.fontWeight = "700";
      btn.style.border = "none";

      // Mark current plan button
      btn.dataset.currentPlan = "true";
    }

  });

});


// ---------- PAYMENT / REDIRECT ----------

window.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".buy-btn").forEach(btn => {

    btn.addEventListener("click", async () => {

      // Current plan -> Study page
      if (btn.dataset.currentPlan === "true") {
        window.location.href = "cuet.html";
        return;
      }

      const user = auth.currentUser;

      if (!user) {
        alert("Please login first");
        return;
      }

      const confirmPayment = confirm(
        `Proceed to payment for ${btn.dataset.plan} plan ?`
      );

      if (!confirmPayment) return;

      btn.innerHTML = "Processing...";
      btn.disabled = true;

      await new Promise(resolve =>
        setTimeout(resolve, 2000)
      );

      await updateDoc(
        doc(db, "users", user.uid),
        {
          plan: btn.dataset.plan
        }
      );

      alert("🎉 Payment Successful!");

      location.reload();

    });

  });

});