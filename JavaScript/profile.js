// profile.js

import { initializeApp }
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";

import {

  getAuth,
  onAuthStateChanged,
  signOut

}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {

  getFirestore,
  doc,
  getDoc

}
from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";


// FIREBASE CONFIG

const firebaseConfig = {

  apiKey: "AIzaSyDHRDRRm2KBmCuUf3qvTIRI5hO0aXFFx3w",

  authDomain: "asprients-95c1f.firebaseapp.com",

  projectId: "asprients-95c1f",

  storageBucket: "asprients-95c1f.appspot.com",

  messagingSenderId: "453218332819",

  appId: "1:453218332819:web:5740173fa4d8156dae9d66"

};


// INITIALIZE

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


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

// AUTH

onAuthStateChanged(auth, async(user)=>{

  if(!user){

    window.location.href = "index.html";

    return;

  }

  // BASIC INFO

  if(emailDisplay)
  emailDisplay.textContent = user.email;

  if(emailText)
  emailText.textContent = user.email;

  if(uidText)
  uidText.textContent = user.uid;


  try{

    const userRef =
    doc(db,"users",user.uid);

    const snap =
    await getDoc(userRef);

    if(snap.exists()){

      
  const data = snap.data();



  // PREMIUM BADGE

  const premiumBadge =
  document.getElementById("premiumBadge");

  if(premiumBadge){

    if(data.plan === "premium"){

      premiumBadge.innerHTML =
      "👑 Premium User";

    }else{

      premiumBadge.innerHTML =
      "🆓 Free User";

    }

  }

  // NAME

  const fullname =
  data.fullname || "User";

  if(usernameDisplay){

    usernameDisplay.textContent =
    fullname;

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

    }

  }catch(err){

    

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

      window.location.href = "index.html";

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