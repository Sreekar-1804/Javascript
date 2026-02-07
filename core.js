
console.log("Valentine script loaded ✅");

// -------------------------
// Small helpers
// -------------------------
function $(id) {
  return document.getElementById(id);
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function prefersReducedMotion() {
  return window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Simple toast (if #toast exists)
let toastTimer = null;
function showToast(text) {
  const el = $("toast");
  if (!el) return;
  el.textContent = text;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 1800);
}

// Tiny click sound (no external files)
function makeBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = 660;
    gain.gain.value = 0.05;
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.06);
    osc.onended = () => ctx.close();
  } catch {
    // ignore
  }
}

// Persist small state across reloads
const STORE_KEY = "valentine:v1";
function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY) || "{}") || {};
  } catch {
    return {};
  }
}

function saveState(patch) {
  const current = loadState();
  const next = { ...current, ...patch };
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

function clearState() {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {
    // ignore
  }
}

// -------------------------
// Index page logic
// -------------------------
function initIndexPage() {
  const noBtn = $("noBtn");
  const yesBtn = $("yesBtn");
  const hint = $("hint");
  const meterBar = $("meterBar");

  if (!noBtn || !yesBtn) return false;

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

  const state = loadState();
  let messageIndex = clamp(Number(state.messageIndex ?? 0) || 0, 0, messages.length - 1);
  let runawayEnabled = Boolean(state.runawayEnabled);
  let soundEnabled = Boolean(state.soundEnabled);

  const soundBtn = $("soundBtn");
  if (soundBtn) {
    const renderSoundBtn = () => {
      soundBtn.textContent = soundEnabled ? "Sound: On 🔊" : "Sound: Off 🔇";
      soundBtn.setAttribute("aria-pressed", soundEnabled ? "true" : "false");
    };
    renderSoundBtn();
    soundBtn.addEventListener("click", () => {
      soundEnabled = !soundEnabled;
      saveState({ soundEnabled });
      renderSoundBtn();
      showToast(soundEnabled ? "Sound on" : "Sound off");
      if (soundEnabled) makeBeep();
    });
  }

  function updateMeter() {
    if (!meterBar) return;
    const pct = (messageIndex / (messages.length - 1)) * 100;
    meterBar.style.width = clamp(pct, 0, 100) + "%";
  }

  function updateUIFromState() {
    noBtn.textContent = messages[messageIndex];
    updateMeter();
    if (hint) {
      hint.textContent = runawayEnabled
        ? "(Hehe… now try to click “No” 😈)"
        : messageIndex === 0
          ? "(Tip: select YES !!!!)"
          : "(Tip: Keep pressing “No” 😼)";
    }

    // Reset button position if not runaway yet
    if (!runawayEnabled) {
      noBtn.style.position = "absolute";
      noBtn.style.right = "20px";
      noBtn.style.top = "18px";
      noBtn.style.left = "auto";
      noBtn.style.bottom = "auto";
      noBtn.style.zIndex = "";
    } else {
      // Make sure it doesn't get stuck off-screen on reload
      moveAway(window.innerWidth / 2, window.innerHeight / 2);
    }

    // Restore YES size
    const base = 18;
    const grown = clamp(base * Math.pow(1.2, messageIndex), base, 54);
    yesBtn.style.fontSize = grown + "px";
  }

  // Move button away (runaway mode)
  function moveAway(cursorX, cursorY) {
    const rect = noBtn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    let dx = centerX - cursorX;
    let dy = centerY - cursorY;
    const dist = Math.hypot(dx, dy) || 1;
    dx /= dist;
    dy /= dist;

    const STEP = 90;
    let newX = rect.left + dx * STEP;
    let newY = rect.top + dy * STEP;

    const padding = 10;
    newX = clamp(newX, padding, window.innerWidth - rect.width - padding);
    newY = clamp(newY, padding, window.innerHeight - rect.height - padding);

    noBtn.style.position = "fixed";
    noBtn.style.left = newX + "px";
    noBtn.style.top = newY + "px";
    noBtn.style.right = "auto";
    noBtn.style.bottom = "auto";
    noBtn.style.zIndex = "9999";
  }

  // Reset
  const resetBtn = $("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      messageIndex = 0;
      runawayEnabled = false;
      yesBtn.style.fontSize = "18px";
      clearState();
      saveState({ soundEnabled });
      updateUIFromState();
      showToast("Reset ✨");
      if (soundEnabled) makeBeep();
    });
  }

  // Share
  const shareBtn = $("shareBtn");
  if (shareBtn) {
    shareBtn.addEventListener("click", async () => {
      const shareText = "Will you be my Valentine? 💘";
      const url = window.location.href;
      try {
        if (navigator.share) {
          await navigator.share({ title: document.title, text: shareText, url });
          showToast("Shared!");
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(url);
          showToast("Link copied ✅");
        } else {
          showToast("Can't share here 🙈");
        }
      } catch {
        showToast("Share cancelled");
      }
      if (soundEnabled) makeBeep();
    });
  }

  // No button clicks
  noBtn.addEventListener("click", () => {
    if (runawayEnabled) return;

    noBtn.textContent = messages[messageIndex];

    if (messageIndex === messages.length - 1) {
      runawayEnabled = true;
      if (hint) hint.textContent = "(Hehe… now try to click “No” 😈)";
      moveAway(window.innerWidth / 2, window.innerHeight / 2);
    } else {
      if (hint) hint.textContent = "(Tip: Keep pressing “No” 😼)";
      messageIndex++;
    }

    // Grow YES button + pop
    const size = parseFloat(getComputedStyle(yesBtn).fontSize);
    yesBtn.style.fontSize = Math.min(size * 1.2, 54) + "px";
    yesBtn.classList.add("popped");
    setTimeout(() => yesBtn.classList.remove("popped"), 180);

    updateMeter();
    saveState({ messageIndex, runawayEnabled, soundEnabled });
    if (soundEnabled) makeBeep();
  });

  // Yes click
  yesBtn.addEventListener("click", () => {
    saveState({ messageIndex, runawayEnabled, soundEnabled });
    if (soundEnabled) makeBeep();
    window.location.href = "yes.html";
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", (e) => {
    const key = e.key.toLowerCase();
    if (key === "y") {
      yesBtn.click();
    }
    if (key === "n") {
      noBtn.click();
    }
    if (key === "r") {
      resetBtn?.click();
    }
  });

  // Run away when cursor near
  document.addEventListener("pointermove", (e) => {
    if (!runawayEnabled) return;
    const rect = noBtn.getBoundingClientRect();
    const dx = e.clientX - (rect.left + rect.width / 2);
    const dy = e.clientY - (rect.top + rect.height / 2);
    const dist = Math.hypot(dx, dy);
    if (dist < 120) moveAway(e.clientX, e.clientY);
  });

  // Mobile support
  document.addEventListener(
    "touchstart",
    (e) => {
      if (!runawayEnabled) return;
      const t = e.touches[0];
      moveAway(t.clientX, t.clientY);
    },
    { passive: true }
  );

  updateUIFromState();
  return true;
}

// -------------------------
// Yes page logic (confetti)
// -------------------------
function initYesPage() {
  const canvas = $("confetti");
  if (!canvas) return false;

  const shareYesBtn = $("shareYesBtn");
  const replayBtn = $("replayConfettiBtn");

  // Share
  if (shareYesBtn) {
    shareYesBtn.addEventListener("click", async () => {
      const shareText = "SHE/HE SAID YES!!! 💖";
      const url = window.location.href;
      try {
        if (navigator.share) {
          await navigator.share({ title: document.title, text: shareText, url });
          showToast("Shared!");
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(url);
          showToast("Link copied ✅");
        } else {
          showToast("Can't share here 🙈");
        }
      } catch {
        showToast("Share cancelled");
      }
    });
  }

  // Confetti animation
  const ctx = canvas.getContext("2d");
  let w = 0;
  let h = 0;
  const DPR = Math.max(1, Math.min(2, window.devicePixelRatio || 1));

  function resize() {
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = Math.floor(w * DPR);
    canvas.height = Math.floor(h * DPR);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  window.addEventListener("resize", resize);
  resize();

  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  // Using random colors without specifying exact values in CSS; JS is fine
  const palette = ["#ff4d88", "#ff77a8", "#ffd1dc", "#ffb3c7", "#ffffff"];

  function makePiece() {
    return {
      x: rand(0, w),
      y: rand(-h, -20),
      r: rand(3, 7),
      vx: rand(-2.2, 2.2),
      vy: rand(2.2, 5.8),
      rot: rand(0, Math.PI),
      vr: rand(-0.2, 0.2),
      color: palette[(Math.random() * palette.length) | 0],
      life: rand(60, 180),
    };
  }

  let pieces = [];
  let running = false;
  let raf = 0;

  function startConfetti() {
    if (prefersReducedMotion()) {
      // Still show a tiny celebration message instead of intense animation
      showToast("YAY! 💖");
      return;
    }
    pieces = Array.from({ length: 140 }, makePiece);
    running = true;
    cancelAnimationFrame(raf);
    tick();
  }

  function tick() {
    raf = requestAnimationFrame(tick);
    ctx.clearRect(0, 0, w, h);

    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      p.vy += 0.02; // gravity
      p.life -= 1;

      // wrap
      if (p.x < -20) p.x = w + 20;
      if (p.x > w + 20) p.x = -20;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
      ctx.restore();
    });

    pieces = pieces.filter((p) => p.y < h + 30 && p.life > 0);
    if (running && pieces.length === 0) {
      running = false;
      cancelAnimationFrame(raf);
      ctx.clearRect(0, 0, w, h);
    }
  }

  replayBtn?.addEventListener("click", () => {
    startConfetti();
    showToast("Again! 🎉");
  });

  // auto fire once
  startConfetti();
  return true;
}

// -------------------------
// Boot
// -------------------------
document.addEventListener("DOMContentLoaded", () => {
  // Try both initializers; each returns true if it applied.
  initIndexPage();
  initYesPage();
});



