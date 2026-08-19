// ======================================
// Asprients Updates Page
// updates.js
// ======================================

import { APP } from "./config/version.js";

document.addEventListener("DOMContentLoaded", () => {

    initVersion();
    initRevealAnimation();
    initCounters();
    initBackToTop();
    initNavbarHighlight();
    initBlobAnimation();
    staggerCards();
    consoleSignature();

});

// ======================================
// Version Information
// ======================================

function initVersion(){

const map={

version:`v${APP.VERSION}`,

currentVersion:`v${APP.VERSION}`,

size:APP.SIZE,

type:APP.RELEASE,

upcomingVersion:`v${APP.UPCOMING}`,

security:APP.SECURITY,

releaseVersion:`Version  v${APP.VERSION}`,

releasesVersion:`Version  v${APP.VERSION}`,

tmVersion:`Version  v${APP.VERSION}`,

releaseDate:APP.UPDATE,

rdate:APP.UPDATE,

rddDate:APP.UPDATE,

releaseDateLong:APP.UPDATE,

featureCount:`${APP.FEATURES}+`,

featuresCount:`${APP.FEATURES}+`,

improvementCount:`${APP.IMPROVEMENTS}`,

bugCount:`${APP.BUGS}`,

releaseCount:APP.RELEASES,

releaseType:APP.RELEASE

};

Object.entries(map).forEach(([id,value])=>{

const el=document.getElementById(id);

if(el) el.textContent=value;

});

}

// ======================================
// Reveal Animation
// ======================================

function initRevealAnimation() {

    const revealElements = document.querySelectorAll(
        ".stat-card,.release-card,.update-card,.security-card,.list-item,.timeline-item,.roadmap-card,.feature-box"
    );

    const observer = new IntersectionObserver((entries) => {

        entries.forEach(entry => {

            if (entry.isIntersecting) {
                entry.target.classList.add("show");
            }

        });

    }, {
        threshold: 0.15
    });

    revealElements.forEach(el => {

        el.classList.add("hidden");

        observer.observe(el);

    });

}

// ======================================
// Counter Animation
// ======================================

function initCounters() {

    const counters = document.querySelectorAll(".stat-card h2");

    counters.forEach(counter => {

        const originalText = counter.textContent.trim();

        // Animate only numbers like 25 or 25+
        if (!/^\d+\+?$/.test(originalText))
            return;

        const target = parseInt(originalText);

        let current = 0;

        const increment = Math.max(1, Math.ceil(target / 50));

        counter.textContent = "0";

        function updateCounter() {

            current += increment;

            if (current < target) {

                counter.textContent = current;

                requestAnimationFrame(updateCounter);

            } else {

                counter.textContent = originalText;

            }

        }

        updateCounter();

    });

}

// ======================================
// Back To Top
// ======================================

function initBackToTop() {

    const topBtn = document.getElementById("backToTop");

    if (!topBtn) return;

    window.addEventListener("scroll", () => {

        if (window.scrollY > 400) {

            topBtn.style.opacity = "1";
            topBtn.style.pointerEvents = "auto";

        } else {

            topBtn.style.opacity = "0";
            topBtn.style.pointerEvents = "none";

        }

    });

    topBtn.addEventListener("click", () => {

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });

    });

}

// ======================================
// Navbar Active Link
// ======================================

function initNavbarHighlight() {

    const sections = document.querySelectorAll("section");

    const navLinks = document.querySelectorAll("nav a");

    if (!sections.length || !navLinks.length) return;

    window.addEventListener("scroll", () => {

        let current = "";

        sections.forEach(section => {

            const top = section.offsetTop - 150;

            if (window.scrollY >= top) {

                current = section.id;

            }

        });

        navLinks.forEach(link => {

            link.classList.remove("active-scroll");

            const href = link.getAttribute("href");

            if (href === "#" + current) {

                link.classList.add("active-scroll");

            }

        });

    });

}

// ======================================
// Floating Background Animation
// ======================================

function initBlobAnimation() {

    document.querySelectorAll(".blob").forEach(blob => {

        let angle = Math.random() * 360;

        function rotate() {

            angle += 0.15;

            blob.style.transform = `rotate(${angle}deg)`;

            requestAnimationFrame(rotate);

        }

        rotate();

    });

}

// ======================================
// Card Animation Delay
// ======================================

function staggerCards() {

    document.querySelectorAll(".update-card").forEach((card, index) => {

        card.style.transitionDelay = `${index * 80}ms`;

    });

}

