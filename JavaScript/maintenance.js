import { ROUTES } from "./routes.js";import { APP } from "./version.js";

document.getElementById("version").textContent =
`${APP.NAME} v${APP.VERSION} (${APP.RELEASE})`; 

import {
    auth,
    db,
    onAuthStateChanged,
    doc,
    getDoc
} from "./config/firebase.js";


async function checkMaintenance(user){

    try{

        const settings =
        await getDoc(doc(db,"settings","website"));

        if(!settings.exists()) return;

        // Maintenance OFF
        if (!settings.data().maintenance) {

    if (location.pathname !== ROUTES.HOME) {
        location.replace(ROUTES.HOME);
    }

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

                location.replace(ROUTES.DASHBOARD);

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