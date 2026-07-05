import {
    auth,
    db,
    doc,
    setDoc,
    onAuthStateChanged
} from "./universal.js";




const params =
new URLSearchParams(window.location.search);

const encoded =
params.get("data");

if(!encoded)
{
    window.location.href = "../dashboard/home.html";
}

const payload =
JSON.parse(
    atob(
        decodeURIComponent(encoded)
    )
);



onAuthStateChanged(auth, async (user) => {

    if (!user) {
        alert("Please login first.");
        window.location.href = "/index.html";
        return;
    }

    try {

        await setDoc(
            doc(db, "users", user.uid),
            {
                cuetResult: {
                    totalScore: payload.totalScore,
                    subjects: payload.subjects,
                    importedAt: new Date()
                }
            },
            { merge: true }
        );

        

        window.location.href = "../dashboard/Profile.html";

    } catch (err) {

        console.error(err);
        alert("Failed to save score.");

    }

});