// ==========================================
// Feature Manager
// ==========================================

import System from "../core/system.js";

import {
    db,
    doc,
    deleteDoc,
    updateDoc,
    setDoc,
    serverTimestamp
} from "../config/firebase.js";

import {
    getCurrentUser
} from "../core/auth.js";


const modal =
document.getElementById("featureModal");

document
.getElementById("newFeatureBtn")
.addEventListener("click",()=>{

    modal.style.display="flex";

});

document
.getElementById("closeFeatureModal")
.addEventListener("click",()=>{

    modal.style.display="none";

});

const featureContainer =
document.getElementById("featureContainer");

function renderFeatures() {
   

    if (!featureContainer) return;

    const features = System.allFeatures();

   
    featureContainer.innerHTML = "";

Object.entries(features).forEach(([id, feature]) => {

    

    const card = document.createElement("div");

    card.className = "feature-card";

    card.style.border = "1px solid red";
    card.style.padding = "15px";
    card.style.marginBottom = "10px";

    card.innerHTML = `

<h3>${feature.name || id}</h3>

<div class="feature-row">

    <span>Enabled</span>

    <label class="switch">

        <input
            class="enabled"
            type="checkbox"
            ${feature.enabled ? "checked" : ""}>

        <span class="slider"></span>

    </label>

</div>

<br><br>
<div class="feature-row">

    <span>Premium Only</span>

    <label class="switch">

        <input
            class="premium"
            type="checkbox"
            ${feature.premiumOnly ? "checked" : ""}>

        <span class="slider"></span>

    </label>

</div>
<br><br>
<div class="feature-row">

    <span>Beta Only</span>

    <label class="switch">

        <input
            class="beta"
            type="checkbox"
            ${feature.betaOnly ? "checked" : ""}>

        <span class="slider"></span>

    </label>

</div>
<br><br>

<div class="feature-row">

    <span>

        Rollout

        <strong class="rolloutValue">

            ${feature.rollout ?? 100}%

        </strong>

    </span>

    <input
        class="rollout"
        type="range"
        min="0"
        max="100"
        value="${feature.rollout ?? 100}">

</div>

<br><br>

<button class="saveBtn">

💾 Save

</button>
<button class="deleteBtn">
    🗑 Delete
</button>

`;
const slider =
card.querySelector(".rollout");

const value =
card.querySelector(".rolloutValue");

slider.addEventListener("input", () => {

    value.textContent =
    slider.value + "%";

});
    featureContainer.appendChild(card);
    card.querySelector(".saveBtn")
.addEventListener("click", () => {

    saveFeature(id, card);

});
card.querySelector(".deleteBtn")
.addEventListener("click", () => {

    deleteFeature(id);

});

});

}async function saveFeature(id, card) {

    try {

        const user = getCurrentUser();

        await updateDoc(
            doc(db, "features", id),
            {

                enabled:
                    card.querySelector(".enabled").checked,

                premiumOnly:
                    card.querySelector(".premium").checked,

                betaOnly:
                    card.querySelector(".beta").checked,

                rollout:
                    Number(
                        card.querySelector(".rollout").value
                    ),

                updatedAt:
                    serverTimestamp(),

                updatedBy:
                    user?.uid || null

            }
        );

       const btn = card.querySelector(".saveBtn");

btn.textContent = "✅ Saved";

setTimeout(() => {

    btn.textContent = "💾 Save";

}, 1500);
    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }

}

document
.getElementById("createFeature")
.addEventListener("click", async () => {

    try {

        const id = document
            .getElementById("featureId")
            .value
            .trim();

        const name = document
            .getElementById("featureName")
            .value
            .trim();

        const description = document
            .getElementById("featureDescription")
            .value
            .trim();

        if (!id) {

            alert("Feature ID is required.");

            return;

        }

        await setDoc(

            doc(db, "features", id),

            {

                name,
                description,

                enabled: true,
                premiumOnly: false,
                betaOnly: false,
                rollout: 100,

                updatedBy:
                    getCurrentUser()?.uid || null,

                updatedAt:
                    serverTimestamp()

            }

        );

        // Clear form

        document.getElementById("featureId").value = "";
        document.getElementById("featureName").value = "";
        document.getElementById("featureDescription").value = "";

        // Close modal

        modal.style.display = "none";

    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }

});
async function deleteFeature(id) {

    const ok = confirm(

        `Delete "${id}" feature?`

    );

    if (!ok) return;

    try {

        await deleteDoc(

            doc(db, "features", id)

        );

        alert("✅ Feature Deleted");

    }

    catch (err) {

        console.error(err);

        alert(err.message);

    }

}

renderFeatures();

System.subscribe(renderFeatures);