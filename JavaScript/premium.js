import { auth, db } from "./universal.js";

import {
  doc,
  getDoc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import emailjs from "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm";

emailjs.init("siChPjqF00KVyxv8O");


// ---------- EMAIL FUNCTION ----------

async function sendPremiumEmail(userData, plan, expiry) {

  const formattedExpiry =
  expiry.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

  try {

    await emailjs.send(
      "service_o06gkqs",
      "template_f701pgr",
      {
        email: userData.email,
        user_name: userData.fullname,
        plan_name: plan,
        expiry_date: formattedExpiry
      }
    );


  } catch (err) {

    console.error(
      "Email Error:",
      err
    );

  }

}


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

      document.querySelectorAll(".popular-tag")
      .forEach(tag => tag.remove());

      document.querySelectorAll(".price-card")
      .forEach(card => {
        card.classList.remove("popular");
      });

      const card = btn.closest(".price-card");

      card.classList.add("popular");

      const currentTag =
      document.createElement("div");

      currentTag.className = "popular-tag";
      currentTag.innerHTML = "CURRENT PLAN";

      card.prepend(currentTag);

      btn.innerHTML = "Let's Study";

      btn.style.background =
        "linear-gradient(135deg,#ffb703,#ff7b00)";

      btn.style.boxShadow =
        "0 0 18px rgba(255,183,3,0.45)";

      btn.style.color = "#111";
      btn.style.fontWeight = "700";
      btn.style.border = "none";

      btn.dataset.currentPlan = "true";
    }

  });

});


// ---------- PAYMENT / REDIRECT ----------

window.addEventListener("DOMContentLoaded", () => {

  document.querySelectorAll(".buy-btn").forEach(btn => {

    btn.addEventListener("click", async () => {

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

      const snap =
      await getDoc(
        doc(db, "users", user.uid)
      );

      const userData =
      snap.data();

      let expiry = new Date();

      if (btn.dataset.plan === "1 Month") {

        expiry.setMonth(
          expiry.getMonth() + 1
        );

      }

      else if (btn.dataset.plan === "6 Months") {

        expiry.setMonth(
          expiry.getMonth() + 6
        );

      }

      else if (btn.dataset.plan === "12 Months") {

        expiry.setFullYear(
          expiry.getFullYear() + 1
        );

      }

      await updateDoc(
        doc(db, "users", user.uid),
        {
          plan: btn.dataset.plan,
          planExpiry:
            expiry.toISOString()
        }
      );

      await sendPremiumEmail(
        userData,
        btn.dataset.plan,
        expiry
      );

      alert("🎉 Payment Successful!");

      location.reload();

    });

  });

});