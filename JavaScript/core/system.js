// ==========================================
// System Manager
// ==========================================

import {
    db,
    doc,
    getDoc,
    collection,
    getDocs,
    onSnapshot
} from "../config/firebase.js";

class System {

    constructor() {

        this.settings = {};
        this.features = {};
        this.loaded = false;

        this.listeners = [];
        this.events = {};

        this.settingsUnsubscribe = null;
        this.featuresUnsubscribe = null;

    }

    // ==========================================
    // Initialize System
    // ==========================================

    async init() {

        if (this.loaded) return;

        this.loaded = true;

        // --------------------------
        // Load Settings
        // --------------------------

        const appDoc = await getDoc(
            doc(db, "settings", "app")
        );

        if (appDoc.exists()) {

            this.settings = appDoc.data();

        }

        // --------------------------
        // Load Features
        // --------------------------

        const featureDocs = await getDocs(
            collection(db, "features")
        );

        featureDocs.forEach(docSnap => {

            this.features[docSnap.id] = docSnap.data();

        });

        // --------------------------
        // Watch Settings
        // --------------------------

        this.settingsUnsubscribe = onSnapshot(
            doc(db, "settings", "app"),
            (snapshot) => {

                if (!snapshot.exists()) return;

                this.settings = snapshot.data();

                this.notify();
                this.emit("settings", this.settings);

            }
        );

        // --------------------------
        // Watch Features
        // --------------------------

        this.featuresUnsubscribe = onSnapshot(
            collection(db, "features"),
            (snapshot) => {

                snapshot.docChanges().forEach(change => {

                    if (change.type === "removed") {

                        delete this.features[change.doc.id];

                    } else {

                        this.features[change.doc.id] = change.doc.data();

                    }

                });

                this.notify();
                this.emit("features", this.features);

            }
        );

       

    }

    // ==========================================
    // Settings
    // ==========================================

    getSetting(key) {

        return this.settings[key];

    }

    hasSetting(key) {

        return key in this.settings;

    }

    allSettings() {

        return this.settings;

    }
// ==========================================
// Maintenance
// ==========================================

isMaintenance() {

    return this.settings.maintenance === true;

}
// ==========================================
// User Helpers
// ==========================================

isPremium(user) {

    return user?.premium === true;

}

isBeta(user) {

    return user?.beta === true;

}

isAdmin(user) {

    return user?.role === "admin";

}
    // ==========================================
    // Features
    // ==========================================

    feature(name) {

        return this.features[name] || null;

    }

    isFeatureEnabled(name) {

        const feature = this.feature(name);

        if (!feature) return false;

        return feature.enabled === true;

    }

    canUse(name, user = null) {

        const feature = this.feature(name);

        if (!feature) return false;

        if (!feature.enabled)
            return false;

       if (feature.premiumOnly && !this.isPremium(user))
            return false;

       if (feature.betaOnly && !this.isBeta(user))
            return false;


    }

    allFeatures() {

        return this.features;

    }
// ==========================================
// Rollout
// ==========================================

getRolloutBucket(uid = "") {

    let hash = 0;

    for (let i = 0; i < uid.length; i++) {

        hash = ((hash << 5) - hash) + uid.charCodeAt(i);

        hash |= 0;

    }

    return Math.abs(hash) % 100;

}

    // ==========================================
    // Events
    // ==========================================

    subscribe(callback) {

        this.listeners.push(callback);

    }

    unsubscribe(callback) {

        this.listeners = this.listeners.filter(
            listener => listener !== callback
        );

    }

    // ==========================================
// Event Bus
// ==========================================

on(event, callback) {

    if (!this.events[event]) {

        this.events[event] = [];

    }

    this.events[event].push(callback);

}

off(event, callback) {

    if (!this.events[event]) return;

    this.events[event] = this.events[event]
        .filter(cb => cb !== callback);

}

emit(event, data = null) {

    if (!this.events[event]) return;

    this.events[event].forEach(callback => {

        callback(data);

    });

}

    notify() {

        this.listeners.forEach(callback => {

            callback(this);

        });

    }
// ==========================================
// System State
// ==========================================

isReady() {

    return this.loaded;

}
    // ==========================================
    // Destroy
    // ==========================================

    destroy() {

        if (this.settingsUnsubscribe) {

            this.settingsUnsubscribe();

            this.settingsUnsubscribe = null;

        }

        if (this.featuresUnsubscribe) {

            this.featuresUnsubscribe();

            this.featuresUnsubscribe = null;

        }

        this.loaded = false;
        

    }
async reload() {

    this.destroy();

    await this.init();

}
}

export default new System();