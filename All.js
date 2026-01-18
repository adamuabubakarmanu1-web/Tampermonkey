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
