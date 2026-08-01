import { auth, onAuthStateChanged } from "./config/firebase.js";

window.isLoggedIn = false;

onAuthStateChanged(auth, (user) => {
    window.isLoggedIn = !!user;
});

document.addEventListener("click", (e) => {

    const target = e.target.closest(".auth-required");

    if (!target) return;

    if (window.isLoggedIn) return;

    e.preventDefault();

    showAuthPopup(`
        <strong>Login Required</strong><br>
        Please login or create an account to continue.
    `);

});