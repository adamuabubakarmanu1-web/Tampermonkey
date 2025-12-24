// ==UserScript==
// @name         SocialEarning → IG Auto Follow & Auto Close (With Delay)
// @namespace    https://socialearning.org/
// @version      1.3
// @match        https://socialearning.org/earner/update/tasks/view/*
// @match        https://www.instagram.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(function () {
    'use strict';

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    async function waitFor(fn, timeout = 15000, interval = 500) {
        const start = Date.now();
        while (Date.now() - start < timeout) {
            try {
                if (fn()) return true;
            } catch {}
            await sleep(interval);
        }
        return false;
    }

    /* ========== SOCIAL EARNING PART ========== */
    async function handleSocialEarning() {
        console.log('SE: Searching for "View Job"...');

        await waitFor(() => {
            const btns = [...document.querySelectorAll('a,button')];
            for (const b of btns) {
                if (b.innerText.trim() === 'View Job' && b.href) {
                    console.log('SE: Opening Instagram:', b.href);
                    GM_setValue('igOpenedByScript', true);
                    window.open(b.href, '_blank');
                    return true;
                }
            }
            return false;
        }, 20000);
    }

    /* ========== INSTAGRAM PART ========== */
    async function handleInstagram() {
        const openedByScript = GM_getValue('igOpenedByScript', false);
        if (!openedByScript) return;

        console.log('IG: Checking follow status...');

        // 1️⃣ Duba idan an riga an yi FOLLOWING
        const alreadyFollowing = await waitFor(() =>
            [...document.querySelectorAll('button')]
                .some(b => b.innerText.trim() === 'Following'),
            5000
        );

        if (alreadyFollowing) {
            console.log('IG: Already Following → closing tab after delay');
            GM_setValue('igOpenedByScript', false);
            await sleep(randomDelay(1000, 2000));
            window.close();
            return;
        }

        // 2️⃣ Idan ba a yi follow ba → danna Follow bayan delay
        await sleep(randomDelay(1000, 3000)); // delay kafin danna follow

        const clicked = await waitFor(() => {
            for (const b of document.querySelectorAll('button')) {
                if (b.innerText.trim() === 'Follow') {
                    b.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    b.click();
                    return true;
                }
            }
            return false;
        }, 10000);

        if (!clicked) {
            console.warn('IG: Follow button not found');
            GM_setValue('igOpenedByScript', false);
            return;
        }

        console.log('IG: Follow clicked, waiting for Following...');

        // 3️⃣ Jira ya koma FOLLOWING
        const confirmed = await waitFor(() =>
            [...document.querySelectorAll('button')]
                .some(b => b.innerText.trim() === 'Following'),
            10000
        );

        if (!confirmed) {
            console.warn('IG: Follow not confirmed');
            GM_setValue('igOpenedByScript', false);
            return;
        }

        console.log('IG: Follow successful → closing tab after delay');
        GM_setValue('igOpenedByScript', false);
        await sleep(randomDelay(1000, 2000)); // delay kafin close
        window.close();
    }

    /* ========== HELPER FUNCTION ========== */
    function randomDelay(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    /* ========== ROUTER ========== */
    if (location.hostname.includes('socialearning.org')) {
        handleSocialEarning();
    }

    if (location.hostname.includes('instagram.com')) {
        handleInstagram();
    }

})();
