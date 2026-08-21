// universal.js
import {
  auth,
  db,

  onAuthStateChanged,
  signOut,

  doc,
  getDoc,
  setDoc,
  updateDoc,

  collection,
  addDoc,

  serverTimestamp

} from "./config/firebase.js";
import { onUserLoaded } from "./core/user.js";


import { ROUTES } from "./config/routes.js";
import { APP } from "./config/version.js";

const version =
document.getElementById("version");

if(version){

    version.textContent =
    `${APP.NAME} v${APP.VERSION} (${APP.TYPE})`;

}


const lastUpdatedEl =
document.getElementById("lastUpdated");
if(lastUpdatedEl){
    lastUpdatedEl.textContent = APP.UPDATE;
}

window.ytPlayer = null;
window.currentLectureId = null;
window.watchedSeconds = 0;

const PREMIUM_PLANS = [
    "1 Month",
    "6 Months",
    "12 Months"
];

async function checkWebsiteMaintenance(user){

    try{

        const settingsSnap =
        await getDoc(
            doc(db,"settings","website")
        );

        if(!settingsSnap.exists()) return;

        const maintenance =
        settingsSnap.data().maintenance;

        if(!maintenance) return;

        // Guest users
      if (!user) {

    if (!location.pathname.endsWith(ROUTES.MAINTENANCE)) {

        location.replace(ROUTES.MAINTENANCE);

    }

    return;

}


        // Logged in users
        const userSnap =
        await getDoc(
            doc(db,"users",user.uid)
        );

        const role =
        userSnap.exists()
        ? userSnap.data().role
        : "user";

        if(role !== "admin"){

            if(!location.pathname.endsWith(ROUTES.MAINTENANCE)){

                location.replace(ROUTES.MAINTENANCE);

            }

        }

    }

    catch(err){

        console.error(err);

    }

}
let isPremiumUser = false;


// ---------- Globals ----------
let currentUserId = null;
let currentUserData = null;
const LECTURES = window.LECTURES || [];
let lastActivityKey = "";
let lastActivityTime = 0;

let lastSiteSave = 0;
let lastLectureSave = 0;
const localName = localStorage.getItem("fullname");

if (localName) {
  const el = document.getElementById("fullname");
  if (el) el.innerText = localName;
}

// ---------- UI Helpers ----------
function escapeHtml(s) {
  return (s || '')
    .replace(/"/g, '&quot;')
    .replace(/'/g, "&apos;");
}

function minutesToSeconds(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return 0;
    }

    const text =
        String(value)
            .trim()
            .toLowerCase();

    if (!text || text === "tba") {
        return 0;
    }


    // ------------------------------------------
    // Pure number
    // Example: "56"
    // ------------------------------------------

    if (
        /^\d+(\.\d+)?$/.test(text)
    ) {

        return (
            Number(text) * 60
        );

    }


    // ------------------------------------------
    // Hours + minutes
    // Examples:
    // "1hr 35min"
    // "1 hour 35 minutes"
    // "1h 35m"
    // ------------------------------------------

    const hoursMatch =
        text.match(
            /(\d+(?:\.\d+)?)\s*(?:hr|hrs|hour|hours|h)\b/
        );

    const minutesMatch =
        text.match(
            /(\d+(?:\.\d+)?)\s*(?:min|mins|minute|minutes|m)\b/
        );


    const hours =
        hoursMatch
            ? Number(hoursMatch[1])
            : 0;


    const minutes =
        minutesMatch
            ? Number(minutesMatch[1])
            : 0;


    if (
        hours > 0 ||
        minutes > 0
    ) {

        return (
            hours * 3600 +
            minutes * 60
        );

    }


    // ------------------------------------------
    // Fallback
    // ------------------------------------------

    return 0;
}
window.minutesToSeconds = minutesToSeconds;

// ---------- Activity ----------
async function saveActivity(type, title, lectureId = "", extra = {}) {
  if (!currentUserId) return;

  const now = Date.now();
  const activityKey = `${type}_${title}_${lectureId}`;

  // prevent spam within 3 sec
  if (lastActivityKey === activityKey && (now - lastActivityTime < 3000)) {
    return;
  }

  lastActivityKey = activityKey;
  lastActivityTime = now;

  const today = new Date().toISOString().split("T")[0];

  try {
    await addDoc(collection(db, "users", currentUserId, "activity"), {
      type,
      title,
      lectureId,
      date: today,
      time: serverTimestamp(),
      createdAtMs: now,
      subject: document.querySelector(".subject-card h1")?.innerText || "Subject",
      course: window.Course || "Course",
      ...extra
    });

    
  } catch (err) {
   
  }
}

// ---------- Subject Progress ----------
async function saveSubjectProgress(course, subject, percent) {
 
  const key = "progress_" + course + "_" + subject;

  // keep local for fast UI
  localStorage.setItem(key, percent);

  // 🔥 save to firestore
  if (!currentUserId) return;

  try {
    const userRef = doc(db, "users", currentUserId);

    await updateDoc(userRef, {
      [`subjectProgress.${course}.${subject}`]: percent
    });



  } catch (err) {
    console.error("Subject progress save error:", err);
  }
}

function updateOverall() {
  if (!LECTURES.length) return;

  const avg = Math.round(
    (LECTURES.reduce((s, l) => s + (l.progress || 0), 0) / LECTURES.length) * 100
  );

  const overallPercentEl = document.getElementById('overallPercent');
  const ringPercentEl = document.getElementById('ringPercent');
  const overallBarEl = document.getElementById('overallBar');

  if (overallPercentEl) overallPercentEl.innerText = avg + '%';
  if (ringPercentEl) ringPercentEl.innerText = avg + '%';
  if (overallBarEl) overallBarEl.style.width = avg + '%';

  const course = window.Course || "Unknown";
  const subject = document.querySelector(".subject-card h1")?.innerText || "Subject";

  saveSubjectProgress(course, subject, avg);
}

// ---------- Reusable Section Creator ----------
function createSectionContainer(section) {
  const container = document.createElement('div');
  container.className = 'section-container';

  const heading = document.createElement('h2');
  heading.className = 'section-heading';
  heading.innerText = section;

  const wrapper = document.createElement('div');
  wrapper.className = 'section-grid';

  container.appendChild(heading);
  container.appendChild(wrapper);

  return { container, wrapper };
}

// ---------- Render ----------
function renderAll() {
  const grid = document.getElementById('cardsGrid');
  const notesGrid = document.getElementById('notesGrid');
  const pyqGrid = document.getElementById('pyqGrid');
  const ncertGrid = document.getElementById('ncertGrid');
  const mockGrid = document.getElementById('mockGrid');

  if (!grid) return;

  grid.innerHTML = '';
  if (notesGrid) notesGrid.innerHTML = '';
  if (pyqGrid) pyqGrid.innerHTML = '';
  if (mockGrid) mockGrid.innerHTML = '';
  if (ncertGrid) ncertGrid.innerHTML = '';

  const sections = [...new Set(LECTURES.map(l => l.section || 'General'))];

  sections.forEach(section => {
    const sectionLectures = LECTURES.filter(l => (l.section || 'General') === section);

    // ---------- LECTURES ----------
    const lectureContainer = createSectionContainer(section);
    grid.appendChild(lectureContainer.container);

    sectionLectures.forEach(l => {
      const div =
    document.createElement('div');

div.className = 'card';

div.dataset.lectureId =
    l.id;

      div.innerHTML = `
        <div class="row">
          <div class="badge">CH • ${l.id}</div>
          <div class="muted">${l.teacher || ""}</div>
        </div>

        <div class="chapter-title">${l.title}</div>

       <div
    class="muted"
    data-progress-status
>
    ${l.progress >= 1
        ? '<span style="color:#22c55e;font-weight:600">✔ Completed</span>'
        : '<span style="color:#f97316">⏳ Pending</span>'
    }
</div>

        <div class="muted">Lecture: 1 • Duration — ${l.min || "TBA"}</div>

        <div
  style="display:flex; gap:12px; align-items:center"
  data-lecture-id="${l.id}"
>

  <div
    class="ring"
    data-progress-percent="${l.id}"
  >
    ${Math.round((l.progress || 0) * 100)}%
  </div>

  <div style="flex:1">

    <div class="progress">

      <i
        data-progress-bar="${l.id}"
        style="width:${(l.progress || 0) * 100}%"
      ></i>

    </div>

  </div>

</div>

       <div class="actions">
  <button class="small play"
    onclick="openVideo('${escapeHtml(l.video)}','${escapeHtml(l.title)}','${l.id}')">
    Play
  </button>
<button class="small view"
  onclick="openLectureNotes('${l.id}')">
  ${l.premium ? " Notes " : "Open"}
</button>
  <button class="small mock-btn mobile-only"
    onclick="openAIMock('${escapeHtml(l.title)}')">
    AI Mock
  </button>
</div>
      `;

      lectureContainer.wrapper.appendChild(div);
    });

    // ---------- NOTES ----------
    if (notesGrid) {
      const notesContainer = createSectionContainer(section);
      notesGrid.appendChild(notesContainer.container);

      sectionLectures.forEach(l => {
        const n = document.createElement('div');
        n.className = 'card';

        n.innerHTML = `
          <div class="badge">Notes</div>
          <div class="chapter-title">${l.title}</div>
          <div class="muted">Revision Notes</div>
          <div class="actions">

  <button class="small view notes-open">
    ${isPremiumUser ? " Open" : "Notes"}
  </button>

  <button class="small download notes-download">
    ${isPremiumUser ? "⬇ Download" : "Download"}
  </button>

</div>`;

        notesContainer.wrapper.appendChild(n);

       n.querySelector(".notes-open")?.addEventListener("click", async () => {

  // CHECK PREMIUM ACCESS

if (lecture.premium === true) {

    if (
        !currentUserData ||
        !PREMIUM_PLANS.includes(currentUserData.plan)
    ) {

        openPremiumModal();

        return;

    }

}


  // OPEN NOTES
  window.open(l.notes || "#", "_blank");

  saveActivity("notes_open", l.title, l.id, {
    action: "open",
    fileType: "notes"
  });

});

        n.querySelector(".notes-download")?.addEventListener("click", async () => {
          // CHECK PREMIUM ACCESS

if (lecture.premium === true) {

    if (
        !currentUserData ||
        !PREMIUM_PLANS.includes(currentUserData.plan)
    ) {

        openPremiumModal();

        return;

    }

}
          saveActivity("notes_download", l.title, l.id, {
            action: "download",
            fileType: "notes"
          });
        });
      });
    }

    // ---------- PYQ ----------
    if (pyqGrid) {
      const pyqContainer = createSectionContainer(section);
      pyqGrid.appendChild(pyqContainer.container);

      sectionLectures.forEach(l => {
        const p = document.createElement('div');
        p.className = 'card';

        p.innerHTML = `
          <div class="badge">PYQ</div>
          <div class="chapter-title">${l.title}</div>
          <div class="muted">Topicwise PYQs</div>
          <div class="actions">
            <a class="small view pyq-open" href="${l.pyq || '#'}" target="_blank">Open</a>
            <a class="small download pyq-download" href="${l.pyq || '#'}" download>Download</a>
          </div>`;

        pyqContainer.wrapper.appendChild(p);

        p.querySelector(".pyq-open")?.addEventListener("click", () => {
          
          saveActivity("pyq_open", l.title, l.id, {
            action: "open",
            fileType: "pyq"
          });
        });

        p.querySelector(".pyq-download")?.addEventListener("click", () => {
          saveActivity("pyq_download", l.title, l.id, {
            action: "download",
            fileType: "pyq"
          });
        });
      });
    }

    // ---------- AI MOCK TEST ----------
    if (mockGrid) {
      const mockContainer = createSectionContainer(section);
      mockGrid.appendChild(mockContainer.container);

      sectionLectures.forEach(l => {
        const m = document.createElement('div');
        m.className = 'card';

        m.innerHTML = `
          <div class="badge">AI MOCK</div>
          <div class="chapter-title">${l.title}</div>
          <div class="muted">Generate Chapter-wise AI Test</div>
          <div class="actions">
            <button class="small view" onclick="openAIMock('${escapeHtml(l.title)}')">Generate</button>
          </div>`;

        mockContainer.wrapper.appendChild(m);
      });
    }

    // ---------- NCERT ----------
    if (ncertGrid) {
      const ncertContainer = createSectionContainer(section);
      ncertGrid.appendChild(ncertContainer.container);

      sectionLectures.forEach(l => {
        if (l.ncert && l.ncert !== '#') {
          const n = document.createElement('div');
          n.className = 'card';

          n.innerHTML = `
            <div class="badge">NCERT</div>
            <div class="chapter-title">${l.title}</div>
            <div class="muted">NCERT Book</div>
            <div class="actions">
              <a class="small view ncert-open" href="${l.ncert}" target="_blank">Open</a>
              <a class="small download ncert-download" href="${l.ncert}" download>Download</a>
            </div>`;

          ncertContainer.wrapper.appendChild(n);

          n.querySelector(".ncert-open")?.addEventListener("click", () => {
            saveActivity("ncert_open", l.title, l.id, {
              action: "open",
              fileType: "ncert"
            });
          });

          n.querySelector(".ncert-download")?.addEventListener("click", () => {
            saveActivity("ncert_download", l.title, l.id, {
              action: "download",
              fileType: "ncert"
            });
          });
        }
      });
    }
  });

  updateOverall();
}

// ==========================================================
// YouTube Video Player + Real Progress Tracking
// ==========================================================

let ytPlayer = null;
let currentLectureId = null;
let currentVideoId = null;

let progressSaveInterval = null;
let lastSavedVideoSecond = 0;

let youtubeReady = false;
let playerReady = false;


// ==========================================================
// YouTube API Ready
// ==========================================================

window.onYouTubeIframeAPIReady = function () {

    youtubeReady = true;

    
};


// ==========================================================
// Extract YouTube Video ID
// ==========================================================

function getYouTubeVideoId(rawUrl) {

    if (!rawUrl) return null;


    const embedMatch =
        rawUrl.match(
            /youtube(?:-nocookie)?\.com\/embed\/([^?&/]+)/
        );


    const watchMatch =
        rawUrl.match(
            /[?&]v=([^?&]+)/
        );


    const shortMatch =
        rawUrl.match(
            /youtu\.be\/([^?&/]+)/
        );


    if (embedMatch) {

        return embedMatch[1];

    }


    if (watchMatch) {

        return watchMatch[1];

    }


    if (shortMatch) {

        return shortMatch[1];

    }


    return null;

}


// ==========================================================
// Open Video
// ==========================================================

function openVideoOriginal(lectureId, rawUrl, title) {

    

    if (
        !rawUrl ||
        rawUrl === "#"
    ) {

        alert(
            "Video will be uploaded soon."
        );

        return;

    }


    const videoId =
        getYouTubeVideoId(rawUrl);


    if (!videoId) {

        console.error(
            "Invalid YouTube URL:",
            rawUrl
        );

        alert(
            "Invalid YouTube video."
        );

        return;

    }


    currentLectureId =
        lectureId;

    window.currentLectureId =
        lectureId;

    currentVideoId =
        videoId;


    const modal =
        document.getElementById(
            "videoModal"
        );


    const iframe =
        document.getElementById(
            "videoIframe"
        );


    if (!modal || !iframe) {

        console.error(
            "Video modal/player not found."
        );

        return;

    }


    document.getElementById(
        "modalTitle"
    ).innerText =
        title || "Lecture";


    // ======================================================
// RESUME POSITION
// Firebase = primary
// localStorage = fallback
// ======================================================

const firebasePosition =
    Number(
        currentUserData?.videoPosition?.[lectureId]
    );

const localPosition =
    Number(
        localStorage.getItem(
            `yt_${lectureId}`
        )
    ) || 0;

const savedTime =
    Number.isFinite(firebasePosition) &&
    firebasePosition > 0
        ? firebasePosition
        : localPosition;




    lastSavedVideoSecond =
        savedTime;


    modal.classList.add("open");

    modal.setAttribute(
        "aria-hidden",
        "false"
    );

    document.body.style.overflow =
        "hidden";


    // ======================================================
    // FIRST OPEN
    // ======================================================

    if (
        !ytPlayer ||
        !playerReady
    ) {

        createYouTubePlayer(
            iframe,
            videoId,
            savedTime
        );

    }

    // ======================================================
    // REOPEN EXISTING PLAYER
    // ======================================================

    else {

       


        try {

            ytPlayer.loadVideoById({
                videoId: videoId,
                startSeconds: savedTime
            });

        }

        catch (error) {

            console.error(
                "Failed to reuse YouTube player:",
                error
            );

            // Fallback: recreate player

            playerReady =
                false;

            createYouTubePlayer(
                iframe,
                videoId,
                savedTime
            );

        }

    }


    startLectureTimer();

}


// ==========================================================
// Create Player
// ==========================================================
function createYouTubePlayer(
    iframe,
    videoId,
    resumeTime
) {

    playerReady = false;


    if (ytPlayer) {

        try {
            ytPlayer.destroy();
        }

        catch (error) {
            console.warn(
                "Old player cleanup:",
                error
            );
        }

        ytPlayer = null;
    }


    // ==========================================
    // YouTube iframe configuration
    // ==========================================

    iframe.setAttribute(
        "referrerpolicy",
        "strict-origin-when-cross-origin"
    );

    iframe.setAttribute(
        "allow",
        "autoplay; encrypted-media; picture-in-picture"
    );


    const origin =
        window.location.origin;


    iframe.src =
        `https://www.youtube.com/embed/${videoId}` +
        `?enablejsapi=1` +
        `&origin=${encodeURIComponent(origin)}` +
        `&playsinline=1` +
        `&autoplay=1` +
        `&mute=1` +
        `&rel=0`;


    ytPlayer =
        new YT.Player(
            iframe,
            {

                events: {

                    onReady:
                        function (event) {

                            playerReady = true;

                          


                            if (
                                resumeTime > 0
                            ) {

                                event.target.seekTo(
                                    resumeTime,
                                    true
                                );

                            }


                            event.target.playVideo();

                        },


                    onStateChange:
                        function (event) {

                            handleYouTubeState(
                                event
                            );

                        },


                    onError:
                        function (event) {

                            console.error(
                                "YouTube player error:",
                                event.data
                            );

                        },


                    onAutoplayBlocked:
                        function () {

                          

                        }

                }

            }
        );

}


// ==========================================================
// YouTube State
// ==========================================================

function handleYouTubeState(
    event
) {

    if (
        event.data ===
        YT.PlayerState.PLAYING
    ) {

        

        startVideoProgressTracking();

    }

    else {

       

        stopVideoProgressTracking();

        saveCurrentVideoProgress();

    }

}


// ==========================================================
// Progress Tracking
// ==========================================================

function startVideoProgressTracking() {

    stopVideoProgressTracking();


    progressSaveInterval =
        setInterval(
            saveCurrentVideoProgress,
            5000
        );

}


function stopVideoProgressTracking() {

    if (
        progressSaveInterval
    ) {

        clearInterval(
            progressSaveInterval
        );

        progressSaveInterval =
            null;

    }

}


// ==========================================================
// Save Actual YouTube Position
// ==========================================================
async function saveCurrentVideoProgress() {
   

    if (
        !ytPlayer ||
        !playerReady ||
        !currentLectureId
    ) {
        return;
    }

    if (
        typeof ytPlayer.getCurrentTime !== "function" ||
        typeof ytPlayer.getDuration !== "function"
    ) {
        return;
    }

    try {

        const currentTime =
            ytPlayer.getCurrentTime();

        const videoDuration =
            ytPlayer.getDuration();


        if (
            !Number.isFinite(currentTime) ||
            !Number.isFinite(videoDuration) ||
            videoDuration <= 0
        ) {
            return;
        }


        const seconds =
            Math.floor(currentTime);


        const progress =
            Math.min(
                currentTime / videoDuration,
                1
            );


        const percentage =
            Math.round(progress * 100);


        // ======================================================
        // LOCAL RESUME POSITION
        // ======================================================

        localStorage.setItem(
            `yt_${currentLectureId}`,
            String(seconds)
        );

// ======================================================
// FIREBASE RESUME POSITION
// ======================================================

if (currentUserId) {

    await saveVideoPosition(
        currentLectureId,
        seconds
    );

}
        // ======================================================
        // FIND LECTURE
        // ======================================================

        const lecture =
            LECTURES.find(
                lecture =>
                    lecture.id === currentLectureId
            );


        if (!lecture) {
            return;
        }


        lecture.progress =
    progress;

updateLectureProgressUI(
    currentLectureId,
    progress
);

        // ======================================================
        // COMPLETION
        // ======================================================

        if (
            progress >= 0.95 &&
            !lecture.completed
        ) {

            lecture.completed =
                true;


           

            // Use your existing completion function
            await markCompleted(
                currentLectureId
            );

        }


        // ======================================================
        // FIRESTORE PROGRESS
        // ======================================================

        if (
            currentUserId
        ) {

            await saveLectureProgress(
                currentLectureId,
                progress
            );

        }


        // ======================================================
        // UI
        // ======================================================

        updateOverallUIOnly();


       


        lastSavedVideoSecond =
            seconds;


    }
    catch (error) {

        console.error(
            "Video progress error:",
            error
        );

    }

}
// ==========================================================
// UI Progress
// ==========================================================
// ==========================================================
// Update Single Lecture Progress UI
// ==========================================================
function updateLectureProgressUI(lectureId, progress) {

    const percentage =
        Math.round(
            progress * 100
        );


    // Find elements belonging to this lecture.
    // Your lecture card should have data-lecture-id.

    const elements =
        document.querySelectorAll(
            `[data-lecture-id="${lectureId}"]`
        );


    if (!elements.length) {
        return;
    }


    elements.forEach(
        element => {

            // ------------------------------------------
            // Progress percentage
            // ------------------------------------------

            const percentEl =
                element.querySelector(
                    "[data-progress-percent]"
                );


            if (percentEl) {

                percentEl.textContent =
                    percentage + "%";

            }


            // ------------------------------------------
            // Progress bar
            // ------------------------------------------

            const barEl =
                element.querySelector(
                    "[data-progress-bar]"
                );


            if (barEl) {

                barEl.style.width =
                    percentage + "%";

            }


            // ------------------------------------------
            // Completed state
            // ------------------------------------------

            if (
                progress >= 0.95
            ) {

                element.classList.add(
                    "completed"
                );

            }

        }
    );

}


function updateOverallUIOnly() {

    const total =
        LECTURES.reduce(
            (sum, lecture) =>
                sum +
                (Number(lecture.progress) || 0),
            0
        );

    const percentage =
        LECTURES.length
            ? Math.round(
                (total / LECTURES.length) * 100
            )
            : 0;


    const overallPercent =
        document.getElementById(
            "overallPercent"
        );

    const overallBar =
        document.getElementById(
            "overallBar"
        );


    if (overallPercent) {

        overallPercent.innerText =
            percentage + "%";

    }


    if (overallBar) {

        overallBar.style.width =
            percentage + "%";

    }

}
// ==========================================================
// Close Modal
// ==========================================================

function closeModal() {

// ==========================================================
// Live Frontend Lecture Progress
// ==========================================================
function updateLectureProgressUI(
    lectureId,
    progress
) {

    const percentage =
        Math.round(
            progress * 100
        );


    // Find the card belonging to this lecture

    const card =
        document.querySelector(
            `.card[data-lecture-id="${lectureId}"]`
        );


    if (!card) {
        return;
    }


    // Percentage ring

    const percentEl =
        card.querySelector(
            `[data-progress-percent="${lectureId}"]`
        );


    if (percentEl) {

        percentEl.textContent =
            percentage + "%";

    }


    // Progress bar

    const progressBar =
        card.querySelector(
            `[data-progress-bar="${lectureId}"]`
        );


    if (progressBar) {

        progressBar.style.width =
            percentage + "%";

    }


    // Completion label

    const statusEl =
        card.querySelector(
            "[data-progress-status]"
        );


    if (statusEl) {

        if (
            progress >= 0.95
        ) {

            statusEl.innerHTML =
                '<span style="color:#22c55e;font-weight:600">✔ Completed</span>';

        } else {

            statusEl.innerHTML =
                '<span style="color:#f97316">⏳ Pending</span>';

        }

    }

}

    saveCurrentVideoProgress();


    stopVideoProgressTracking();


    // IMPORTANT:
    // Do NOT destroy the YouTube player.
    // Do NOT clear iframe.src.

    if (
        ytPlayer &&
        playerReady
    ) {

        try {

            ytPlayer.pauseVideo();

        }

        catch (error) {

            console.warn(
                "Could not pause YouTube player:",
                error
            );

        }

    }


    const modal =
        document.getElementById(
            "videoModal"
        );


    if (modal) {

        modal.classList.remove(
            "open"
        );

        modal.setAttribute(
            "aria-hidden",
            "true"
        );

    }


    document.body.style.overflow =
        "";


    stopLectureTimer();

}
// ---------- Tabs ----------
function openTab(e) {
  const tab = e.currentTarget.dataset.tab;

  document.querySelectorAll('.tab').forEach(btn => {
    btn.classList.remove('active');
  });

  e.currentTarget.classList.add('active');

  document.querySelectorAll('.tabpanel').forEach(panel => {
    panel.style.display = panel.id === tab ? '' : 'none';
  });
}

// ---------- Filters ----------
function filterBy(mode, event) {
  document.querySelectorAll('.filter-btn').forEach(btn =>
    btn.classList.remove('active')
  );

  if (event && event.currentTarget) {
    event.currentTarget.classList.add('active');
  }

  const cards = document.querySelectorAll('#cardsGrid .card');

  cards.forEach((card, idx) => {
    const prog = window.LECTURES[idx]?.progress || 0;

    if (mode === 'completed') {
      card.style.display = prog >= 0.99 ? '' : 'none';
    } else if (mode === 'pending') {
      card.style.display = prog < 0.99 ? '' : 'none';
    } else {
      card.style.display = '';
    }
  });
}

// ---------- Lecture Progress ----------
async function saveLectureProgress(lectureId, value) {
   
  if (!currentUserId) return;
  try {
    const userRef = doc(db, "users", currentUserId);
    await updateDoc(userRef, {
      [`progress.${lectureId}`]: value
    });
  } catch (err) {
    console.error(err);
  }
}

async function markCompleted(lectureId) {

    const lec =
        LECTURES.find(
            l => l.id === lectureId
        );

    if (!lec) return;

    // Already completed
    if (lec.progress >= 1) {
        return;
    }

    lec.progress = 1;
    lec.completed = true;

   

    // ONE progress write
    await saveLectureProgress(
        lectureId,
        1
    );

    saveActivity(
        "lecture_completed",
        lec.title,
        lectureId,
        {
            action: "completed"
        }
    );

   updateOverallUIOnly();

    renderAll();
}
// ==========================================================
// Save Actual YouTube Position
// ==========================================================

async function saveVideoPosition(lectureId, seconds) {

   

    if (!currentUserId) {
        console.warn("❌ No currentUserId");
        return;
    }

    const safeSeconds =
        Math.max(
            0,
            Math.floor(Number(seconds) || 0)
        );

    try {

        await updateDoc(
            doc(
                db,
                "users",
                currentUserId
            ),
            {
                [`videoPosition.${lectureId}`]:
                    safeSeconds
            }
        );

        

    }
    catch (error) {

        console.error(
            "❌ VIDEO POSITION FIREBASE ERROR:",
            error
        );

    }
}
// ---------- Timers ----------
let siteSeconds = 0;
let siteTimerInterval = null;
let lectureSeconds = 0;
let lectureTimerInterval = null;

function formatTime(seconds) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${h}h ${m}m ${s}s`;
}

// ---------- Site Timer ----------
function updateTimeDisplay() {
  const siteEl = document.getElementById("websiteTime");
  if (siteEl) siteEl.innerText = formatTime(siteSeconds);
}




function startSiteTimer() {

    if (siteTimerInterval)
        clearInterval(siteTimerInterval);

    siteTimerInterval = setInterval(() => {

        siteSeconds++;

        updateTimeDisplay();

        // Save every 30 seconds
        if (siteSeconds - lastSiteSave >= 30) {

            lastSiteSave = siteSeconds;

            syncUserTime();
        }

    },1000);

}


// ---------- Lecture Timer ----------
async function syncUserTime() {
    

    if (!currentUserId) return;

    try {

        await updateDoc(

            doc(db, "users", currentUserId),

            {

                totalSiteSeconds: siteSeconds,

                totalLectureSeconds: lectureSeconds

            }

        );

    }

    catch (err) {

        console.error("Time Sync Error:", err);

    }

}



function startLectureTimer() {

    if (lectureTimerInterval)
        clearInterval(lectureTimerInterval);

    watchedSeconds = 0;

    lectureTimerInterval = setInterval(() => {

        lectureSeconds++;
        watchedSeconds++;

        updateLectureTimeDisplay();

        // Save every 30 seconds
        if (
            lectureSeconds -
            lastLectureSave >= 30
        ) {

            lastLectureSave =
                lectureSeconds;

            syncUserTime();

        }

    }, 1000);

}
function stopLectureTimer() {
  clearInterval(lectureTimerInterval);
  lectureTimerInterval = null;

  syncUserTime();
}

function updateLectureTimeDisplay() {
  const lecEl = document.getElementById("lectureTime");
  if (lecEl) lecEl.innerText = formatTime(lectureSeconds);
}

// ---------- Global wrappers ----------
window.openVideoOriginal = openVideoOriginal;

window.openVideo = function (rawUrl, title, lectureId) {
  saveActivity("lecture", title, lectureId, {
    action: "play"
  });

 openVideoOriginal(lectureId, rawUrl, title);
};

window.closeModal = closeModal;
window.filterBy = filterBy;
window.openTab = openTab;

// ---------- AI MOCK ----------
let currentChapter = "";

window.openLectureNotes = async function(lectureId){

  const lecture =
  LECTURES.find(l => l.id === lectureId);

  if(!lecture) return;
// CHECK PREMIUM ACCESS
if (lecture.premium === true) {

    if (
        !currentUserData ||
        !PREMIUM_PLANS.includes(currentUserData.plan)
    ) {

        openPremiumModal();

        return;

    }

}

  // OPEN NOTES
  window.open(lecture.notes || "#", "_blank");

  saveActivity(
    "notes_open",
    lecture.title,
    lecture.id,
    {
      action:"open",
      fileType:"notes"
    }
  );
}

// OPENING AI MOCK TEST

window.openAIMock = async function (chapter) {

  const lecture = LECTURES.find(l => l.title === chapter);

  if (!lecture) return;

 // CHECK PREMIUM ACCESS
if (lecture.premium === true) {

    if (
        !currentUserData ||
        !PREMIUM_PLANS.includes(currentUserData.plan)
    ) {

        openPremiumModal();

        return;

    }

}
  saveActivity("mock_generate", chapter, lecture.id, {
    action: "generate"
  });

  currentChapter = chapter;

  const courseName = window.Course || "Course";

  const chapterEl = document.getElementById("aiChapterName");
  if (chapterEl) chapterEl.innerText = chapter;

  const courseEl = document.getElementById("aiCourseName");
  if (courseEl) courseEl.innerText = courseName;

  const modal = document.getElementById("aiConfirmModal");
  if (modal) modal.style.display = "flex";
};



window.closeAIModal = function () {
  const modal = document.getElementById("aiConfirmModal");
  if (modal) modal.style.display = "none";
};

document.addEventListener("DOMContentLoaded", () => {
  const confirmBtn = document.getElementById("aiConfirmBtn");

  if (confirmBtn) {
    confirmBtn.addEventListener("click", () => {
      const difficulty = document.getElementById("aiDifficulty")?.value || "Medium";
      const count = document.getElementById("aiCount")?.value || "20";
      const course = window.Course || "Course";
      const subject =
        document.querySelector('.subject-card h1')?.innerText ||
        document.querySelector('h1')?.innerText ||
        "Subject";

      const prompt = `
Genrate a ${difficulty} level live test for the chapter "${currentChapter}" of ${subject} for ${course}.
The test should have ${count} questions covering all important topics of the chapter.
and aftter that provide a full fleged report card with marks and weakness analysis.
Keep Scroring system as cuet like 5 marks for correct and -1 for wrong answers.
Don't show answers rigth after clicking on options, show the final result at the end of the test.
Also take refrence from previous year question papers to include some PYQ styled questions.

Course: ${course}
Subject: ${subject}
Chapter: ${currentChapter}
Difficulty: ${difficulty}
Total Questions: ${count}

Rules:
- 4 options each
- Include arranging steps and matching type questions
- Include case-based questions
- Include assertion-reason type
- Provide answer key at end only
`;

      navigator.clipboard.writeText(prompt).then(() => {
        window.open("https://gemini.google.com/", "_blank");
        closeAIModal();
      }).catch(() => {
        alert("Clipboard permission denied.");
      });
    });
  }
});

// ---------- Search & Theme ----------
document.addEventListener('DOMContentLoaded', () => {
  renderAll();

  document.getElementById('searchInput')?.addEventListener('input', (ev) => {
    const q = ev.target.value.trim().toLowerCase();
    document.querySelectorAll('#cardsGrid .card').forEach(card => {
      const title = card.querySelector('.chapter-title')?.innerText.toLowerCase() || "";
      card.style.display = title.includes(q) ? '' : 'none';
    });
  });

 
  document.getElementById('videoModal')?.addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
  });

  document.getElementById("logoutBtn")?.addEventListener("click", async () => {
    try {
      await signOut(auth);
      sessionStorage.removeItem("loginLogged");
sessionStorage.removeItem("userData");

    } catch (err) {
      console.error(err);
    }
    window.location.href = ROUTES.HOME;
  });
});

// ---------- Auth ----------
window.isLoggedIn = false;
onUserLoaded((user, data) => {
     window.isLoggedIn = !!user;

   
    if (!user) return;
    if (!data) return;

    currentUserId =
        user.uid;

    currentUserData =
        data;


    // ==========================================
    // FIREBASE → LECTURES
    // ==========================================

    const firebaseProgress =
        data.progress || {};

    LECTURES.forEach(lecture => {

        if (
            firebaseProgress[lecture.id] !== undefined
        ) {

            lecture.progress =
                Number(
                    firebaseProgress[lecture.id]
                ) || 0;

            lecture.completed =
                lecture.progress >= 0.95;

        }

    });


  


    const premiumPlans = [
    "1 Month",
    "6 Months",
    "12 Months"
];

isPremiumUser =
premiumPlans.includes(data.plan);

    const nameEl =
    document.getElementById("usernameDisplay");

    if(nameEl){

        nameEl.innerText =
        data.fullname || "User";

    }

    const avatar =
    document.getElementById("avatar");

    if(avatar && data.fullname){

        avatar.textContent =
        data.fullname.charAt(0).toUpperCase();

    }

    const premiumBadge =
    document.getElementById("premiumBadge");

    if(premiumBadge){

        const premiumPlans = [
            "1 Month",
            "6 Months",
            "12 Months"
        ];

        premiumBadge.innerHTML =
        premiumPlans.includes(data.plan)
        ? "👑 Premium"
        : "Free User";

    }

    siteSeconds =
    data.totalSiteSeconds || 0;

    lectureSeconds =
    data.totalLectureSeconds || 0;

    renderAll();

    updateTimeDisplay();

    updateLectureTimeDisplay();

    startSiteTimer();

  let maintenanceInterval = null;

if (!maintenanceInterval) {

    maintenanceInterval = setInterval(() => {

        checkWebsiteMaintenance(auth.currentUser);

    }, 5000);

}

});




// ---------- GLOBAL THEME SYSTEM ----------

function applyTheme(theme){

  document.body.setAttribute("data-theme", theme);

  localStorage.setItem("theme", theme);

  const themeToggleEl =
  document.getElementById("themeToggle");

  if(themeToggleEl){

    themeToggleEl.textContent =
    theme === "dark"
    ? "☀️"
    : "🌙";

  }

}

document.addEventListener("DOMContentLoaded", ()=>{

  // LOAD SAVED THEME

  const savedTheme =
  localStorage.getItem("theme") || "dark";

  applyTheme(savedTheme);

  // TOGGLE

  const themeToggleEl =
  document.getElementById("themeToggle");

  if(themeToggleEl){

    themeToggleEl.addEventListener("click", ()=>{

      const currentTheme =
      document.body.getAttribute("data-theme");

      const newTheme =
      currentTheme === "dark"
      ? "light"
      : "dark";

      applyTheme(newTheme);

    });

  }

});

// ---------- Countdown ----------
function startCountdown(elementId, targetDate) {
  const el = document.getElementById(elementId);
  if (!el) return;

  function updateCountdown() {
    const now = new Date().getTime();
    const distance = new Date(targetDate).getTime() - now;

    if (distance <= 0) {
      el.innerHTML = "Started";
      return;
    }

    const days = Math.floor(distance / (1000 * 60 * 60 * 24));
    const hours = Math.floor((distance / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((distance / (1000 * 60)) % 60);
    const seconds = Math.floor((distance / 1000) % 60);

    el.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
  }

  updateCountdown();
  setInterval(updateCountdown, 6000);
}

startCountdown("boardsCountdown", "2027-02-01T09:00:00");
startCountdown("cuetCountdown", "2026-05-11T09:00:00");
startCountdown("caSepCountdown", "2026-09-02T09:00:00");
startCountdown("caMayCountdown", "2026-05-14T09:00:00");

window.openPremiumModal = function(){

  const modal = document.getElementById("premiumModal");

  if(modal){
    modal.style.display = "flex";
  }
}
window.addEventListener("beforeunload", () => {

    syncUserTime();

});

window.closePremiumModal = function(){

  const modal = document.getElementById("premiumModal");

  if(modal){
    modal.style.display = "none";
  }
}




document.addEventListener("DOMContentLoaded", () => {

    document.querySelectorAll(".auth-required").forEach(element => {

        element.addEventListener("click", function (e) {

            // Logged in
            if (window.isLoggedIn) {

                return;

            }

            // Guest

            e.preventDefault();

            showAuthPopup(`
                <strong>Login Required</strong><br>
                Please login or create an account to continue.
            `);

        });

    });

});