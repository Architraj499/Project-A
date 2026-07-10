// admin.js
import emailjs from "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm";
import { ROUTES } from "./config/routes.js";import { APP } from "./config/version.js";

const versionEl = document.getElementById("version");

if(versionEl){

    versionEl.textContent =
    `${APP.NAME} v${APP.VERSION} (${APP.RELEASE})`;

}

emailjs.init("siChPjqF00KVyxv8O");
import { auth, db } from "./config/firebase.js";

import {
  onAuthStateChanged,
  signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
  doc,
  getDoc,
  collection,
  getDocs,
  updateDoc,
  addDoc,
  deleteDoc,
  serverTimestamp,
  setDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// ---------------- ELEMENTS ----------------

const adminName =
document.getElementById("adminName");

const logoutBtn =
document.getElementById("logoutBtn");

const usersBody =
document.getElementById("usersBody");

const totalUsersEl =
document.getElementById("totalUsers");

const premiumUsersEl =
document.getElementById("premiumUsers");

const freeUsersEl =
document.getElementById("freeUsers");

const maintenanceToggle =
document.getElementById("maintenanceToggle");

const maintenanceStatus =
document.getElementById("maintenanceStatus");

const settingsRef =
doc(db,"settings","website");



async function loadMaintenance(){

    try{

        const snap = await getDoc(settingsRef);

        if(!snap.exists()){

            await setDoc(settingsRef,{
                maintenance:false,
                updatedAt:serverTimestamp()
            });

            maintenanceToggle.checked=false;
            maintenanceStatus.textContent="🟢 Website is Live";

            return;

        }

        const enabled =
        snap.data().maintenance;

        maintenanceToggle.checked=
        enabled;

        maintenanceStatus.textContent=
        enabled
        ? "🔴 Website Under Maintenance"
        : "🟢 Website is Live";

    }

    catch(err){

        console.error(err);

    }

}



maintenanceToggle?.addEventListener(
"change",
async()=>{

    try{

       await setDoc(
    settingsRef,
    {
        maintenance: maintenanceToggle.checked,
        updatedAt: serverTimestamp()
    },
    {
        merge: true
    }
);

        maintenanceStatus.textContent=
        maintenanceToggle.checked
        ? "🔴 Website Under Maintenance"
        : "🟢 Website is Live";

    }

    catch(err){

        console.error(err);

        alert(err.message);

    }

});






async function sendPremiumEmail(userData, plan, expiry) {

  const formattedExpiry =
  expiry.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });

try {

 

  const result =
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



// ---------------- DASHBOARD ----------------

async function loadDashboard() {

  usersBody.innerHTML = "";

  try {

    const snap =
    await getDocs(
      collection(db, "users")
    );

    let total = 0;
    let premium = 0;
    let free = 0;

    let activeUsers = 0;
    let totalSiteSeconds = 0;
    let totalLectureSeconds = 0;

    const today =
    new Date()
    .toISOString()
    .split("T")[0];

    snap.forEach(docSnap => {

      total++;

      const data =
      docSnap.data();

      // ---------- TABLE ROW ----------

      const row =
      document.createElement("tr");

      row.innerHTML = `
        <td>${data.fullname || "-"}</td>
        <td>${data.email || "-"}</td>
        <td>${data.plan || "free"}</td>
        <td>${data.role || "user"}</td>

        <td>

          <button class="premium-btn">
            Upgrade
          </button>

          <button class="remove-btn">
            Remove
          </button>

        </td>
      `;

      usersBody.appendChild(row);

      // ---------- PREMIUM BUTTON ----------

      row.querySelector(".premium-btn")
?.addEventListener(
  "click",
  async () => {

    const plan = prompt(
`Premium Plan for ${data.fullname}

Available Plans:

1 Month
6 Months
12 Months

Enter exact plan name:`
    );

    if (!plan) return;

    const validPlans = [
      "1 Month",
      "6 Months",
      "12 Months"
    ];

    if (!validPlans.includes(plan)) {

      alert(
`Invalid Plan.

Use one of these:

1 Month
6 Months
12 Months`
      );

      return;
    }

    try {

      let expiry = new Date();

      if (plan === "1 Month") {

        expiry.setMonth(
          expiry.getMonth() + 1
        );

      }

      else if (plan === "6 Months") {

        expiry.setMonth(
          expiry.getMonth() + 6
        );

      }

      else if (plan === "12 Months") {

        expiry.setFullYear(
          expiry.getFullYear() + 1
        );

      }

      await updateDoc(
        doc(
          db,
          "users",
          docSnap.id
        ),
        {
          plan: plan,
          planExpiry:
            expiry.toISOString()
        }
      );
      await sendPremiumEmail(
  data,
  plan,
  expiry
);

await addDoc(
  collection(db,"notifications"),
  {
    userId: docSnap.id,
    title: "Premium Activated 🎉",
    message:
      `Your ${plan} plan has been activated.`,
    read: false,
    createdAt:
      serverTimestamp()
  }
);

      alert(
`Premium Activated

User: ${data.fullname}
Plan: ${plan}

Expires:
${expiry.toLocaleDateString()}`
      );

      await loadDashboard();

    }

    catch (err) {

      console.error(err);

      alert(
        "Failed: " +
        err.message
      );

    }

  }
);

      // ---------- REMOVE PREMIUM ----------

      row.querySelector(".remove-btn")
?.addEventListener(
  "click",
  async () => {

    const ok = confirm(
      `Remove Premium from ${data.fullname}?`
    );

    if (!ok) return;

    try {

      await updateDoc(
        doc(
          db,
          "users",
          docSnap.id
        ),
        {
          plan: "free",
          planExpiry: null
        }
      );

      alert(
        "Premium Removed"
      );

      await loadDashboard();

    }

    catch (err) {

      console.error(err);

      alert(
        "Failed: " +
        err.message
      );

    }

  }
);

      // ---------- ACTIVE USERS ----------

      if (
        data.lastActiveDate === today
      ) {
        activeUsers++;
      }

      // ---------- TOTAL TIMES ----------

      totalSiteSeconds +=
      data.totalSiteSeconds || 0;

      totalLectureSeconds +=
      data.totalLectureSeconds || 0;

      // ---------- PREMIUM COUNT ----------

      const premiumPlans = [
        "1 Month",
        "6 Months",
        "12 Months"
      ];

      if (
        premiumPlans.includes(
          data.plan
        )
      ) {

        premium++;

      } else {

        free++;

      }

    });

    // ---------- STATS ----------

    totalUsersEl.innerText =
    total;

    premiumUsersEl.innerText =
    premium;

    freeUsersEl.innerText =
    free;

    document.getElementById(
      "activeUsers"
    ).innerText =
    activeUsers;

    document.getElementById(
      "siteHours"
    ).innerText =
    Math.floor(
      totalSiteSeconds / 3600
    );

    document.getElementById(
      "lectureHours"
    ).innerText =
    Math.floor(
      totalLectureSeconds / 3600
    );

  }

  catch (err) {

    console.error(
      "Dashboard Error:",
      err
    );

  }

}

async function loadAnnouncements() {

  if (!announcementList) return;

  try {

    const snap = await getDocs(
      collection(db, "announcements")
    );

    announcementList.innerHTML = "";

    if (snap.empty) {

      announcementList.innerHTML = `
        <div class="card">
          No announcements found.
        </div>
      `;

      return;
    }

    snap.forEach(docSnap => {

      const data = docSnap.data();

      const div =
      document.createElement("div");

      div.className = "card";

      div.innerHTML = `
  <h3>
    ${data.pinned ? "📌" : "📢"}
    ${data.title}
  </h3>

 <p>${data.message}</p>

${
data.link
?
`
<a
href="${data.link}"
target="_blank"
class="announcement-link">
${data.buttonText || "Open"}
</a>
`
:
""
}

  <button class="pin-announcement">
    ${data.pinned ? "Unpin" : "Pin"}
  </button>

  <button class="delete-announcement">
    Delete
  </button>
`;

      announcementList.appendChild(div);
      div.querySelector(
  ".pin-announcement"
)?.addEventListener(
  "click",
  async () => {

    try {

      await updateDoc(
        doc(
          db,
          "announcements",
          docSnap.id
        ),
        {
          pinned: !data.pinned
        }
      );

      await loadAnnouncements();

    }

    catch(err){

      console.error(err);

      alert(err.message);

    }

  }
);
      div.querySelector(
        ".delete-announcement"
      )?.addEventListener(
        "click",
        async () => {

          const ok = confirm(
            "Delete this announcement?"
          );

          if (!ok) return;

          try {

            await deleteDoc(
              doc(
                db,
                "announcements",
                docSnap.id
              )
            );

            await loadAnnouncements();

          }

          catch(err){

            console.error(err);

            alert(err.message);

          }

        }
      );

    });

  }

  catch(err){

    console.error(
      "Announcement Error:",
      err
    );

  }

}
// ---------------- AUTH ----------------

onAuthStateChanged(
  auth,
  
  async (user) => {

    if (!user) return;

    try {

      const snap =
      await getDoc(
        doc(
          db,
          "users",
          user.uid
        )
      );

      if (
        snap.exists()
      ) {

        adminName.textContent =
          "Welcome Admin, " +
          snap.data().fullname;

        await loadDashboard();
        await loadAnnouncements();
        await loadMaintenance();

      }

    }

    catch (err) {

      console.error(err);

    }

  }
);

const publishBtn =
document.getElementById(
  "publishAnnouncement"
);

publishBtn?.addEventListener(
  "click",
  async () => {

    const title =
    document
    .getElementById(
      "announcementTitle"
    )
    .value
    .trim();

    const message =
    document
    .getElementById(
      "announcementMessage"
    )
    .value
    .trim();
const link =
document
.getElementById(
  "announcementLink"
)
.value
.trim();

const buttonText =
document
.getElementById(
  "announcementButtonText"
)
.value
.trim();

    if (!title || !message) {

      alert(
        "Fill all fields"
      );

      return;
    }

    try {

await addDoc(
  collection(db,"announcements"),
  {
    title,
    message,
    link,
    buttonText,
    active:true,
    pinned:false,
    createdAt:serverTimestamp()
  }
      );

      alert(
        "Announcement Published"
      );

      document.getElementById(
        "announcementTitle"
      ).value = "";

      document.getElementById(
        "announcementMessage"
      ).value = "";

      await loadAnnouncements();

    }

    catch(err){

      console.error(err);

      alert(err.message);

    }

  }
);

// ---------------- LOGOUT ----------------

logoutBtn?.addEventListener(
  "click",
  async () => {

    await signOut(auth);

    location.replace(
      ROUTES.HOME
    );

  }
);