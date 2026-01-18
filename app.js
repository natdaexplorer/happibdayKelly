// 1. Elements
const camera = document.getElementById("camera");
const frameOverlay = document.getElementById("frameOverlay");
const countdownEl = document.getElementById("countdown");
const frameCounter = document.getElementById("frameCounter");
const photoPreviewContainer = document.getElementById("photoPreviewContainer");

// 2. Data Structures
const frames = [
  { 
    src: "assets/frames/frame1.png", 
    slots: [
      { x: 9.5, y: 1.5, w: 85.0, h: 32.6 }, 
      { x: 10.0, y: 34.3, w: 85.0, h: 32.6 }, 
      { x: 10.0, y: 66.2, w: 85.0, h: 32.6 }
    ] 
  },
  { 
    src: "assets/frames/frame2.png", 
    slots: [{ x: 13, y: 8, w: 74, h: 39 }, { x: 13, y: 51, w: 74, h: 39 }] 
  },
  { 
    src: "assets/frames/frame3.png", 
    slots: [{ x: 6, y: 39.5, w: 54, h: 48 }] 
  },
  { 
    src: "assets/frames/frame4.png", 
    slots: [{ x: 21.5, y: 20, w: 57.5, h: 52 }] 
  }
];

let frameIndex = 0, shotIndex = 0, capturedImages = [];

// 3. Navigation
document.getElementById("btnStartBooth").onclick = async () => {
  document.getElementById("landingPage").classList.add("hidden");
  document.getElementById("photoSection").classList.remove("hidden");
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  camera.srcObject = stream;
  loadFrame();
};

document.querySelectorAll(".back-home-btn").forEach(btn => btn.onclick = () => location.reload());

// 4. Position Logic
function updateCameraPosition() {
  const currentSlots = frames[frameIndex].slots;
  if (shotIndex >= currentSlots.length) {
    camera.style.opacity = "0";
    return;
  }
  const slot = currentSlots[shotIndex];
  
  camera.style.opacity = "1";
  // Force percentages
  camera.style.setProperty('left', slot.x + "%", 'important');
  camera.style.setProperty('top', slot.y + "%", 'important');
  camera.style.setProperty('width', slot.w + "%", 'important');
  camera.style.setProperty('height', slot.h + "%", 'important');
  camera.style.objectFit = "cover"; 
}

function loadFrame() {
  frameOverlay.src = frames[frameIndex].src;
  frameCounter.textContent = frameIndex + 1;
  shotIndex = 0; capturedImages = [];
  photoPreviewContainer.innerHTML = ""; 
  updateCameraPosition();
}

document.getElementById("prevFrame").onclick = () => { frameIndex = (frameIndex - 1 + frames.length) % frames.length; loadFrame(); };
document.getElementById("nextFrame").onclick = () => { frameIndex = (frameIndex + 1) % frames.length; loadFrame(); };

// 5. Capture & Download (Standard Logic)
document.getElementById("captureBtn").onclick = () => {
  const currentSlots = frames[frameIndex].slots;
  if (shotIndex >= currentSlots.length) return;
  let count = 3;
  countdownEl.textContent = count;
  const timer = setInterval(() => {
    count--;
    if (count === 0) {
      clearInterval(timer);
      countdownEl.textContent = "";
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
      img.style.setProperty('left', slot.x + "%", 'important');
      img.style.setProperty('top', slot.y + "%", 'important');
      img.style.setProperty('width', slot.w + "%", 'important');
      img.style.setProperty('height', slot.h + "%", 'important');
      photoPreviewContainer.appendChild(img);
      shotIndex++;
      updateCameraPosition();
    } else { countdownEl.textContent = count; }
  }, 1000);
};

// --- 6. DEBUG COORDINATE FINDER ---
// Press Arrow Keys to move. Press W/S for Height, A/D for Width.
window.addEventListener('keydown', (e) => {
  const currentSlots = frames[frameIndex].slots;
  const slot = currentSlots[shotIndex] || currentSlots[0];
  const step = 0.2; // High precision movement

  if (e.key === "ArrowUp")    slot.y -= step;
  if (e.key === "ArrowDown")  slot.y += step;
  if (e.key === "ArrowLeft")  slot.x -= step;
  if (e.key === "ArrowRight") slot.x += step;
  if (e.key.toLowerCase() === "w") slot.h += step;
  if (e.key.toLowerCase() === "s") slot.h -= step;
  if (e.key.toLowerCase() === "d") slot.w += step;
  if (e.key.toLowerCase() === "a") slot.w -= step;

  updateCameraPosition();
  
  // LOGS TO CONSOLE: Press F12 to see the numbers
  console.log(`Frame ${frameIndex + 1}, Slot ${shotIndex + 1}: { x: ${slot.x.toFixed(1)}, y: ${slot.y.toFixed(1)}, w: ${slot.w.toFixed(1)}, h: ${slot.h.toFixed(1)} }`);
});
