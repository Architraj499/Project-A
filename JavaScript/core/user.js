// ==========================================
// User Manager + Cache + Live Firebase Sync
// ==========================================

import {
    db,
    doc,
    getDoc,
    onSnapshot
} from "../config/firebase.js";

import { saveLoginLog } from "./loginLogs.js";

import {
    onUserChanged
} from "./auth.js";


let currentUser = null;

let currentUserData = null;

let userDataUnsubscribe = null;

const listeners = [];


// ==========================================
// Notify
// ==========================================

function notify() {

    listeners.forEach(fn => {

        try {

            fn(
                currentUser,
                currentUserData
            );

        }
        catch (err) {

            console.error(
                "User listener error:",
                err
            );

        }

    });

}


// ==========================================
// Stop Firebase Listener
// ==========================================

function stopUserListener() {

    if (userDataUnsubscribe) {

        userDataUnsubscribe();

        userDataUnsubscribe = null;

       

    }

}


// ==========================================
// Start Firebase Listener
// ==========================================

function startUserListener(user) {

    stopUserListener();


    const userRef =
        doc(
            db,
            "users",
            user.uid
        );


    userDataUnsubscribe =
        onSnapshot(

            userRef,

            (snap) => {

                if (!snap.exists()) {

                    console.warn(
                        "User document does not exist:",
                        user.uid
                    );

                    currentUserData = {};

                }

                else {

                    currentUserData =
                        snap.data();


                    // ======================================
                    // UPDATE CACHE
                    // ======================================

                    sessionStorage.setItem(
                        "userData",
                        JSON.stringify(
                            currentUserData
                        )
                    );


                    

                }


                // ==========================================
                // UPDATE ALL FRONTEND LISTENERS
                // ==========================================

                notify();

            },

            (error) => {

                console.error(
                    "❌ Firebase user listener failed:",
                    error
                );


                // ==========================================
                // FALLBACK TO CACHE
                // ==========================================

                const cached =
                    sessionStorage.getItem(
                        "userData"
                    );


                if (cached) {

                    try {

                        currentUserData =
                            JSON.parse(
                                cached
                            );


                        console.warn(
                            "⚠️ Using cached user data"
                        );


                        notify();

                    }

                    catch (cacheError) {

                        console.error(
                            "Cache parsing failed:",
                            cacheError
                        );

                    }

                }

            }

        );


}


// ==========================================
// Load User
// ==========================================

onUserChanged(async (user) => {

    currentUser = user;


    // ==========================================
    // LOGOUT
    // ==========================================

    if (!user) {

        stopUserListener();


        currentUserData = null;


        sessionStorage.removeItem(
            "userData"
        );


        sessionStorage.removeItem(
            "loginLogged"
        );


        notify();

        return;

    }


    // ==========================================
    // LOGIN LOG
    // ==========================================

    if (
        !sessionStorage.getItem(
            "loginLogged"
        )
    ) {

        try {

            const snap =
                await getDoc(
                    doc(
                        db,
                        "users",
                        user.uid
                    )
                );


            const data =
                snap.exists()
                    ? snap.data()
                    : {};


            await saveLoginLog(
                user,
                data
            );


            sessionStorage.setItem(
                "loginLogged",
                "true"
            );

        }

        catch (err) {

            console.error(
                "Login log failed:",
                err
            );

        }

    }


    // ==========================================
    // INITIAL FIREBASE LOAD
    // ==========================================

    try {

        const snap =
            await getDoc(
                doc(
                    db,
                    "users",
                    user.uid
                )
            );


        if (snap.exists()) {

            currentUserData =
                snap.data();


            sessionStorage.setItem(
                "userData",
                JSON.stringify(
                    currentUserData
                )
            );


            

        }

        else {

            currentUserData = {};

        }

    }

    catch (err) {

        console.error(
            "Initial Firebase user fetch failed:",
            err
        );


        // ==========================================
        // FALLBACK CACHE
        // ==========================================

        const cached =
            sessionStorage.getItem(
                "userData"
            );


        if (cached) {

            try {

                currentUserData =
                    JSON.parse(
                        cached
                    );

                console.warn(
                    "⚠️ Using cached user data"
                );

            }

            catch (cacheError) {

                console.error(
                    "Cache parsing failed:",
                    cacheError
                );

                currentUserData = {};

            }

        }

        else {

            currentUserData = {};

        }

    }


    // ==========================================
    // INITIAL FRONTEND UPDATE
    // ==========================================

    notify();


    // ==========================================
    // START LIVE FIREBASE SYNC
    // ==========================================

    startUserListener(user);

});


// ==========================================
// Subscribe
// ==========================================

export function onUserLoaded(callback) {

    listeners.push(
        callback
    );


    if (
        currentUserData
    ) {

        callback(
            currentUser,
            currentUserData
        );

    }

}


// ==========================================
// Getters
// ==========================================

export function getUser() {

    return currentUser;

}


export function getUserData() {

    return currentUserData;

}


// ==========================================
// Manual Refresh
// ==========================================

export async function refreshUserData() {

    if (!currentUser) {

        return;

    }


    try {

        const snap =
            await getDoc(
                doc(
                    db,
                    "users",
                    currentUser.uid
                )
            );


        if (snap.exists()) {

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

    catch (err) {

        console.error(
            "User data refresh failed:",
            err
        );

    }

}