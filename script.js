const CONFIG = {
  gallery: [
    { src: "images/one.jpeg", caption: "A moment I want to keep" },
    { src: "images/two.jpeg", caption: "One of my favourite memories" },
    { src: "images/three.jpeg", caption: "Just us, being us" },
    { src: "images/four.jpeg", caption: "A day worth remembering" },
    { src: "images/five.jpeg", caption: "Your smile, always" },
    { src: "images/us.jpeg", caption: "More memories to come" }
  ],
  
};

const starfield = document.querySelector("#starfield");
const toast = document.querySelector("#toast");

function makeStars() {
  if (!starfield) return;
  const fragment = document.createDocumentFragment();
  const count = window.innerWidth < 600 ? 65 : 115;
  for (let i = 0; i < count; i += 1) {
    const star = document.createElement("span");
    star.className = "star";
    const size = Math.random() * 2.2 + 0.6;
    star.style.width = `${size}px`;
    star.style.height = `${size}px`;
    star.style.left = `${Math.random() * 100}%`;
    star.style.top = `${Math.random() * 100}%`;
    star.style.setProperty("--duration", `${2.5 + Math.random() * 5}s`);
    star.style.animationDelay = `${Math.random() * 5}s`;
    fragment.appendChild(star);
  }
  starfield.replaceChildren(fragment);
}
makeStars();

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2600);
}

document.querySelector("#beginButton").addEventListener("click", () => {
  document.querySelector("#begin").scrollIntoView({ behavior: "smooth" });
});

document.querySelectorAll(".memory-card").forEach((card) => {
  card.addEventListener("click", () => {
    const flipped = card.classList.toggle("flipped");
    card.setAttribute("aria-pressed", String(flipped));
  });
});

function renderGallery() {
  const grid = document.querySelector("#photoGrid");
  if (!grid) return;
  grid.replaceChildren();

  CONFIG.gallery.forEach((photo, index) => {
    const card = document.createElement("figure");
    card.className = "photo-card";

    const img = document.createElement("img");
    img.src = photo.src;
    img.alt = photo.caption;
    img.loading = "lazy";

    const placeholder = document.createElement("div");
    placeholder.className = "photo-placeholder";
    const symbol = document.createElement("span");
    symbol.textContent = ["✧", "☾", "♡", "✦", "✷", "∞"][index % 6];
    const title = document.createElement("strong");
    title.textContent = "Your memory goes here";
    const hint = document.createElement("small");
    hint.textContent = `Add images/${photo.src.split("/").pop()}`;
    placeholder.append(symbol, title, hint);

    img.addEventListener("error", () => {
      img.remove();
      card.prepend(placeholder);
    }, { once: true });

    const caption = document.createElement("figcaption");
    caption.className = "photo-caption";
    caption.textContent = photo.caption;

    card.append(img, caption);
    grid.appendChild(card);
  });
}
renderGallery();

const openLetterButton = document.querySelector("#openLetter");
const letterPanel = document.querySelector("#letterPanel");
openLetterButton.addEventListener("click", () => {
  const willOpen = letterPanel.hidden;
  letterPanel.hidden = !willOpen;
  openLetterButton.setAttribute("aria-expanded", String(willOpen));
  openLetterButton.innerHTML = willOpen
    ? 'Close your letter <span aria-hidden="true">×</span>'
    : 'Open your letter <span aria-hidden="true">♡</span>';
  if (willOpen) letterPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
});

const finalRevealButton = document.querySelector("#finalReveal");
const finalMessage = document.querySelector("#finalMessage");
finalRevealButton.addEventListener("click", () => {
  const willOpen = finalMessage.hidden;
  finalMessage.hidden = !willOpen;
  finalRevealButton.setAttribute("aria-expanded", String(willOpen));
  finalRevealButton.innerHTML = willOpen
    ? 'Keep this little moment <span aria-hidden="true">♡</span>'
    : 'One last little thing <span aria-hidden="true">✦</span>';
  if (willOpen) {
    finalMessage.scrollIntoView({ behavior: "smooth", block: "center" });
    celebrateStars();
  }
});

function celebrateStars() {
  if (!starfield) return;
  for (let i = 0; i < 24; i += 1) {
    const spark = document.createElement("span");
    spark.className = "star";
    spark.style.width = `${2 + Math.random() * 3}px`;
    spark.style.height = spark.style.width;
    spark.style.left = `${15 + Math.random() * 70}%`;
    spark.style.top = `${window.scrollY + Math.random() * window.innerHeight}px`;
    spark.style.position = "absolute";
    spark.style.background = "#f4dfa4";
    spark.style.animation = "twinkle 1.2s ease-in-out 2 alternate";
    starfield.appendChild(spark);
    window.setTimeout(() => spark.remove(), 2600);
  }
}

const revealElements = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

let audioContext = null;
let oscillator = null;
let gainNode = null;
const soundToggle = document.querySelector("#soundToggle");
const soundLabel = document.querySelector("#soundLabel");

soundToggle.addEventListener("click", async () => {
  if (!CONFIG.enableAmbientTone) {
    showToast("Ambient sound is disabled by default. Your little universe is peaceful as it is. ♡");
    return;
  }
  try {
    if (audioContext && audioContext.state === "running") {
      await audioContext.suspend();
      soundToggle.setAttribute("aria-pressed", "false");
      soundLabel.textContent = "Sound off";
      return;
    }
    if (!audioContext) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) {
        showToast("This browser doesn't support generated ambient sound.");
        return;
      }
      audioContext = new AudioContextClass();
      oscillator = audioContext.createOscillator();
      gainNode = audioContext.createGain();
      oscillator.type = "sine";
      oscillator.frequency.value = 174.61;
      gainNode.gain.value = 0.012;
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      oscillator.start();
    }
    await audioContext.resume();
    soundToggle.setAttribute("aria-pressed", "true");
    soundLabel.textContent = "Sound on";
  } catch {
    showToast("Sound couldn't start in this browser.");
  }
});

let resizeTimer;
window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(makeStars, 180);
});
