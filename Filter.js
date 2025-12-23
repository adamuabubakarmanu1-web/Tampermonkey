// ==UserScript==
// @name         SocialEarning Username Auto Picker (Working)
// @namespace    https://socialearning.org/
// @version      2.1
// @match        https://socialearning.org/earner/update/tasks/view/*
// @grant        none
// ==/UserScript==

(function () {
  'use strict';

  const KEY = "SE_USERNAME_SAVED";

  /* ---------- UI BUTTON ---------- */
  function addButton() {
    if (document.getElementById("se-btn")) return;

    const btn = document.createElement("div");
    btn.id = "se-btn";
    btn.innerText = "⚙️ Username";
    btn.style = `
      position: fixed;
      right: 10px;
      bottom: 90px;
      background: #111;
      color: #fff;
      padding: 10px;
      border-radius: 8px;
      z-index: 99999;
      font-size: 13px;
      cursor: pointer;
    `;
    btn.onclick = () => {
      const u = prompt("Saka username (za a adana):");
      if (u) {
        localStorage.setItem(KEY, u.trim());
        alert("✅ Username an adana");
      }
    };
    document.body.appendChild(btn);
  }

  /* ---------- WAIT FOR MODAL ---------- */
  function observeModal() {
    const observer = new MutationObserver(() => {
      const modal =
        document.querySelector('[role="dialog"]') ||
        document.querySelector('.MuiDialog-root');

      if (!modal) return;

      const saved = localStorage.getItem(KEY);
      if (!saved) return;

      const labels = [...modal.querySelectorAll('label')]
        .filter(l => l.innerText && l.innerText.trim());

      for (const l of labels) {
        if (l.innerText.trim().toLowerCase() === saved.toLowerCase()) {
          const radio = l.querySelector('input[type="radio"]');
          radio ? radio.click() : l.click();

          setTimeout(() => {
            const submit =
              document.querySelector('button[type="submit"]') ||
              [...document.querySelectorAll('button')]
                .find(b => /submit/i.test(b.innerText));
            if (submit) submit.click();
          }, 800);

          observer.disconnect();
          break;
        }
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });
  }

  /* ---------- INIT ---------- */
  addButton();
  observeModal();

})();
