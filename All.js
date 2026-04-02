// ==UserScript==
// @name Socialearning - IG + FB Ultra Fast Clean (V6.4 - Modified)
// @namespace http://tampermonkey.net/
// @version 6.4
// @description Strong Double Beep for Manual, 5 Beeps for No Tasks. Added Task Banner on Instagram.
// @match https://socialearning.org/*
// @match https://www.instagram.com/*
// @match https://*.facebook.com/*
// @grant GM_setValue
// @grant GM_getValue
// @grant GM_addStyle
// ==/UserScript==

(function () {
    'use strict';

    // Function to play Beeps
    function playNotificationSound(count = 2) {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

        function makeBeep(startTime) {
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();

            oscillator.type = 'square';
            oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + startTime);

            gainNode.gain.setValueAtTime(0.6, audioCtx.currentTime + startTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + startTime + 0.2);

            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);

            oscillator.start(audioCtx.currentTime + startTime);
            oscillator.stop(audioCtx.currentTime + startTime + 0.2);
        }

        for(let i = 0; i < count; i++) {
            makeBeep(i * 0.3);
        }
    }

    GM_addStyle(`
        #taskSwitchBtn,#igUserBtn{position:fixed;right:10px;z-index:99999;color:#fff;border-radius:50%;width:45px;height:45px;font-size:22px;border:2px solid white;cursor:pointer;display:flex;align-items:center;justify-content:center;}
        #taskSwitchBtn{top:50%;background:#28a745;}
        #igUserBtn{top:35%;background:#007bff;}
        #taskMenu{position:fixed;top:50%;right:70px;transform:translateY(-50%);background:#000;color:#fff;padding:10px;border-radius:10px;display:none;z-index:99999;}
        #taskMenu div{padding:6px 10px;cursor:pointer;}
        #taskMenu div:hover{background:#444;}
        #taskBanner{position:fixed;top:0;left:0;width:100%;background:red;color:white;text-align:center;padding:10px;font-weight:bold;font-size:20px;z-index:1000000;border-bottom:2px solid white;display:none;}
    `);

    const switchBtn = document.createElement("button");
    switchBtn.id = "taskSwitchBtn"; switchBtn.innerHTML = "⚙️";
    document.body.appendChild(switchBtn);

    const igBtn = document.createElement("button");
    igBtn.id = "igUserBtn"; igBtn.innerHTML = "👤";
    document.body.appendChild(igBtn);

    const menu = document.createElement("div");
    menu.id = "taskMenu";
    menu.innerHTML = `<div id="igOpt">📸 Instagram</div><div id="fbOpt">📘 Facebook</div>`;
    document.body.appendChild(menu);

    switchBtn.onclick = () => menu.style.display = menu.style.display === "block" ? "none" : "block";
    document.getElementById("igOpt").onclick = () => { GM_setValue("active_task", "instagram"); location.reload(); };
    document.getElementById("fbOpt").onclick = () => { GM_setValue("active_task", "facebook"); location.reload(); };
    igBtn.onclick = () => { let u = prompt("Enter EXACT Instagram Username:", GM_getValue("stored_ig_user", "")); if (u) GM_setValue("stored_ig_user", u.trim()); };

    let mode = GM_getValue("active_task", "instagram");
    const url = location.href;

    // ================= INSTAGRAM LOGIC =================
    if (mode === "instagram") {
        if (url.includes("/earner/available/tasks") && !url.includes("filter_social_media=2")) {
            location.replace("https://socialearning.org/earner/available/tasks?filter_social_media=2");
            return;
        }

        if (url.includes("/earner/available/tasks")) {
            let alertedOnThisLoad = false;
            const fast = setInterval(() => {
                const buttons = [...document.querySelectorAll("a,button")];
                const b = buttons.find(x => x.textContent.trim().toLowerCase() == "view task");

                if (b) {
                    clearInterval(fast);
                    GM_setValue("ig_state", "pending");
                    b.click();
                } else {
                    const noTaskMsg = document.body.innerText.includes("No available tasks") || document.body.innerText.includes("Empty");
                    if (noTaskMsg && !alertedOnThisLoad) {
                        alertedOnThisLoad = true;
                        playNotificationSound(5);
                    }
                }
            }, 1000);
        }

        if (url.includes("/earner/update/tasks/view/")) {
            const loop = setInterval(() => {
                const st = GM_getValue("ig_state", "idle");
                const card = document.querySelector(".card-body");
                const taskHeader = card ? card.innerText : "";

                if (taskHeader.includes("INSTAGRAM/Post Like")) GM_setValue("current_ig_task", "LIKE TASK");
                else if (taskHeader.includes("INSTAGRAM/Post Comments")) GM_setValue("current_ig_task", "COMMENT TASK");
                else if (taskHeader.includes("INSTAGRAM/Custom Comments")) GM_setValue("current_ig_task", "CUSTOM COMMENT TASK");
                else GM_setValue("current_ig_task", "FOLLOW/VIEW TASK");

                const isManualTask = taskHeader.includes("INSTAGRAM/Post Like") || taskHeader.includes("INSTAGRAM/Post Comments") || taskHeader.includes("INSTAGRAM/Custom Comments");
                const blacklisted = ["INSTAGRAM/Post Repost", "INSTAGRAM/Reel Sound Use", "INSTAGRAM/Share to Story", "INSTAGRAM/Vote"];
                const isPostView = taskHeader.includes("INSTAGRAM/Post View");

                if (blacklisted.some(t => taskHeader.includes(t)) || st === "dead_link" || st === "waiting_for_remove") {
                    const del = document.querySelector('button.btn-danger') || [...document.querySelectorAll("button")].find(b => b.innerText.includes("Delete"));
                    const rem = [...document.querySelectorAll("button, a")].find(b => b.innerText.includes("Remove Task"));

                    if (rem) {
                        clearInterval(loop);
                        GM_setValue("ig_state", "idle");
                        rem.click();
                        return;
                    } else if (del && st !== "waiting_for_remove") {
                        GM_setValue("ig_state", "waiting_for_remove");
                        del.click();
                        return;
                    }
                }

                if (isPostView && st === "pending") {
                    GM_setValue("ig_state", "completed");
                }

                const v = [...document.querySelectorAll("a")].find(b => b.textContent.includes("View Job"));
                if (v && st === "pending" && !isPostView) {
                    if (isManualTask) { playNotificationSound(2); }
                    GM_setValue("ig_state", "opened");
                    window.open(v.href, "_blank");
                }

                const s = document.querySelector("select[name='username']") || document.querySelector("select");
                const sub = document.querySelector("#submit_btn") || document.querySelector('button[type="submit"]');

                if (s && st === "completed") {
                    let saved = GM_getValue("stored_ig_user", "");
                    for (let i = 0; i < s.options.length; i++) {
                        if (s.options[i].text.trim() === saved) {
                            s.selectedIndex = i;
                            s.dispatchEvent(new Event("change"));
                            clearInterval(loop);
                            GM_setValue("ig_state", "idle");
                            setTimeout(() => { if(sub) sub.click(); }, 300);
                            break;
                        }
                    }
                }
            }, 400);
        }

        if (location.hostname.includes("instagram.com")) {
            const banner = document.createElement("div");
            banner.id = "taskBanner";
            banner.innerText = GM_getValue("current_ig_task", "TASK ACTIVE");
            document.body.appendChild(banner);
            banner.style.display = "block";

            const scan = setInterval(() => {
                const txt = document.body.innerText;
                if (txt.includes("Profile isn't available") || txt.includes("Restricted profile") || txt.includes("This content may be inappropriate") || txt. includes("Post isn't available") || txt. includes("Sorry, this page isn't available.")) {
                    clearInterval(scan); GM_setValue("ig_state", "dead_link"); window.close();
                }
                const btns = [...document.querySelectorAll("button")];
                if (btns.some(b => ["Following", "Requested"].includes(b.innerText))) {
                    clearInterval(scan); GM_setValue("ig_state", "completed"); window.close();
                } else {
                    const f = btns.find(b => b.innerText == "Follow");
                    if (f) f.click();
                }
            }, 600);
        }
    }

    // ================= FACEBOOK LOGIC (MANUAL VIEW - AUTO SUBMIT) =================
    if (mode === "facebook") {
        if (url.includes("/earner/available/tasks") && !url.includes("filter_social_media=5")) {
            location.replace("https://socialearning.org/earner/available/tasks?filter_social_media=5");
            return;
        }
        if (url.includes("/earner/available/tasks")) {
            let alertedOnThisLoadFB = false;
            const fbInterval = setInterval(() => {
                const b = [...document.querySelectorAll("a,button")].find(x => x.textContent.trim().toLowerCase() == "view task");
                if (b) {
                    clearInterval(fbInterval);
                    b.click();
                } else {
                    const noTaskMsg = document.body.innerText.includes("No available tasks") || document.body.innerText.includes("Empty");
                    if (noTaskMsg && !alertedOnThisLoadFB) {
                        alertedOnThisLoadFB = true;
                        playNotificationSound(5);
                    }
                }
            }, 1000);
        }
        if (url.includes("/earner/update/tasks/view/")) {
            const loop = setInterval(() => {
                const s = document.querySelector("select[name='username']") || document.querySelector("select");
                const f = document.querySelector("input[type='file']");
                const sub = document.querySelector('button[type="submit"]') || document.querySelector('.btn-primary');

                // Auto select username
                if (s && s.selectedIndex <= 0 && s.options.length > 1) {
                    s.selectedIndex = 1;
                    s.dispatchEvent(new Event("change", { bubbles: true }));
                }

                // Auto submit when file is detected
                if (f && f.files.length > 0) {
                    clearInterval(loop);
                    setTimeout(() => { if(sub) { sub.disabled = false; sub.click(); } }, 500);
                }
            }, 400);
        }
        // Removed all automatic Facebook.com interactions as requested
    }
})();
