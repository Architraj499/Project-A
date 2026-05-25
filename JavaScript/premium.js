
import { auth, db } from "./JavaScript/universal.js";

import {
  doc,
  getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

import {
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

onAuthStateChanged(auth, async(user)=>{

  if(!user) return;

  const snap = await getDoc(doc(db,"users",user.uid));

  if(!snap.exists()) return;

  const data = snap.data();

  if(data.plan === "premium"){

    document.querySelectorAll(".buy-btn").forEach(btn=>{

      btn.innerHTML = "✅ Current Plan";

      btn.disabled = true;

      btn.style.opacity = "0.7";

      btn.style.cursor = "not-allowed";

    });

  }

});

