
// ===== ELEMENTS =====

const canvas = document.getElementById("sky");
const ctx = canvas.getContext("2d");

const pages = Array.from(document.querySelectorAll(".page"));
const dots = Array.from(document.querySelectorAll(".dot"));

const petalContainer = document.getElementById("petalContainer");
const soundToggle = document.getElementById("soundToggle");

let currentPage = 0;
let fireworks = [];
let stars = [];
let soundEnabled = false;
let audioContext = null;
let lastAutoFirework = 0;

// ===== CANVAS SETUP =====

function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = window.innerWidth * ratio;
  canvas.height = window.innerHeight * ratio;

  canvas.style.width = window.innerWidth + "px";
  canvas.style.height = window.innerHeight + "px";

  ctx.setTransform(ratio, 0, 0, ratio, 0, 0);

  stars = Array.from({ length: 100 }, () => ({
    x: Math.random() * window.innerWidth,
    y: Math.random() * window.innerHeight,
    radius: Math.random() * 1.5 + 0.3,
    alpha: Math.random() * 0.7 + 0.2,
    speed: Math.random() * 0.015 + 0.005
  }));
}

resizeCanvas();
window.addEventListener("resize", resizeCanvas);

// ===== STAR BACKGROUND =====

function drawStars() {
  stars.forEach(star => {
    star.alpha += (Math.random() - 0.5) * star.speed;
    star.alpha = Math.max(0.15, Math.min(0.9, star.alpha));

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 230, 190, ${star.alpha})`;
    ctx.fill();
  });
}

// ===== FIREWORKS =====

const fireworkColors = [
  "#ffd166",
  "#ff70a6",
  "#ffffff",
  "#c77dff",
  "#80ffdb",
  "#ff9f1c",
  "#ff4d8d",
  "#fff1a8"
];

function burst(x, y, amount = 65) {
  const color = fireworkColors[
    Math.floor(Math.random() * fireworkColors.length)
  ];

  for (let i = 0; i < amount; i++) {
    const angle = (Math.PI * 2 * i) / amount;
    const speed = Math.random() * 4.5 + 1.2;

    fireworks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      alpha: 1,
      radius: Math.random() * 2 + 1,
      color,
      decay: Math.random() * 0.012 + 0.009
    });
  }
}

function drawFireworks() {
  for (let i = fireworks.length - 1; i >= 0; i--) {
    const particle = fireworks[i];

    particle.x += particle.vx;
    particle.y += particle.vy;

    particle.vx *= 0.985;
    particle.vy *= 0.985;
    particle.vy += 0.025;
    particle.alpha -= particle.decay;

    ctx.save();
    ctx.globalAlpha = Math.max(0, particle.alpha);
    ctx.fillStyle = particle.color;
    ctx.shadowBlur = 12;
    ctx.shadowColor = particle.color;

    ctx.beginPath();
    ctx.arc(
      particle.x,
      particle.y,
      particle.radius,
      0,
      Math.PI * 2
    );
    ctx.fill();
    ctx.restore();

    if (
      particle.alpha <= 0 ||
      particle.x < -50 ||
      particle.x > window.innerWidth + 50 ||
      particle.y > window.innerHeight + 50
    ) {
      fireworks.splice(i, 1);
    }
  }
}

// ===== ANIMATION LOOP =====

function animate(time = 0) {
  ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

  drawStars();
  drawFireworks();

  const interval = currentPage === 5 ? 650 : 1450;

  if (time - lastAutoFirework > interval) {
    const x = Math.random() * window.innerWidth;
    const y = 50 + Math.random() * (window.innerHeight * 0.48);

    burst(x, y, currentPage === 5 ? 95 : 55);
    lastAutoFirework = time;
  }

  requestAnimationFrame(animate);
}

requestAnimationFrame(animate);

// ===== CLICK FIREWORKS =====

document.addEventListener("click", event => {
  if (
    event.target.closest(
      "button, a, input, .gift-box, .diya-button"
    )
  ) {
    return;
  }

  burst(event.clientX, event.clientY, 55);
});

// ===== PAGE NAVIGATION =====

function showPage(index) {
  if (index < 0 || index >= pages.length) return;

  currentPage = index;

  pages.forEach((page, i) => {
    page.classList.toggle("active", i === currentPage);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentPage);
  });

  if (currentPage === 5) {
    finaleBurst();
  }

  window.scrollTo({ top: 0, behavior: "smooth" });
}

document.querySelectorAll("[data-next]").forEach(button => {
  button.addEventListener("click", () => {
    showPage(currentPage + 1);
    playChime();
  });
});

// ===== PAGE DOT NAVIGATION =====

dots.forEach((dot, index) => {
  dot.style.cursor = "pointer";

  dot.addEventListener("click", () => {
    showPage(index);
    playChime();
  });
});

// ===== DIYA INTERACTION =====

const diyaButtons = document.querySelectorAll(".diya-button");
const diyaStatus = document.getElementById("diyaStatus");

diyaButtons.forEach(button => {
  button.addEventListener("click", () => {
    button.classList.toggle("lit");

    const litCount = document.querySelectorAll(
      ".diya-button.lit"
    ).length;

    diyaStatus.textContent =
      `${litCount} of 5 diyas glowing ✨`;

    const rect = button.getBoundingClientRect();

    burst(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      35
    );

    playChime();
  });
});

// ===== MYSTERY GIFT =====

const giftBox = document.getElementById("giftBox");
const giftMessage = document.getElementById("giftMessage");
const giftContinue = document.getElementById("giftContinue");

giftBox.addEventListener("click", () => {
  const alreadyOpened = giftBox.classList.contains("opened");

  if (alreadyOpened) return;

  giftBox.classList.add("opened");
  giftMessage.classList.add("show");
  giftContinue.classList.remove("hidden");

  const rect = giftBox.getBoundingClientRect();

  burst(
    rect.left + rect.width / 2,
    rect.top + rect.height / 2,
    110
  );

  playChime();
});

giftContinue.addEventListener("click", () => {
  showPage(5);
  playChime();
});

// ===== FINALE FIREWORKS =====

function finaleBurst() {
  for (let i = 0; i < 10; i++) {
    setTimeout(() => {
      const x = 40 + Math.random() * (window.innerWidth - 80);
      const y = 50 + Math.random() * (window.innerHeight * 0.5);

      burst(x, y, 100);
    }, i * 350);
  }
}

// ===== FALLING LILY PETALS =====

function createPetal() {
  if (!petalContainer) return;

  const petal = document.createElement("span");
  petal.className = "petal";

  const size = 8 + Math.random() * 10;

  petal.style.left = Math.random() * 100 + "vw";
  petal.style.width = size + "px";
  petal.style.height = (size * 1.5) + "px";
  petal.style.animationDuration = (6 + Math.random() * 6) + "s";
  petal.style.opacity = (0.35 + Math.random() * 0.5).toString();

  petalContainer.appendChild(petal);

  setTimeout(() => {
    petal.remove();
  }, 13000);
}

setInterval(createPetal, 400);

// ===== SOUND EFFECT =====

function playChime() {
  if (!soundEnabled) return;

  try {
    if (!audioContext) {
      audioContext = new (
        window.AudioContext || window.webkitAudioContext
      )();
    }

    if (audioContext.state === "suspended") {
      audioContext.resume();
    }

    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(
      660,
      audioContext.currentTime
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      990,
      audioContext.currentTime + 0.25
    );

    gain.gain.setValueAtTime(
      0.12,
      audioContext.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioContext.currentTime + 0.7
    );

    oscillator.connect(gain);
    gain.connect(audioContext.destination);

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.7);
  } catch (error) {
    console.warn("Sound could not be played:", error);
  }
}

soundToggle.addEventListener("click", () => {
  soundEnabled = !soundEnabled;

  soundToggle.textContent = soundEnabled
    ? "♫ Sound: On"
    : "♫ Sound: Off";

  if (soundEnabled) {
    playChime();
  }
});

// ===== REPLAY WEBSITE =====

document.getElementById("replay").addEventListener("click", () => {
  diyaButtons.forEach(button => {
    button.classList.remove("lit");
  });

  diyaStatus.textContent = "0 of 5 diyas glowing ✨";

  giftBox.classList.remove("opened");
  giftMessage.classList.remove("show");
  giftContinue.classList.add("hidden");

  showPage(0);
  burst(window.innerWidth / 2, window.innerHeight / 3, 100);
  playChime();
});

// ===== START ON FIRST PAGE =====

showPage(0);
