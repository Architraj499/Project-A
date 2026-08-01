// ======================================
// Authentication Popup
// ======================================

const modal = document.createElement("div");

modal.className = "auth-modal";

modal.innerHTML = `
<div class="auth-box">

    <div class="auth-logo">
        🎓
    </div>

    <h2>Sign in Required</h2>

    <p id="popupMessage">
        Login to continue.
    </p>

    <div class="auth-buttons">
        <button class="loginBtn">Login</button>
        <button class="signupBtn">Sign Up</button>
    </div>

    <button class="closeBtn">
        Maybe Later
    </button>

</div>
`;

document.body.appendChild(modal);

// ================================
// Show Popup
// ================================

window.showAuthPopup = function (message) {

    // Already logged in?
    if (window.isLoggedIn) return;

    document.getElementById("popupMessage").innerHTML = message;

    modal.classList.add("show");

};

// ================================
// Close Popup
// ================================

window.closeAuthPopup = function () {

    modal.classList.remove("show");

};

modal.querySelector(".closeBtn").onclick = closeAuthPopup;

// Close on outside click

modal.addEventListener("click", (e) => {

    if (e.target === modal) {

        closeAuthPopup();

    }

});

// Close on ESC

document.addEventListener("keydown", (e) => {

    if (e.key === "Escape") {

        closeAuthPopup();

    }

});

// ================================
// Login Button
// ================================

modal.querySelector(".loginBtn").addEventListener("click", () => {

    window.location.href = "../index.html";

});

// ================================
// Signup Button
// ================================

modal.querySelector(".signupBtn").addEventListener("click", () => {

    window.location.href = "../index.html?signup=true";

});