console.log("Valentine script loaded ✅");

let messageIndex = 0;

const messages = [
  "No 🙃",
  "Are you sure? 🥺",
  "Really sure?? 😳",
  "Come onnnn 💘",
  "Pls pls pls 😭",
  "I’ll be extra cute today 😌",
  "Last chance... 😤",
  "Okay NOW try clicking me 😼",
];

let runawayEnabled = false;

document.addEventListener("DOMContentLoaded", () => {
  const noBtn = document.getElementById("noBtn");
  const yesBtn = document.getElementById("yesBtn");
  const hint = document.getElementById("hint");

  if (!noBtn || !yesBtn) return;

  // =========================
  // Move button away
  // =========================
  function moveAway(cursorX, cursorY) {
    const rect = noBtn.getBoundingClientRect();

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = centerX - cursorX;
    let dy = centerY - cursorY;

    const dist = Math.hypot(dx, dy) || 1;

    dx /= dist;
    dy /= dist;

    const STEP = 80;

    let newX = rect.left + dx * STEP;
    let newY = rect.top + dy * STEP;

    // Keep inside viewport
    const padding = 10;

    newX = Math.max(
      padding,
      Math.min(window.innerWidth - rect.width - padding, newX)
    );

    newY = Math.max(
      padding,
      Math.min(window.innerHeight - rect.height - padding, newY)
    );

    // IMPORTANT FIXES
    noBtn.style.position = "fixed";
    noBtn.style.left = newX + "px";
    noBtn.style.top = newY + "px";
    noBtn.style.right = "auto";   // 🔥 prevents disappearing
    noBtn.style.bottom = "auto";  // 🔥 safety reset
    noBtn.style.zIndex = "9999";
  }

  // =========================
  // No button clicks
  // =========================
  noBtn.addEventListener("click", () => {
    if (runawayEnabled) return;

    noBtn.textContent = messages[messageIndex];

    if (messageIndex === messages.length - 1) {
      runawayEnabled = true;
      hint.textContent = "(Hehe… now try to click “No” 😈)";

      // Initial jump
      moveAway(window.innerWidth / 2, window.innerHeight / 2);
    } else {
      hint.textContent = "(Tip: Keep pressing “No” 😼)";
      messageIndex++;
    }

    // Grow YES button
    const size = parseFloat(getComputedStyle(yesBtn).fontSize);
    yesBtn.style.fontSize = Math.min(size * 1.2, 54) + "px";
  });

  // =========================
  // Yes click
  // =========================
  yesBtn.addEventListener("click", () => {
    window.location.href = "yes.html";
  });

  // =========================
  // Run away when cursor near
  // =========================
  document.addEventListener("pointermove", (e) => {
    if (!runawayEnabled) return;

    const rect = noBtn.getBoundingClientRect();

    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const dist = Math.hypot(dx, dy);

    if (dist < 120) {
      moveAway(e.clientX, e.clientY);
    }
  });

  // =========================
  // Mobile support
  // =========================
  document.addEventListener(
    "touchstart",
    (e) => {
      if (!runawayEnabled) return;
      const t = e.touches[0];
      moveAway(t.clientX, t.clientY);
    },
    { passive: false }
  );
});


