export function getDeviceInfo() {

    const ua = navigator.userAgent;

    let browser = "Unknown";

    let device = "Unknown";

    // ---------- Browser ----------

    if (ua.includes("Edg/")) {

        browser =
        "Edge " +
        ua.match(/Edg\/([\d.]+)/)[1];

    }

    else if (ua.includes("Chrome/")) {

        browser =
        "Chrome " +
        ua.match(/Chrome\/([\d.]+)/)[1];

    }

    else if (ua.includes("Firefox/")) {

        browser =
        "Firefox " +
        ua.match(/Firefox\/([\d.]+)/)[1];

    }

    else if (
        ua.includes("Safari/")
        &&
        !ua.includes("Chrome")
    ) {

        browser =
        "Safari";

    }

    // ---------- Device ----------

    if (ua.includes("Windows")) {

        device =
        "🖥 Windows";

    }

    else if (ua.includes("Android")) {

        device =
        "📱 Android";

    }

    else if (
        ua.includes("iPhone")
    ) {

        device =
        "📱 iPhone";

    }

    else if (
        ua.includes("iPad")
    ) {

        device =
        "📱 iPad";

    }

    else if (
        ua.includes("Mac OS")
    ) {

        device =
        "🍎 macOS";

    }

    else if (
        ua.includes("Linux")
    ) {

        device =
        "🐧 Linux";

    }

    return {

        browser,

        device

    };

}