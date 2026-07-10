// ==========================================
// Authentication Manager
// ==========================================

import {
    auth,
    onAuthStateChanged
} from "../config/firebase.js";

let currentUser = null;

const listeners = [];

// ==========================================
// Listen Auth State
// ==========================================

onAuthStateChanged(auth, (user) => {

    currentUser = user;

    listeners.forEach(listener => {

        listener(user);

    });

});

// ==========================================
// Subscribe
// ==========================================

export function onUserChanged(callback){

    listeners.push(callback);

    if(currentUser !== null){

        callback(currentUser);

    }

}

// ==========================================
// Current User
// ==========================================

export function getCurrentUser(){

    return currentUser;

}

// ==========================================
// Login Check
// ==========================================

export function isLoggedIn(){

    return currentUser !== null;

}