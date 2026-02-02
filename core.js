console.log("Valentine script loaded ✅");

let messageIndex = 0;

const messages = [
  "No 🙃",
  "Are you sure? 🥺",
  "Really sure?? 😳",
  "Come onnnn 💘",
  "Pls pls pls 😭",
  "Pls dont break my heart 💔",
  "Last chance... 😤",
  "Okay NOW try clicking me 😼"
];

let runawayEnabled = false;

document.addEventListener("DOMContentLoaded", () => {
  const noButton = document.getElementById("noBtn");
  const yesButton = document.getElementById("yesBtn");
  const buttonArea = document.getElementById("buttonArea");
  const hint = document.getElementById("hint");

  if (!noButton || !yesButton || !buttonArea || !hint) {
    console.error("Missing DOM elements. Check ids in index.html");
    return;
  }

  function handleNoClick() {
    noButton.textContent = messages[messageIndex];

    if (messageIndex === messages.length - 1) {
      runawayEnabled = true;
      hint.textContent = "(Hehe… now try to click “No” 😈)";
    } else {
      hint.textContent = "(Tip: Keep pressing “No” 😼)";
    }

    if (!runawayEnabled) messageIndex++;

    const currentSize = parseFloat(getComputedStyle(yesButton).fontSize);
    yesButton.style.fontSize = `${Math.min(currentSize * 1.18, 52)}px`;
  }

  function handleYesClick() {
    window.location.href = "yes.html";
  }

  function moveNoButtonSomewhere() {
    if (!runawayEnabled) return;

    const areaRect = buttonArea.getBoundingClientRect();
    const btnRect = noButton.getBoundingClientRect();

    const padding = 8;
    const maxX = areaRect.width - btnRect.width - padding;
    const maxY = areaRect.height - btnRect.height - padding;

    const x = Math.max(padding, Math.random() * maxX);
    const y = Math.max(padding, Math.random() * maxY);

    noButton.style.left = `${x}px`;
    noButton.style.top = `${y}px`;
    noButton.style.right = "auto";
  }

  noButton.addEventListener("click", handleNoClick);

  // Run away only at the end
  noButton.addEventListener("mouseenter", moveNoButtonSomewhere);
  noButton.addEventListener("touchstart", (e) => {
    if (!runawayEnabled) return;
    e.preventDefault();
    moveNoButtonSomewhere();
  }, { passive: false });

  yesButton.addEventListener("click", handleYesClick);
});

