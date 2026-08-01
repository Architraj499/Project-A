import { ROUTES } from "./config/routes.js";
import { APP } from "./config/version.js";

import {
    auth,
    db,
    onAuthStateChanged,
    doc,
    getDoc,
    updateDoc,
    serverTimestamp
} from "./config/firebase.js";

// ===============================
// DOM
// ===============================

const termsCheck = document.getElementById("termsCheck");
const privacyCheck = document.getElementById("privacyCheck");
const ageCheck = document.getElementById("ageCheck");

const continueBtn = document.getElementById("continueBtn");

const versionText =
document.getElementById("termsVersion");

// ===============================
// Version
// ===============================

versionText.textContent =
APP.TERMS_VERSION;

// ===============================
// Countdown
// ===============================

let countdown = 5;

let timerFinished = false;

continueBtn.innerText =
`Continue (${countdown})`;

const timer = setInterval(() => {

    countdown--;

    if (countdown > 0) {

        continueBtn.innerText =
        `Continue (${countdown})`;

    } else {

        clearInterval(timer);

        timerFinished = true;

        continueBtn.innerText =
        "Continue →";

        updateButton();

    }

},1000);

// ===============================
// Enable Button
// ===============================

function updateButton(){

    continueBtn.disabled = !(

        timerFinished &&

        termsCheck.checked &&

        privacyCheck.checked &&

        ageCheck.checked

    );

}

termsCheck.addEventListener("change",updateButton);

privacyCheck.addEventListener("change",updateButton);

ageCheck.addEventListener("change",updateButton);

// ===============================
// Auth Check
// ===============================

let currentUser = null;

onAuthStateChanged(auth,async(user)=>{

    if(!user){

        location.replace(ROUTES.HOME);

        return;

    }

    currentUser = user;

    try{

        const snap =
        await getDoc(doc(db,"users",user.uid));

        if(!snap.exists()) return;

        const data = snap.data();

        // Already Accepted

        if(

            data.termsAccepted &&

            data.termsVersion === APP.TERMS_VERSION

        ){

            location.replace(ROUTES.DASHBOARD);

        }

    }

    catch(err){

        console.error(err);

    }

});

// ===============================
// Continue
// ===============================

continueBtn.addEventListener("click",async()=>{

    if(!currentUser) return;

    continueBtn.disabled = true;

    continueBtn.innerHTML =
    "Saving...";

    try{

        await updateDoc(

            doc(db,"users",currentUser.uid),

            {

                termsAccepted:true,

                termsAcceptedAt:
                serverTimestamp(),

                termsVersion:
                APP.TERMS_VERSION

            }

        );

        continueBtn.innerHTML =
        "Hii 🎉";

        setTimeout(()=>{

            location.replace(
                ROUTES.DASHBOARD
            );

        },900);

    }

    catch(err){

        console.error(err);

        continueBtn.disabled = false;

        continueBtn.innerHTML =
        "Try Again";

    }

});

/* =====================================
        POLICY MODAL
===================================== */

const modal =
document.getElementById("policyModal");

const modalTitle =
document.getElementById("modalTitle");

const modalContent =
document.getElementById("modalContent");

const openTerms =
document.getElementById("openTerms");

const openPrivacy =
document.getElementById("openPrivacy");

const closeModal =
document.getElementById("closeModal");

let currentPolicy = "";


/* ===========================
   LOAD POLICY
=========================== */

async function loadPolicy(file,title,policy){

    currentPolicy = policy;


    modalTitle.innerHTML = title;

    modalContent.innerHTML = `
        <div class="loading">
            Loading...
        </div>
    `;

    modal.classList.add("show");
    document.body.style.overflow = "hidden";

    try {

        const response = await fetch(file);
        const html = await response.text();

modalContent.style.opacity = "0";

setTimeout(()=>{

    modalContent.innerHTML = html;

    modalContent.style.opacity = "1";

},200);

    } catch (err) {

        console.error(err);

        modalContent.innerHTML = `
            <h2>Unable to load document.</h2>
        `;

    }

}

// OPEN TERMS

openTerms.addEventListener("click",()=>{

loadPolicy(

"../legal/content/terms-content.html",

"📜 Terms of Use",

"terms"

);

});



// OPEN PRIVACY

openPrivacy.addEventListener("click",()=>{

   loadPolicy(

"../legal/content/policy-content.html",

"🔒 Privacy Policy",

"privacy"

);
});


// CLOSE

closeModal.addEventListener("click",()=>{

    modal.classList.remove("show");

    document.body.style.overflow="auto";

});




// CLICK OUTSIDE

modal.addEventListener("click",(e)=>{

    if(e.target===modal){

        modal.classList.remove("show");

        document.body.style.overflow="auto";

    }

});




// ESC KEY

document.addEventListener("keydown",(e)=>{

    if(e.key==="Escape"){

        modal.classList.remove("show");

        document.body.style.overflow="auto";

    }

});

modalContent.addEventListener("scroll",()=>{

const reachedBottom =

modalContent.scrollTop+

modalContent.clientHeight>=

modalContent.scrollHeight-10;

if(!reachedBottom) return;



if(currentPolicy==="terms"){

    termsCheck.checked = true;

}

if(currentPolicy==="privacy"){

    privacyCheck.checked = true;

}

updateButton();

// Small Success Delay

setTimeout(()=>{

    modal.classList.remove("show");

    document.body.style.overflow = "auto";

},700);

});