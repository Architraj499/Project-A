import { db } from "./universal.js";

import {
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs
}
from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const container =
document.getElementById(
  "announcementsContainer"
);

async function loadAnnouncements() {

  try {

    const q = query(
      collection(
        db,
        "announcements"
      ),
      where(
        "active",
        "==",
        true
      ),
      orderBy(
        "createdAt",
        "desc"
      ),
      limit(5)
    );

    const snap =
    await getDocs(q);

    container.innerHTML = "";

    if (snap.empty) {

      container.innerHTML = `
        <div class="card">
          <h3>No Announcements</h3>
          <p>Nothing posted yet.</p>
        </div>
      `;

      return;
    }

    const announcements = [];

    snap.forEach(docSnap => {

      announcements.push({
        id: docSnap.id,
        ...docSnap.data()
      });

    });

    // Pinned First

    announcements.sort((a, b) => {

      if (a.pinned && !b.pinned)
        return -1;

      if (!a.pinned && b.pinned)
        return 1;

      return 0;

    });

    announcements.forEach(data => {

      const card =
      document.createElement("div");

      card.className =
      data.pinned
      ? "card pinned-card"
      : "card";

      card.innerHTML = `
        <h3>
          ${data.pinned ? "📌" : "📢"}
          ${data.title}
        </h3>

        <p>
          ${data.message}
        </p>

        ${
          data.link
          ?
          `
          <a
href="${
data.link.startsWith('http')
? data.link
: 'https://' + data.link
}"
target="_blank"
rel="noopener noreferrer"
class="announcement-link">

${data.buttonText || "Open"}

</a>
          `
          :
          ""
        }
      `;

      container.appendChild(
        card
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

loadAnnouncements();