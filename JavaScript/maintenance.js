import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";

import {
    getFirestore,
    doc,
    getDoc
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDHRDRRm2KBmCuUf3qvTIRI5hO0aXFFx3w",
  authDomain: "asprients-95c1f.firebaseapp.com",
  projectId: "asprients-95c1f",
  storageBucket: "asprients-95c1f.appspot.com",
  messagingSenderId: "453218332819",
  appId: "1:453218332819:web:5740173fa4d8156dae9d66"
};

const app = getApps().length
    ? getApp()
    : initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

async function checkMaintenance(user){

    try{

        const settings =
        await getDoc(doc(db,"settings","website"));

        if(!settings.exists()) return;

        // Maintenance OFF
        if(!settings.data().maintenance){

            location.replace("/index.html");
            return;

        }

        // Admin bypass
        if(user){

            const userSnap =
            await getDoc(doc(db,"users",user.uid));

            if(
                userSnap.exists() &&
                userSnap.data().role === "admin"
            ){

                location.replace("../dashboard/home.html");

            }

        }

    }catch(err){

        console.error(err);

    }

}

onAuthStateChanged(auth,(user)=>{

    checkMaintenance(user);

    setInterval(()=>{

        checkMaintenance(auth.currentUser);

    },5000);

});