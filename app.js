const camera = document.getElementById("camera");
const frameOverlay = document.getElementById("frameOverlay");
const photoPreviewContainer = document.getElementById("photoPreviewContainer");
const countdownDisplay = document.getElementById("countdown");

// --- MUSIC ---
const audio = new Audio("assets/song.mp3"); 
audio.loop = true;
const musicToggle = document.getElementById("musicToggle");

musicToggle.onclick = () => {
  if (audio.paused) {
    musicToggle.classList.remove("muted");
    audio.play().catch(() => console.log("Site update pending..."));
  } else {
    audio.pause();
    musicToggle.classList.add("muted");
  }
};

// --- MESSAGES ---
const messages = ["assets/messages/birthdaymsg1.png", "assets/messages/birthdaymsg2.png"];
let msgIndex = 0;
document.getElementById("nextMessage").onclick = () => {
  msgIndex = (msgIndex + 1) % messages.length;
  document.getElementById("messageImage").src = messages[msgIndex];
};

// --- BOOTH ---
const frames = [
  { src: "assets/frames/frame1.png", slots: [{ x: 9.5, y: 1.5, w: 85, h: 32.6 }, { x: 10, y: 34.3, w: 85, h: 32.6 }, { x: 10, y: 66.2, w: 85, h: 32.6 }] },
  { src: "assets/frames/frame2.png", slots: [{ x: 13, y: 8, w: 82.7, h: 42 }, { x: 13, y: 51, w: 82.7, h: 42 }] },
  { src: "assets/frames/frame3.png", slots: [{ x: 8.5, y: 34, w: 46.2, h: 30 }] },
  { src: "assets/frames/frame4.png", slots: [{ x: 11, y: 33, w: 33, h: 25 }, { x: 56, y: 33, w: 33, h: 25 }] }
];

let frameIndex = 0, shotIndex = 0, capturedImages = [];

document.getElementById("btnStartBooth").onclick = async () => {
  document.getElementById("landingPage").classList.add("hidden");
  document.getElementById("photoSection").classList.remove("hidden");
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  camera.srcObject = stream;
  loadFrame();
};

function loadFrame() {
  frameOverlay.src = frames[frameIndex].src;
  shotIndex = 0; capturedImages = [];
  photoPreviewContainer.innerHTML = ""; 
  updateCameraPosition();
}

function updateCameraPosition() {
  const currentSlots = frames[frameIndex].slots;
  if (shotIndex >= currentSlots.length) { camera.style.opacity = "0"; return; }
  camera.style.opacity = "1";
  const slot = currentSlots[shotIndex];
  camera.style.left = slot.x + "%"; camera.style.top = slot.y + "%";
  camera.style.width = slot.w + "%"; camera.style.height = slot.h + "%";
}

document.getElementById("captureBtn").onclick = () => {
  if (shotIndex >= frames[frameIndex].slots.length) return;
  let count = 3;
  countdownDisplay.classList.remove("hidden");
  countdownDisplay.innerText = count;
  const timer = setInterval(() => {
    count--;
    if (count > 0) countdownDisplay.innerText = count;
    else { clearInterval(timer); countdownDisplay.classList.add("hidden"); takePhoto(); }
  }, 1000);
};

function takePhoto() {
  const canvas = document.createElement("canvas");
  canvas.width = camera.videoWidth; canvas.height = camera.videoHeight;
  const ctx = canvas.getContext("2d");
  ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
  ctx.drawImage(camera, 0, 0);
  const photoData = canvas.toDataURL("image/png");
  capturedImages.push(photoData);
  const slot = frames[frameIndex].slots[shotIndex];
  const img = document.createElement("img");
  img.src = photoData; img.className = "captured-slot-photo";
  img.style.left = slot.x + "%"; img.style.top = slot.y + "%";
  img.style.width = slot.w + "%"; img.style.height = slot.h + "%";
  photoPreviewContainer.appendChild(img);
  shotIndex++; updateCameraPosition();
}

document.getElementById("downloadBtn").onclick = () => {
  if (capturedImages.length === 0) return;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const fImg = new Image();
  fImg.src = frames[frameIndex].src;
  fImg.onload = () => {
    canvas.width = fImg.naturalWidth; canvas.height = fImg.naturalHeight;
    let loaded = 0;
    capturedImages.forEach((data, i) => {
      const img = new Image();
      img.src = data;
      img.onload = () => {
        const s = frames[frameIndex].slots[i];
        ctx.drawImage(img, 0, 0, img.width, img.height, (s.x/100)*canvas.width, (s.y/100)*canvas.height, (s.w/100)*canvas.width, (s.h/100)*canvas.height);
        if (++loaded === capturedImages.length) {
          ctx.drawImage(fImg, 0, 0, canvas.width, canvas.height);
          const a = document.createElement("a");
          a.download = "PhotoBooth.png"; a.href = canvas.toDataURL("image/png"); a.click();
        }
      };
    });
  };
};

document.getElementById("prevFrame").onclick = () => { frameIndex = (frameIndex - 1 + frames.length) % frames.length; loadFrame(); };
document.getElementById("nextFrame").onclick = () => { frameIndex = (frameIndex + 1) % frames.length; loadFrame(); };
document.getElementById("resetBtn").onclick = () => loadFrame();
document.querySelectorAll(".back-home-btn").forEach(btn => {
  btn.onclick = () => {
    document.getElementById("photoSection").classList.add("hidden");
    document.getElementById("messageSection").classList.add("hidden");
    document.getElementById("landingPage").classList.remove("hidden");
    if (camera.srcObject) camera.srcObject.getTracks().forEach(t => t.stop());
  };
});
document.getElementById("btnMessage").onclick = () => {
  document.getElementById("landingPage").classList.add("hidden");
  document.getElementById("messageSection").classList.remove("hidden");
};
