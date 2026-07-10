// ==========================================
// User Manager + Cache
// ==========================================
console.log("✅ user.js loaded");
import {
    db,
    doc,
    getDoc
} from "../config/firebase.js";

import {
    onUserChanged
} from "./auth.js";

let currentUser = null;
let currentUserData = null;

const listeners = [];

// ==========================================
// Notify
// ==========================================

function notify(){

    listeners.forEach(fn=>{

        fn(currentUser,currentUserData);

    });

}

// ==========================================
// Load User
// ==========================================

onUserChanged(async(user)=>{

    currentUser = user;

    if(!user){

        currentUserData = null;

        sessionStorage.removeItem(
            "userData"
        );

        notify();

        return;

    }

    // ----------------------------
    // CACHE
    // ----------------------------

    const cached =
    sessionStorage.getItem(
        "userData"
    );

    if(cached){

        currentUserData =
        JSON.parse(cached);

        notify();

        return;

    }

    try{

        const snap =
        await getDoc(
            doc(db,"users",user.uid)
        );

        if(snap.exists()){

            currentUserData =
            snap.data();

            sessionStorage.setItem(

                "userData",

                JSON.stringify(
                    currentUserData
                )

            );

        }

    }

    catch(err){

        console.error(err);

    }

    notify();

});

// ==========================================
// Subscribe
// ==========================================

export function onUserLoaded(callback){

    listeners.push(callback);

    if(currentUserData){

        callback(

            currentUser,

            currentUserData

        );

    }

}

// ==========================================
// Getters
// ==========================================

export function getUser(){

    return currentUser;

}

export function getUserData(){

    return currentUserData;

}

// ==========================================
// Refresh Cache
// ==========================================

export async function refreshUserData(){

    if(!currentUser) return;

    const snap =
    await getDoc(
        doc(db,"users",currentUser.uid)
    );

    if(snap.exists()){

        currentUserData =
        snap.data();

        sessionStorage.setItem(

            "userData",

            JSON.stringify(
                currentUserData
            )

        );

        notify();

    }

}