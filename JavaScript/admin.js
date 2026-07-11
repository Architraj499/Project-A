// admin.js
import emailjs from "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/+esm";
import { ROUTES } from "./config/routes.js";import { APP } from "./config/version.js";

const versionEl = document.getElementById("version");

if(versionEl){

    versionEl.textContent =
    `${APP.NAME} v${APP.VERSION} (${APP.RELEASE})`;

}

emailjs.init("siChPjqF00KVyxv8O");
import { db } from "./config/firebase.js";
import {  auth,signOut } from "./config/firebase.js";

import {
    onUserChanged
} from "./core/auth.js";

import {
  doc,
  getDoc,
  collection,
  getDocs,
  query,
    orderBy,
    limit,
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

<button class="view-btn">
    View
</button>

<button class="premium-btn">
    Upgrade
</button>

<button class="remove-btn">
    Remove
</button>

</td>


        
      `;

      usersBody.appendChild(row);
// ---------- VIEW USER ----------

row.querySelector(".view-btn")
?.addEventListener("click", async ()=>{

    await openUserModal(
        docSnap.id,
        data
    );

});
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

onUserChanged(async (user) => {

    if (!user) return;

    try {

        const snap = await getDoc(
            doc(db, "users", user.uid)
        );

        if (!snap.exists()) return;

        adminName.textContent =
        "Welcome Admin, " +
        snap.data().fullname;

        await loadDashboard();

        await loadAnnouncements();

        await loadMaintenance();

    }

    catch (err) {

        console.error(err);

    }

});

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





async function openUserModal(uid,data){

    document.getElementById("userModal")
    .style.display="flex";

    document.getElementById("modalName")
    .innerText =
    data.fullname || "-";

    document.getElementById("modalEmail")
    .innerText =
    data.email || "-";

    document.getElementById("modalPlan")
    .innerText =
    data.plan || "Free";

    document.getElementById("modalRole")
    .innerText =
    data.role || "User";

    document.getElementById("modalUID")
    .innerText =
    uid;

    document.getElementById("modalAvatar")
    .innerText =
    (data.fullname || "U")
    .charAt(0)
    .toUpperCase();

    document.getElementById("modalStudy")
    .innerText =
    Math.floor(
        (data.totalLectureSeconds||0)
        /3600
    )+" h";

    document.getElementById("modalSite")
    .innerText =
    Math.floor(
        (data.totalSiteSeconds||0)
        /3600
    )+" h";

    document.getElementById("modalStreak")
    .innerText =
    data.streakCount || 0;

    document.getElementById("modalJoined")
    .innerText =
    data.createdAt
    ? new Date(data.createdAt)
        .toLocaleDateString()
    : "-";
    try{

    
const loginSnap = await getDocs(

    query(

        collection(
            db,
            "users",
            uid,
            "loginLogs"
        ),

        orderBy(
            "loginTime",
            "desc"
        ),

        limit(1)

    )

);

    if(!loginSnap.empty){

        const login =
        loginSnap.docs[0].data();

        document.getElementById("modalDevice")
        .innerText =
        login.device || "-";

        document.getElementById("modalBrowser")
        .innerText =
        login.browser || "-";

        document.getElementById("modalLocation")
        .innerText =
        login.location ||

        `${login.city || ""}, ${login.region || ""}, ${login.country || ""}`;

        document.getElementById("modalLastLogin")
        .innerText =
        login.loginTime
        ?.toDate()
        .toLocaleString()
        || "-";

    }

}

catch(err){

    console.error(err);

}
await loadLoginHistory(uid);

await loadActivity(uid);


}

async function loadLoginHistory(uid){

    const container =
    document.getElementById(
        "loginHistoryContainer"
    );

    container.innerHTML =
    "<p>Loading...</p>";

    try{

     const snap = await getDocs(

    query(

        collection(
            db,
            "users",
            uid,
            "loginLogs"
        ),

        orderBy(
            "loginTime",
            "desc"
        ),

        limit(10)

    )

);
console.log(snap.size);
        console.log("Login History Docs:", snap.size);

        if(snap.empty){

            container.innerHTML =
            "<p>No Login History</p>";

            return;

        }

        container.innerHTML="";

        snap.forEach(doc=>{

            const d =
            doc.data();

            container.innerHTML +=

            `
            <div class="history-card">

                <div>

                    <strong>

                        ${d.device}

                    </strong>

                    •

                    ${d.browser}

                </div>

                <div>

                    📍 ${d.location ||
                    `${d.city},
                    ${d.region}`}

                </div>

                <div>

                    🌐 ${d.ip}

                </div>

                <small>

                    ${
                    d.loginTime
                    ?.toDate()
                    .toLocaleString()
                    }

                </small>

            </div>

            `;

        });

    }

   catch(err){

    console.error(err);

}



}
const activityLabels = {

    lecture: "🎥 Played Lecture",

    lecture_completed: "✅ Lecture Completed",

    notes_open: "📖 Opened Notes",

    notes_download: "⬇ Downloaded Notes",

    mock_generate: "🤖 AI Mock Generated",

    pyq_open: "📄 Opened PYQ",

    pyq_download: "⬇ Downloaded PYQ",

    ncert_open: "📚 Opened NCERT",

    ncert_download: "⬇ Downloaded NCERT"

};
async function loadActivity(uid){

  console.log("Modal UID:", uid);
console.log("Current Logged In UID:", auth.currentUser.uid);

    const container =
    document.getElementById(
        "activityContainer"
    );

    container.innerHTML =
    "<p>Loading...</p>";

    try{

        const snap =
        await getDocs(

            query(

                collection(
                    db,
                    "users",
                    uid,
                    "activity"
                ),

                orderBy(
                    "time",
                    "desc"
                ),

                limit(5)

            )

        );
        console.log("Activity Docs:", snap.size);

        if(snap.empty){

            container.innerHTML =
            "<p>No Activity</p>";

            return;

        }

        container.innerHTML="";

        snap.forEach(doc=>{

            const d =
            doc.data();

            container.innerHTML +=

            `
            <div class="history-card">

                <strong>
                 ${activityLabels[d.type] || d.type}

                </strong>

                <br>

                ${d.title || ""}

                <br>

                <small>

                    ${
                    d.time
?.toDate()
.toLocaleString()
                    }

                </small>

            </div>

            `;

        });

    }

    catch(err){

        console.error(err);

    }

}



document
.getElementById("closeUserModal")
.addEventListener("click",()=>{

    document
    .getElementById("userModal")
    .style.display="none";

});

window.addEventListener("click",(e)=>{

    if(
        e.target.id==="userModal"
    ){

        document
        .getElementById("userModal")
        .style.display="none";

    }

});
  
// ---------------- LOGOUT ----------------

logoutBtn?.addEventListener(
  "click",
  async () => {

    await signOut(auth);
    sessionStorage.removeItem("loginLogged");
sessionStorage.removeItem("userData");


    location.replace(
      ROUTES.HOME
    );

  }
);