// ==UserScript==
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
