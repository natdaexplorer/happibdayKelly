// Elements
const camera = document.getElementById("camera");
const frameOverlay = document.getElementById("frameOverlay");
const countdownEl = document.getElementById("countdown");
const photoPreviewContainer = document.getElementById("photoPreviewContainer");

// --- MUSIC LOGIC ---
// Ensure this path is correct: assets/music/song.mp3
const audio = new Audio("assets/music/song.mp3");
audio.loop = true;

const musicToggle = document.getElementById("musicToggle");

musicToggle.onclick = () => {
  if (audio.paused) {
    audio.play().catch(err => console.log("Playback failed:", err));
    musicToggle.classList.remove("muted");
  } else {
    audio.pause();
    musicToggle.classList.add("muted");
  }
};

// --- FRAME CONFIG ---
const frames = [
  { src: "assets/frames/frame1.png", slots: [{ x: 9.5, y: 1.5, w: 85.0, h: 32.6 }, { x: 10.0, y: 34.3, w: 85.0, h: 32.6 }, { x: 10.0, y: 66.2, w: 85.0, h: 32.6 }] },
  { src: "assets/frames/frame2.png", slots: [{ x: 13.0, y: 8.0, w: 82.7, h: 42.0 }, { x: 13.0, y: 51.0, w: 82.7, h: 42.0 }] },
  { src: "assets/frames/frame3.png", slots: [{ x: 8.5, y: 34.0, w: 46.2, h: 30.0 }] },
  { src: "assets/frames/frame4.png", slots: [{ x: 11.0, y: 33.0, w: 33.0, h: 25.0 }, { x: 56.0, y: 33.0, w: 33.0, h: 25.0 }] }
];

let frameIndex = 0, shotIndex = 0, capturedImages = [];
let msgIndex = 1;

// --- NAVIGATION (No Refresh to keep music playing) ---
document.getElementById("btnStartBooth").onclick = async () => {
  document.getElementById("landingPage").classList.add("hidden");
  document.getElementById("photoSection").classList.remove("hidden");
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  camera.srcObject = stream;
  loadFrame();
};

document.getElementById("btnMessage").onclick = () => {
  document.getElementById("landingPage").classList.add("hidden");
  document.getElementById("messageSection").classList.remove("hidden");
};

document.querySelectorAll(".back-home-btn").forEach(btn => {
  btn.onclick = () => {
    document.getElementById("photoSection").classList.add("hidden");
    document.getElementById("messageSection").classList.add("hidden");
    document.getElementById("landingPage").classList.remove("hidden");
    if (camera.srcObject) { camera.srcObject.getTracks().forEach(t => t.stop()); }
  };
});

document.getElementById("nextMessage").onclick = () => {
  msgIndex = (msgIndex % 2) + 1;
  document.getElementById("messageImage").src = `assets/messages/birthdaymsg${msgIndex}.png`;
};

// --- BOOTH LOGIC ---
function updateCameraPosition() {
  const currentSlots = frames[frameIndex].slots;
  if (shotIndex >= currentSlots.length) { camera.style.opacity = "0"; return; }
  const slot = currentSlots[shotIndex];
  camera.style.opacity = "1";
  camera.style.left = slot.x + "%"; camera.style.top = slot.y + "%";
  camera.style.width = slot.w + "%"; camera.style.height = slot.h + "%";
}

function loadFrame() {
  frameOverlay.src = frames[frameIndex].src;
  shotIndex = 0; capturedImages = [];
  photoPreviewContainer.innerHTML = ""; 
  updateCameraPosition();
}

document.getElementById("prevFrame").onclick = () => { frameIndex = (frameIndex - 1 + frames.length) % frames.length; loadFrame(); };
document.getElementById("nextFrame").onclick = () => { frameIndex = (frameIndex + 1) % frames.length; loadFrame(); };
document.getElementById("resetBtn").onclick = () => loadFrame();

document.getElementById("captureBtn").onclick = () => {
  const currentSlots = frames[frameIndex].slots;
  if (shotIndex >= currentSlots.length) return;
  let count = 3; countdownEl.textContent = count;
  const timer = setInterval(() => {
    count--;
    if (count === 0) {
      clearInterval(timer); countdownEl.textContent = "";
      const canvas = document.createElement("canvas");
      canvas.width = camera.videoWidth; canvas.height = camera.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
      ctx.drawImage(camera, 0, 0);
      const photoData = canvas.toDataURL("image/png");
      capturedImages.push(photoData);

      const slot = currentSlots[shotIndex];
      const img = document.createElement("img");
      img.src = photoData; img.className = "captured-slot-photo";
      img.style.left = slot.x + "%"; img.style.top = slot.y + "%";
      img.style.width = slot.w + "%"; img.style.height = slot.h + "%";
      photoPreviewContainer.appendChild(img);
      shotIndex++; updateCameraPosition();
    } else { countdownEl.textContent = count; }
  }, 1000);
};

// --- DOWNLOAD ---
document.getElementById("downloadBtn").onclick = () => {
  if (capturedImages.length === 0) return;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const frameImg = new Image();
  frameImg.src = frames[frameIndex].src;
  frameImg.onload = () => {
    canvas.width = frameImg.naturalWidth; canvas.height = frameImg.naturalHeight;
    let loaded = 0;
    capturedImages.forEach((data, i) => {
      const img = new Image();
      img.src = data;
      img.onload = () => {
        const s = frames[frameIndex].slots[i];
        const targetW = (s.w / 100) * canvas.width, targetH = (s.h / 100) * canvas.height;
        const targetX = (s.x / 100) * canvas.width, targetY = (s.y / 100) * canvas.height;
        const imgRatio = img.width / img.height, targetRatio = targetW / targetH;
        let sx, sy, sw, sh;
        if (imgRatio > targetRatio) { sh = img.height; sw = img.height * targetRatio; sx = (img.width - sw) / 2; sy = 0; }
        else { sw = img.width; sh = img.width / targetRatio; sx = 0; sy = (img.height - sh) / 2; }
        ctx.drawImage(img, sx, sy, sw, sh, targetX, targetY, targetW, targetH);
        loaded++;
        if (loaded === capturedImages.length) {
          ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
          const a = document.createElement("a");
          a.download = "HappyBirthdayBooth.png";
          a.href = canvas.toDataURL("image/png", 1.0);
          a.click();
        }
      };
    });
  };
};
