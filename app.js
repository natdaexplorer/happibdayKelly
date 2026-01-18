const camera = document.getElementById("camera");
const frameOverlay = document.getElementById("frameOverlay");
const photoPreviewContainer = document.getElementById("photoPreviewContainer");

// --- MUSIC LOGIC ---
const audio = new Audio("assets/assets/song.mp3"); 
audio.loop = true;

const musicToggle = document.getElementById("musicToggle");

musicToggle.onclick = () => {
  if (audio.paused) {
    musicToggle.classList.remove("muted");
    audio.play().catch(err => {
      console.error("Vercel deployment still pending.");
      musicToggle.classList.add("muted");
    });
  } else {
    audio.pause();
    musicToggle.classList.add("muted");
  }
};

// --- NAVIGATION & BOOTH ---
const frames = [
  { src: "assets/frames/frame1.png", slots: [{ x: 9.5, y: 1.5, w: 85.0, h: 32.6 }, { x: 10.0, y: 34.3, w: 85.0, h: 32.6 }, { x: 10.0, y: 66.2, w: 85.0, h: 32.6 }] },
  { src: "assets/frames/frame2.png", slots: [{ x: 13.0, y: 8.0, w: 82.7, h: 42.0 }, { x: 13.0, y: 51.0, w: 82.7, h: 42.0 }] },
  { src: "assets/frames/frame3.png", slots: [{ x: 8.5, y: 34.0, w: 46.2, h: 30.0 }] },
  { src: "assets/frames/frame4.png", slots: [{ x: 11.0, y: 33.0, w: 33.0, h: 25.0 }, { x: 56.0, y: 33.0, w: 33.0, h: 25.0 }] }
];

let frameIndex = 0, shotIndex = 0, capturedImages = [];

document.getElementById("btnStartBooth").onclick = async () => {
  document.getElementById("landingPage").classList.add("hidden");
  document.getElementById("photoSection").classList.remove("hidden");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    camera.srcObject = stream;
  } catch (e) { alert("Camera access denied."); }
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

document.getElementById("prevFrame").onclick = () => { frameIndex = (frameIndex - 1 + frames.length) % frames.length; loadFrame(); };
document.getElementById("nextFrame").onclick = () => { frameIndex = (frameIndex + 1) % frames.length; loadFrame(); };
document.getElementById("resetBtn").onclick = () => loadFrame();

document.getElementById("captureBtn").onclick = () => {
  const currentSlots = frames[frameIndex].slots;
  if (shotIndex >= currentSlots.length) return;
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
};

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
        ctx.drawImage(img, 0, 0, img.width, img.height, (s.x/100)*canvas.width, (s.y/100)*canvas.height, (s.w/100)*canvas.width, (s.h/100)*canvas.height);
        loaded++;
        if (loaded === capturedImages.length) {
          ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
          const a = document.createElement("a");
          a.download = "HappyBirthdayBooth.png"; a.href = canvas.toDataURL("image/png"); a.click();
        }
      };
    });
  };
};
