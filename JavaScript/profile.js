// profile.js
import { ROUTES } from "./config/routes.js";
import { APP } from "./config/version.js";
import { onUserLoaded } from "./core/user.js";
const versionEl =
document.getElementById("version");

if(versionEl){

    versionEl.textContent =
    `${APP.NAME} v${APP.VERSION} (${APP.RELEASE})`;

}

import {
    auth,
    signOut
} from "./config/firebase.js";
// ELEMENTS

const usernameDisplay =
document.getElementById("usernameDisplay");

const emailDisplay =
document.getElementById("emailDisplay");

const emailText =
document.getElementById("emailText");

const uidText =
document.getElementById("uidText");

const avatar =
document.getElementById("avatar");

const logoutBtn =
document.getElementById("logoutBtn");

const themeSwitch =
document.getElementById("themeSwitch");

const upgradeBtn =
document.getElementById("upgradeBtn");

// STATS ELEMENTS

const boardsEl =
document.getElementById("boardsProgress");

const cuetEl =
document.getElementById("cuetProgress");

const caEl =
document.getElementById("caProgress");

const studyEl =
document.getElementById("studyHours");

const streakEl =
document.getElementById("streakCount");

const premiumBadge =
document.getElementById("premiumBadge");

// AUTH

onUserLoaded((user, data) => {

  if(!user){

    window.location.href = ROUTES.HOME;

    return;

  }

  // BASIC INFO

  if(emailDisplay)
  emailDisplay.textContent = user.email;

  if(emailText)
  emailText.textContent = user.email;

  if(uidText)
  uidText.textContent = user.uid;

const adminBtn =
document.getElementById("adminBtn");


if (adminBtn) {

 

  if (data.role === "admin") {

   

    adminBtn.style.display = "flex";

  }

}



  const isPremium =
data.plan === "premium";

if(upgradeBtn && !isPremium){

  upgradeBtn.style.display =
  "inline-flex";

}

//  Premium Badge
 const premiumPlans = [
  "1 Month",
  "6 Months",
  "12 Months"
];

if (premiumBadge) {

    if (premiumPlans.includes(data.plan)) {

        premiumBadge.innerHTML =
        `👑 ${data.plan.toUpperCase()} PLAN`;

    } else {

        premiumBadge.innerHTML =
        "🆓 Free User";

    }

}

  // NAME


const fullname = data.fullname || "User";



if(usernameDisplay){

    usernameDisplay.textContent = fullname;

}

if(avatar){

    avatar.textContent =
    fullname.charAt(0).toUpperCase();

    

}
  // STREAK

  const streak =
  data.streakCount || 0;

  if(streakEl){

    streakEl.innerText = streak;

  }


// SUBJECT PROGRESS

// ---------- COURSE PROGRESS ----------

const progress =
data.subjectProgress || {};



// SUBJECT LIST

function getSubjectsByCourse(course){

  if(course === "Boards"){

    return [
      "Accountancy",
      "Business Studies",
      "Economics",
      "English",
      "Hindi",
      "Entrepreneurship"
    ];

  }

  if(course === "CUET"){

    return [
      "Accountancy",
      "Business Studies",
      "Economics",
      "English",
      "General Aptitude Test"
    ];

  }

  if(course === "CA Foundation"){

    return [
      "Accounting",
      "Business Economics",
      "Quantative Aptitude",
      "Business Law"
    ];

  }

  return [];

}


// CALCULATE COURSE %

function getCourseProgress(course){

  const subjects =
  getSubjectsByCourse(course);

  if(!subjects.length) return 0;

  let total = 0;

  let count = 0;

  subjects.forEach(subject=>{

    const value =
    Number(
      progress?.[course]?.[subject]
    );

    if(!isNaN(value)){

      total += value;

      count++;

    }

  });

  if(count === 0) return 0;

  return Math.round(total / count);

}


// FINAL VALUES

const boardsAvg =
getCourseProgress("Boards");

const cuetAvg =
getCourseProgress("CUET");

const caAvg =
getCourseProgress("CA Foundation");




// UPDATE UI

if(boardsEl){

  boardsEl.innerText =
  boardsAvg + "%";

}

if(cuetEl){

  cuetEl.innerText =
  cuetAvg + "%";

}

if(caEl){

  caEl.innerText =
  caAvg + "%";

}

      // STUDY HOURS

      const lectureSeconds =
      data.totalLectureSeconds || 0;

      const hours =
      Math.floor(lectureSeconds / 3600);

      if(studyEl){

        studyEl.innerText =
        hours + "h";

      }

  
});


// LOGOUT

if(logoutBtn){

  logoutBtn.addEventListener("click", async()=>{

    const confirmLogout =
    confirm("Are you sure you want to logout?");

    if(!confirmLogout) return;

    try{

      await signOut(auth);
      sessionStorage.removeItem("loginLogged");
sessionStorage.removeItem("userData");


      window.location.href = ROUTES.HOME;

    }catch(err){

    

      alert("Logout Failed");

    }

  });

}


// THEME SYSTEM

function applyTheme(theme){

  document.body.setAttribute(
    "data-theme",
    theme
  );

  localStorage.setItem(
    "theme",
    theme
  );

  if(themeSwitch){

    themeSwitch.checked =
    theme === "dark";

  }

}


// LOAD SAVED THEME

const savedTheme =
localStorage.getItem("theme") || "dark";

applyTheme(savedTheme);


// TOGGLE THEME

if(themeSwitch){

  themeSwitch.addEventListener("change", ()=>{

    if(themeSwitch.checked){

      applyTheme("dark");

    }else{

      applyTheme("light");

    }

  });

}

window.openPremiumModal = function(){

  const modal = document.getElementById("premiumModal");

  if(modal){
    modal.style.display = "flex";
  }
}

window.closePremiumModal = function(){

  const modal = document.getElementById("premiumModal");

  if(modal){
    modal.style.display = "none";
  }
}
