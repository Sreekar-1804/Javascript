console.log("Valentine Fancy Script Loaded 💘 (Final Complete)");

document.addEventListener("DOMContentLoaded", () => {
  // Elements (index page)
  const noBtn = document.getElementById("noBtn");
  const yesBtn = document.getElementById("yesBtn");
  const hint = document.getElementById("hint");
  const buttonArea = document.getElementById("buttonArea");

  // Optional progress fill (works with <div class="progress"><div id="progressFill"></div></div>)
  const progressFill =
    document.getElementById("progressFill") ||
    document.querySelector(".progress > div");

  // FX layers (both pages)
  const fxHearts = document.getElementById("fxHearts");
  const fxSparkles = document.getElementById("fxSparkles");
  const card = document.querySelector(".card");

  // Are we on index page (buttons exist) or yes page (no buttons)?
  const hasButtons = !!(noBtn && yesBtn && buttonArea);

  // Respect reduced motion
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // =========================================
  // Fancy FX Layer (works on both pages)
  // =========================================
  // Floating hearts (ambient)
  if (fxHearts && !reduceMotion) {
    setInterval(() => {
      const h = document.createElement("div");
      h.className = "v-heart";
      h.textContent = ["💗", "💖", "💘", "💝", "❤️", "💕"][Math.floor(Math.random() * 6)];
      h.style.left = Math.random() * 100 + "vw";
      h.style.fontSize = (14 + Math.random() * 22) + "px";
      h.style.animationDuration = (6 + Math.random() * 5) + "s";
      h.style.opacity = (0.55 + Math.random() * 0.35).toFixed(2);
      fxHearts.appendChild(h);
      setTimeout(() => h.remove(), 12000);
    }, 650);
  }

  // Sparkles (ambient)
  if (fxSparkles && !reduceMotion) {
    setInterval(() => {
      const s = document.createElement("div");
      s.className = "v-spark";
      s.style.left = Math.random() * 100 + "vw";
      s.style.top = Math.random() * 100 + "vh";
      fxSparkles.appendChild(s);
      setTimeout(() => s.remove(), 1700);
    }, 260);
  }

  // 3D tilt for the card (premium feel)
  if (card && !reduceMotion) {
    const maxTilt = 10;
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      const tiltY = (px - 0.5) * maxTilt;
      const tiltX = (0.5 - py) * maxTilt;
      card.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateY(-1px)`;
    });
    card.addEventListener("pointerleave", () => {
      card.style.transform = "rotateX(0deg) rotateY(0deg)";
    });
  }

  // If we’re on YES page (no buttons), stop here (FX still runs).
  if (!hasButtons) return;

  // =========================================
  // Playful No/Yes Logic (Index page)
  // =========================================
  const script = [
    { text: "No 🙃", hint: "Okay… but are you sure? 😼" },
    { text: "No… 😳", hint: "That sounded less confident 👀" },
    { text: "Maybe no… 🥺", hint: "Awww come on 😭" },
    { text: "I’m not sure… 👉👈", hint: "We’re getting closer 😌💘" },
    { text: "Don’t make me choose 😭", hint: "You know you want to 😏" },
    { text: "Okay… fine 😤", hint: "Hehe… one more time then 😈" },
    { text: "…Yes? 😳", hint: "Now try clicking NO again 😈💘" } // last stage
  ];

  const lastIndex = script.length - 1;

  let clickCount = 0;
  let escapeMode = false;

  // Keep NO nearby so user doesn’t hunt for it
  let noScale = 1;
  let home = null; // {x,y} viewport coords (NO's original spot)
  const MAX_WANDER = 90;

  function clamp(val, min, max) {
    return Math.max(min, Math.min(max, val));
  }

  function setProgress() {
    if (!progressFill) return;
    const pct = clamp((clickCount / lastIndex) * 100, 0, 100);
    progressFill.style.width = pct + "%";
  }

  function growYes() {
    const size = parseFloat(getComputedStyle(yesBtn).fontSize) || 18;
    yesBtn.style.fontSize = Math.min(size * 1.18, 60) + "px";
  }

  function shrinkNoSlightly() {
    // gentle, not too aggressive
    noScale = Math.max(0.72, noScale * 0.93);
    noBtn.style.transform = `scale(${noScale})`;
  }

  function captureHome() {
    const r = noBtn.getBoundingClientRect();
    home = { x: r.left, y: r.top };
  }

  // Dodge around home within button area bounds
  function dodgeNoNearHome() {
    const areaRect = buttonArea.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();
    const padding = 10;

    if (!home) captureHome();

    // Small offsets
    const ox = (Math.random() * 2 - 1) * MAX_WANDER;
    const oy = (Math.random() * 2 - 1) * (MAX_WANDER * 0.7);

    let x = home.x + ox;
    let y = home.y + oy;

    // Clamp to button area
    const minX = areaRect.left + padding;
    const maxX = areaRect.right - noRect.width - padding;
    const minY = areaRect.top + padding;
    const maxY = areaRect.bottom - noRect.height - padding;

    x = clamp(x, minX, maxX);
    y = clamp(y, minY, maxY);

    // Clamp to small radius around home
    x = clamp(x, home.x - MAX_WANDER, home.x + MAX_WANDER);
    y = clamp(y, home.y - MAX_WANDER, home.y + MAX_WANDER);

    noBtn.style.position = "fixed";
    noBtn.style.left = x + "px";
    noBtn.style.top = y + "px";
    noBtn.style.right = "auto";
    noBtn.style.bottom = "auto";
    noBtn.style.zIndex = "9999";
  }

  function pointerTooClose(e) {
    const r = noBtn.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
    return dist < 140;
  }

  // =========================================
  // Events
  // =========================================
  yesBtn.addEventListener("click", () => {
    window.location.href = "yes.html";
  });

  // NO click logic
  noBtn.addEventListener("click", () => {
    // Normal stage: cycle messages, no dodging
    if (!escapeMode) {
      clickCount = Math.min(clickCount + 1, lastIndex);

      const line = script[clickCount];
      noBtn.textContent = line.text;
      if (hint) hint.textContent = line.hint;

      growYes();
      setProgress();

      // Enable escape ONLY after the last message is shown
      if (clickCount === lastIndex) {
        escapeMode = true;
        noBtn.style.cursor = "not-allowed";

        // Lock home to where it currently is
        captureHome();

        // Tiny “mode change” cue
        shrinkNoSlightly();

        // Optional: first small dodge so it feels alive
        if (!reduceMotion) dodgeNoNearHome();
      }

      return;
    }

    // Escape mode: clicking NO makes it dodge, but close by
    if (!reduceMotion) {
      dodgeNoNearHome();
      shrinkNoSlightly();
    }

    if (hint) hint.textContent = "NO is shy now 😳… just click YES 😈💘";
  });

  // Escape mode: dodge if pointer is too close
  document.addEventListener("pointermove", (e) => {
    if (!escapeMode || reduceMotion) return;
    if (pointerTooClose(e)) {
      dodgeNoNearHome();
      shrinkNoSlightly();
    }
  });

  // Escape mode: dodge on hover too
  noBtn.addEventListener("mouseenter", () => {
    if (!escapeMode || reduceMotion) return;
    dodgeNoNearHome();
    shrinkNoSlightly();
  });

  // Heart burst on YES hover
  yesBtn.addEventListener("mouseenter", () => {
    if (reduceMotion) return;

    const r = yesBtn.getBoundingClientRect();
    for (let i = 0; i < 10; i++) {
      const p = document.createElement("div");
      p.className = "heart-pop";
      p.textContent = ["💘", "💖", "💕"][Math.floor(Math.random() * 3)];
      p.style.left = (r.left + r.width / 2 + (Math.random() * 60 - 30)) + "px";
      p.style.top = (r.top + r.height / 2 + (Math.random() * 24 - 12)) + "px";
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 900);
    }
  });

  // Init
  setProgress();
});






