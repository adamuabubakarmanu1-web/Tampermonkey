// ==UserScript==
// @name         Socialearning - Strict Match & Fast Auto-Submit
// @namespace    http://tampermonkey.net/
// @version      17.0
// @description  Exact username selection, auto-submit, and fast Instagram follow.
// @match        https://socialearning.org/*
// @match        https://www.instagram.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    // 1. SETTINGS ICON (Right-side Middle)
    GM_addStyle(`
        #userUpdateBtn {
            position: fixed; top: 50%; right: 10px; transform: translateY(-50%);
            z-index: 10000; background: #007bff; color: white; border: 2px solid white;
            border-radius: 50%; width: 45px; height: 45px; cursor: pointer;
            font-size: 22px; display: flex; align-items: center; justify-content: center;
        }
    `);

    const updateBtn = document.createElement('button');
    updateBtn.id = 'userUpdateBtn';
    updateBtn.innerHTML = '⚙️';
    document.body.appendChild(updateBtn);
    updateBtn.onclick = () => {
        let newUser = prompt("Saka EXACT Instagram Username dinka:", GM_getValue("stored_ig_user", ""));
        if (newUser) {
            GM_setValue("stored_ig_user", newUser.trim());
            alert("An ajiye: " + newUser);
            location.reload();
        }
    };

    const url = location.href;

    // 2. PAGE: AVAILABLE TASKS (Instagram Filter Only)
    if (url.includes("/earner/available/tasks")) {
        if (!url.includes("filter_social_media=2")) {
            location.replace("https://socialearning.org/earner/available/tasks?filter_social_media=2");
            return;
        }
        const autoView = setInterval(() => {
            const viewTask = [...document.querySelectorAll("a,button")].find(e => e.textContent.trim().toLowerCase() === "view task");
            if (viewTask) {
                clearInterval(autoView);
                GM_setValue("is_following_now", "pending");
                viewTask.click();
            }
        }, 300);
    }

    // 3. PAGE: TASK VIEW (Fixed Selection & Auto-Submit)
    if (url.includes("/earner/update/tasks/view/")) {
        const checkAction = setInterval(() => {
            const selectBox = document.querySelector("select[name='username']") || document.querySelector("select");
            const viewJobBtn = [...document.querySelectorAll("a")].find(b => b.textContent.includes("View Job"));
            const submitBtn = document.querySelector("#submit_btn") || document.querySelector('button[type="submit"]');
            const status = GM_getValue("is_following_now", "idle");

            if (viewJobBtn && status === "pending") {
                GM_setValue("is_following_now", "opened");
                window.open(viewJobBtn.href, "_blank");
            }

            if (selectBox && status === "completed") {
                let savedUser = GM_getValue("stored_ig_user", "");
                if (savedUser) {
                    let foundExact = false;
                    for (let i = 0; i < selectBox.options.length; i++) {
                        // EXACT MATCH ONLY: Wannan zai hana rikicewa da sunan wani
                        if (selectBox.options[i].text.trim() === savedUser) {
                            selectBox.selectedIndex = i;
                            selectBox.dispatchEvent(new Event('change'));
                            foundExact = true;
                            break;
                        }
                    }

                    if (foundExact && submitBtn && !submitBtn.disabled) {
                        clearInterval(checkAction);
                        GM_setValue("is_following_now", "idle");
                        // Danna Submit bayan 0.3 seconds
                        setTimeout(() => submitBtn.click(), 300);
                    }
                }
            }
        }, 400);
    }

    // 4. INSTAGRAM LOGIC (Auto-Verify Follow)
    if (location.hostname.includes("instagram.com")) {
        const followLogic = setInterval(() => {
            const buttons = [...document.querySelectorAll("button")];
            const isFollowing = buttons.some(b =>
                b.innerText === "Following" ||
                b.innerText === "Requested" ||
                b.innerText === "Kuna biyo" ||
                b.innerText === "An aika buƙata"
            );

            if (isFollowing) {
                clearInterval(followLogic);
                GM_setValue("is_following_now", "completed");
                setTimeout(() => window.close(), 500);
            } else {
                const followBtn = buttons.find(b => b.innerText === "Follow" || b.innerText === "Biyo");
                if (followBtn) followBtn.click();
            }
        }, 600);
    }

})();




// ==UserScript==
// @name         Socialearning - FB Mega Fast (Username Fix)
// @namespace    http://tampermonkey.net/
// @version      33.0
// @description  Fixed Username Selection & Auto-Submit
// @match        https://socialearning.org/*
// @match        https://*.facebook.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    const url = location.href;

    // --- 1. SETTINGS & PERSISTENT FILTER ---
    if (url.includes("socialearning.org")) {
        if (url.includes("/earner/available/tasks") && !url.includes("filter_social_media=5")) {
            location.replace("https://socialearning.org/earner/available/tasks?filter_social_media=5");
            return;
        }
    }

    // --- 2. SOCIALEARNING: VIEW TASK ---
    if (url.includes("/earner/available/tasks")) {
        const viewTask = [...document.querySelectorAll("a, button")].find(e => e.textContent.trim().toLowerCase() === "view task");
        if (viewTask) {
            GM_setValue("fb_action_state", "start");
            viewTask.click();
        }
    }

    // --- 3. SUBMIT PAGE LOGIC (GYARAN USERNAME & SUBMIT) ---
    if (url.includes("/earner/update/tasks/view/")) {
        const mainCheck = setInterval(() => {
            const state = GM_getValue("fb_action_state", "idle");
            const viewJob = [...document.querySelectorAll("a")].find(b => b.textContent.includes("View Job"));
            
            // Nemo select box na username
            const usernameSelect = document.querySelector("select[name='username']") || document.querySelector("select");
            const fileInput = document.querySelector("input[type='file']");
            const submitBtn = document.querySelector('button[type="submit"]') || document.querySelector('.btn-primary');

            if (viewJob && state === "start") {
                GM_setValue("fb_action_state", "working");
                window.open(viewJob.href, "_blank");
            }

            // GYARA: Auto-Select Username
            if (usernameSelect && usernameSelect.options.length > 1 && usernameSelect.selectedIndex <= 0) {
                // Zai zaba na farkon bayan "Select Social Media" (yawanci index 1)
                usernameSelect.selectedIndex = 1; 
                usernameSelect.dispatchEvent(new Event('change', { bubbles: true }));
                console.log("Username selected automatically!");
            }

            // GYARA: Auto-Submit bayan saka hoto
            if (state === "completed" || state === "working") {
                if (fileInput && fileInput.files.length > 0) {
                    console.log("Photo detected! Submitting...");
                    clearInterval(mainCheck);
                    GM_setValue("fb_action_state", "idle");
                    
                    setTimeout(() => {
                        if (submitBtn) {
                            submitBtn.disabled = false;
                            submitBtn.click();
                        }
                    }, 1000);
                }
            }
        }, 800);
    }

    // --- 4. FACEBOOK: FAST CLICK ---
    if (url.includes("facebook.com")) {
        let actionDone = false;

        const fbScanner = setInterval(() => {
            const elements = [...document.querySelectorAll('div[role="button"], span, i, div[aria-label], a[role="button"]')];

            const isConfirmed = elements.some(el => {
                const txt = el.innerText.trim();
                const aria = (el.getAttribute('aria-label') || "").toLowerCase();
                const isBtn = el.getAttribute('role') === 'button' || el.closest('div[role="button"]');
                return isBtn && (txt === "Following" || txt === "Liked" || txt === "Requested" || txt === "Friends" || aria.includes("following") || aria.includes("liked"));
            });

            if (isConfirmed) {
                clearInterval(fbScanner);
                setTimeout(() => {
                    GM_setValue("fb_action_state", "completed");
                    window.close();
                }, 3000);
                return;
            }

            if (!actionDone) {
                const target = elements.find(el => {
                    const txt = el.innerText.trim();
                    const aria = (el.getAttribute('aria-label') || "");
                    return txt === "Follow" || txt === "Like" || txt === "Add Friend" || aria === "Follow" || aria === "Like";
                });

                if (target) {
                    target.click();
                    actionDone = true;
                }
            }
        }, 300);
    }

})();
                                 
