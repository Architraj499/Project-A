import {
    db,
    collection,
    addDoc,
    serverTimestamp
} from "../config/firebase.js";
import { getDeviceInfo }
from "./deviceInfo.js";
export async function saveLoginLog(user, userData = {}) {

    try {

        let ip = {};

try {

    const res =
    await fetch("https://ipwho.is/");

    if (!res.ok)
        throw new Error();

    ip =
    await res.json();

}

catch {

    const res =
    await fetch(
        "https://ipapi.co/json/"
    );

    ip =
    await res.json();

}
console.log("Saving login log...");
const device =
getDeviceInfo();
        await addDoc(

            collection(
                db,
                "users",
                user.uid,
                "loginLogs"
            ),

            {

                fullname:
                    userData.fullname || "",

                email:
                    user.email || "",

                ip:
                    ip.ip || "",

                city:
                    ip.city || "",

                region:
                    ip.region || "",

                country:
                    ip.country || "",

                isp:
                    ip.connection?.isp || "",

                browser:
device.browser,

device:
device.device,

                language:
                    navigator.language,

                loginMethod:
                    "password",

                sessionId:
                    crypto.randomUUID(),

                loginTime:
                    serverTimestamp()

            }

        );
console.log("Login log saved");
    }

    catch (err) {

        console.error("Login Log Error:", err);

    }

}