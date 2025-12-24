
Ki hada min code din nan gu daya yadda zasu yi aiki ba matsala 
1). // ==UserScript==
// @name         Socialearning Auto View Task ONLY (ULTRA FAST)
// @namespace    http://tampermonkey.net/
// @version      26.0
// @match        https://socialearning.org/*
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    const url = location.href;

    // ======================
    // PAGE: AVAILABLE TASKS
    // ======================
    if (url.includes("/earner/available/tasks")) {

        // 🔒 Force Instagram filter ONLY
        if (!url.includes("filter_social_media=2")) {
            location.replace(
                "https://socialearning.org/earner/available/tasks?filter_social_media=2"
            );
            return;
        }

        let clicked = false;

        const clickViewTask = () => {
            if (clicked) return true;

            const btn = [...document.querySelectorAll("a,button")]
                .find(e =>
                    e.textContent &&
                    e.textContent.trim().toLowerCase() === "view task"
                );

            if (btn) {
                clicked = true;
                btn.click();
                console.log("⚡ View Task clicked — script stopped here");
                return true;
            }
            return false;
        };

        // ⚡ Try instantly
        if (clickViewTask()) return;

        // ⚡ Watch DOM (React fast load)
        const obs = new MutationObserver(() => {
            if (clickViewTask()) obs.disconnect();
        });

        obs.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }

    // ======================
    // STOP EVERYTHING ELSE
    // ======================
    if (url.includes("/earner/update/tasks/view/")) {
        console.log("🛑 Task page opened — NO View Job, script idle");
        return;
    }

})();


2). // ==UserScript==
// @name         Socialearning Auto View Task + IG Follow (ULTRA FAST)
// @namespace    http://tampermonkey.net/
// @version      27.0
// @match        https://socialearning.org/*
// @match        https://www.instagram.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    'use strict';

    const url = location.href;

    // ======================
    // PAGE: AVAILABLE TASKS
    // ======================
    if (url.includes("/earner/available/tasks")) {

        // 🔒 Force Instagram filter ONLY
        if (!url.includes("filter_social_media=2")) {
            location.replace(
                "https://socialearning.org/earner/available/tasks?filter_social_media=2"
            );
            return;
        }

        let clicked = false;

        const clickViewTask = () => {
            if (clicked) return true;

            const btn = [...document.querySelectorAll("a,button")]
                .find(e =>
                    e.textContent &&
                    e.textContent.trim().toLowerCase() === "view task"
                );

            if (btn) {
                clicked = true;
                btn.click();
                console.log("⚡ View Task clicked INSTANT");
                return true;
            }
            return false;
        };

        // ⚡ FASTEST LOOP EVER
        const raf = () => {
            if (!clickViewTask()) requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
    }

    // ======================
    // PAGE: TASK VIEW (OPEN IG)
    // ======================
    if (url.includes("/earner/update/tasks/view/")) {

        const openIG = () => {
            const btn = [...document.querySelectorAll("a,button")]
                .find(b => b.textContent && b.textContent.includes("View Job"));

            if (btn && btn.href) {
                GM_setValue("igOpenedByScript", true);
                window.open(btn.href, "_blank");
                console.log("⚡ IG opened FAST");
                return true;
            }
            return false;
        };

        const raf = () => {
            if (!openIG()) requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
    }

    // ======================
    // INSTAGRAM AUTO FOLLOW
    // ======================
    if (location.hostname.includes("instagram.com")) {

        if (!GM_getValue("igOpenedByScript")) return;

        const fastFollow = () => {
            const buttons = [...document.querySelectorAll("button")];

            // Already following
            if (buttons.some(b => b.innerText === "Following")) {
                GM_setValue("igOpenedByScript", false);
                window.close();
                return true;
            }

            // Click follow instantly
            const follow = buttons.find(b => b.innerText === "Follow");
            if (follow) {
                follow.click();
                return false; // wait next frame to confirm
            }
            return false;
        };

        const raf = () => {
            if (!fastFollow()) requestAnimationFrame(raf);
        };
        requestAnimationFrame(raf);
    }

})();
