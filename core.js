console.log("Valentine Fancy Script Loaded 💘 (Fixed Escape Mode)");

document.addEventListener("DOMContentLoaded", () => {
  // Elements (index page)
  const noBtn = document.getElementById("noBtn");
  const yesBtn = document.getElementById("yesBtn");
  const hint = document.getElementById("hint");
  const buttonArea = document.getElementById("buttonArea");

  // Optional progress fill
  const progressFill =
    document.getElementById("progressFill") ||
    document.querySelector(".progress > div");

  // FX layers (both pages)
  const fxHearts = document.getElementById("fxHearts");
  const fxSparkles = document.getElementById("fxSparkles");
  const card = document.querySelector(".card");

  const hasButtons = !!(noBtn && yesBtn && buttonArea);
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // =========================================
  // Fancy FX (both pages)
  // =========================================
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

  // If YES page, stop here
  if (!hasButtons) return;

  // =========================================
  // Story + State
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

  // No button “home” inside the buttonArea (relative coords)
  let home = null; // {x,y} relative to buttonArea
  let noScale = 1;

  // How far it can wander (keeps it visible, no hunting)
  const MAX_WANDER = 85;

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
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
    noScale = Math.max(0.78, noScale * 0.94);
    noBtn.style.transform = `scale(${noScale})`;
  }

  // Convert current NO position into buttonArea-relative coordinates
  function captureHomeRelative() {
    const areaRect = buttonArea.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();
    home = {
      x: noRect.left - areaRect.left,
      y: noRect.top - areaRect.top
    };
  }

  // Ensure NO is absolutely positioned inside the buttonArea
  function ensureAbsoluteInsideArea() {
    // Important: buttonArea must be position: relative in CSS.
    // Our CSS already does this.
    noBtn.style.position = "absolute";
    noBtn.style.zIndex = "9999";
  }

  // Move NO to a safe position (relative to buttonArea)
  function moveNoTo(x, y) {
    const areaRect = buttonArea.getBoundingClientRect();
    const noRect = noBtn.getBoundingClientRect();

    // After switching to absolute, recompute size safely
    const btnW = noRect.width;
    const btnH = noRect.height;

    const padding = 8;

    const minX = padding;
    const maxX = Math.max(padding, areaRect.width - btnW - padding);

    const minY = padding;
    const maxY = Math.max(padding, areaRect.height - btnH - padding);

    const cx = clamp(x, minX, maxX);
    const cy = clamp(y, minY, maxY);

    noBtn.style.left = cx + "px";
    noBtn.style.top = cy + "px";
  }

  // Dodge within a small radius around home (so it never disappears)
  function dodgeNearHome() {
    if (!home) captureHomeRelative();
    ensureAbsoluteInsideArea();

    const ox = (Math.random() * 2 - 1) * MAX_WANDER;
    const oy = (Math.random() * 2 - 1) * (MAX_WANDER * 0.75);

    moveNoTo(home.x + ox, home.y + oy);
    if (!reduceMotion) shrinkNoSlightly();
  }

  // Make “No” impossible to click: dodge on pointerdown/touchstart
  function blockNoClick(e) {
    if (!escapeMode) return;
    e.preventDefault();
    e.stopPropagation();
    dodgeNearHome();
    if (hint) hint.textContent = "Nope 😈 (try YES 💘)";
  }

  // =========================================
  // Main button actions
  // =========================================
  yesBtn.addEventListener("click", () => {
    window.location.href = "yes.html";
  });

  // Heart burst on YES hover (optional)
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

  // Normal “No” clicks until last message
  noBtn.addEventListener("click", () => {
    if (escapeMode) return; // clicks are blocked by pointerdown anyway

    clickCount = Math.min(clickCount + 1, lastIndex);

    const line = script[clickCount];
    noBtn.textContent = line.text;
    if (hint) hint.textContent = line.hint;

    growYes();
    setProgress();

    // Start escape mode ONLY after last message is shown
    if (clickCount === lastIndex) {
      escapeMode = true;

      // Capture the "home" position while it's still in normal flow
      captureHomeRelative();

      // Now convert to absolute inside the area at the same spot
      ensureAbsoluteInsideArea();
      moveNoTo(home.x, home.y);

      // Small cue
      noBtn.style.cursor = "not-allowed";
      shrinkNoSlightly();

      // First dodge (tiny)
      if (!reduceMotion) dodgeNearHome();
    }
  });

  // Escape mode interactions: dodge before click lands
  noBtn.addEventListener("pointerdown", blockNoClick);
  noBtn.addEventListener("touchstart", blockNoClick, { passive: false });

  // Also dodge if you hover close (desktop)
  document.addEventListener("pointermove", (e) => {
    if (!escapeMode || reduceMotion) return;
    const r = noBtn.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    if (Math.hypot(e.clientX - cx, e.clientY - cy) < 140) {
      dodgeNearHome();
    }
  });

  // Init
  setProgress();
});





