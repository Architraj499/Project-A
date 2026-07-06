import {
    auth,
    db,
    doc,
    setDoc,
    onAuthStateChanged
} from "./universal.js";
import { ROUTES } from "./routes.js";



const params =
new URLSearchParams(window.location.search);

const encoded =
params.get("data");

if(!encoded)
{
    window.location.href = ROUTES.DASHBOARD;
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
        window.location.href = ROUTES.HOME;
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

        

        window.location.href =ROUTES.PROFILE;

    } catch (err) {

        console.error(err);
        alert("Failed to save score.");

    }

});