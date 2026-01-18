// 1. Setup Elements
const camera = document.getElementById("camera");
const frameOverlay = document.getElementById("frameOverlay");
const countdownEl = document.getElementById("countdown");
const frameCounter = document.getElementById("frameCounter");
const photoPreviewContainer = document.getElementById("photoPreviewContainer");

// 2. Final Data Structure with your measured coordinates
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
    slots: [
      { x: 13.0, y: 8.0, w: 82.7, h: 42.0 }, 
      { x: 13.0, y: 51.0, w: 82.7, h: 42.0 }
    ] 
  },
  { 
    src: "assets/frames/frame3.png", 
    slots: [
      { x: 8.5, y: 34.0, w: 46.2, h: 30.0 }
    ] 
  },
  { 
    src: "assets/frames/frame4.png", 
    slots: [
      { x: 11.0, y: 20.0, w: 33.0, h: 25.0 }, // Left Slot
      { x: 56.0, y: 33.0, w: 33.0, h: 25.0 }  // Right Slot
    ] 
  }
];

let frameIndex = 0;
let shotIndex = 0;
let capturedImages = [];

// 3. Navigation & Camera Initialization
document.getElementById("btnStartBooth").onclick = async () => {
  document.getElementById("landingPage").classList.add("hidden");
  document.getElementById("photoSection").classList.remove("hidden");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { width: { ideal: 1280 }, height: { ideal: 720 } } 
    });
    camera.srcObject = stream;
    loadFrame();
  } catch (err) {
    alert("Camera access denied. Please check browser permissions.");
  }
};

document.querySelectorAll(".back-home-btn").forEach(btn => {
  btn.onclick = () => location.reload();
});

// 4. Core Positioning Logic
function updateCameraPosition() {
  const currentSlots = frames[frameIndex].slots;
  
  if (shotIndex >= currentSlots.length) {
    camera.style.opacity = "0"; // Hide camera when shots are finished
    return;
  }

  const slot = currentSlots[shotIndex];
  camera.style.opacity = "1";
  camera.style.left = slot.x + "%";
  camera.style.top = slot.y + "%";
  camera.style.width = slot.w + "%";
  camera.style.height = slot.h + "%";
}

function loadFrame() {
  frameOverlay.src = frames[frameIndex].src;
  frameCounter.textContent = frameIndex + 1;
  shotIndex = 0;
  capturedImages = [];
  photoPreviewContainer.innerHTML = ""; 
  updateCameraPosition();
}

document.getElementById("prevFrame").onclick = () => {
  frameIndex = (frameIndex - 1 + frames.length) % frames.length;
  loadFrame();
};

document.getElementById("nextFrame").onclick = () => {
  frameIndex = (frameIndex + 1) % frames.length;
  loadFrame();
};

document.getElementById("resetBtn").onclick = () => loadFrame();

// 5. Capture Logic
document.getElementById("captureBtn").onclick = () => {
  const currentSlots = frames[frameIndex].slots;
  if (shotIndex >= currentSlots.length) return alert("Frame is full! Reset to take more.");

  let count = 3;
  countdownEl.textContent = count;
  
  const timer = setInterval(() => {
    count--;
    if (count === 0) {
      clearInterval(timer);
      countdownEl.textContent = "";
      
      const canvas = document.createElement("canvas");
      canvas.width = camera.videoWidth;
      canvas.height = camera.videoHeight;
      const ctx = canvas.getContext("2d");
      
      // Mirror the capture for natural look
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(camera, 0, 0);
      
      const photoData = canvas.toDataURL("image/png");
      capturedImages.push(photoData);

      // Create Preview Image
      const slot = currentSlots[shotIndex];
      const img = document.createElement("img");
      img.src = photoData;
      img.className = "captured-slot-photo";
      img.style.left = slot.x + "%";
      img.style.top = slot.y + "%";
      img.style.width = slot.w + "%";
      img.style.height = slot.h + "%";
      
      photoPreviewContainer.appendChild(img);
      shotIndex++;
      updateCameraPosition();

      // Simple flash effect
      camera.style.filter = "brightness(3)";
      setTimeout(() => camera.style.filter = "none", 100);
    } else {
      countdownEl.textContent = count;
    }
  }, 1000);
};

// 6. Final Download/Save Logic
document.getElementById("downloadBtn").onclick = () => {
  if (capturedImages.length === 0) return alert("Take some photos first!");

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const frameImg = new Image();
  frameImg.src = frames[frameIndex].src;

  frameImg.onload = () => {
    canvas.width = frameImg.width;
    canvas.height = frameImg.height;

    let loadedCount = 0;
    capturedImages.forEach((data, i) => {
      const img = new Image();
      img.src = data;
      img.onload = () => {
        const s = frames[frameIndex].slots[i];
        const sw = (s.w / 100) * canvas.width;
        const sh = (s.h / 100) * canvas.height;
        const sx = (s.x / 100) * canvas.width;
        const sy = (s.y / 100) * canvas.height;

        // Aspect Ratio Fitting (Cover)
        const imgRatio = img.width / img.height;
        const slotRatio = sw / sh;
        let cx, cy, cw, ch;

        if (imgRatio > slotRatio) {
          cw = img.height * slotRatio; ch = img.height;
          cx = (img.width - cw) / 2; cy = 0;
        } else {
          cw = img.width; ch = img.width / slotRatio;
          cx = 0; cy = (img.height - ch) / 2;
        }

        ctx.drawImage(img, cx, cy, cw, ch, sx, sy, sw, sh);
        
        loadedCount++;
        if (loadedCount === capturedImages.length) {
          ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
          const link = document.createElement("a");
          link.download = `photobooth_${Date.now()}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        }
      };
    });
  };
};

// --- ARROW KEY DEBUGGER (For final tweaks) ---
window.addEventListener('keydown', (e) => {
  const currentSlots = frames[frameIndex].slots;
  const slot = currentSlots[shotIndex] || currentSlots[0];
  const step = 0.5;

  if (e.key === "ArrowUp")    slot.y -= step;
  if (e.key === "ArrowDown")  slot.y += step;
  if (e.key === "ArrowLeft")  slot.x -= step;
  if (e.key === "ArrowRight") slot.x += step;
  if (e.key.toLowerCase() === "w") slot.h += step;
  if (e.key.toLowerCase() === "s") slot.h -= step;
  if (e.key.toLowerCase() === "d") slot.w += step;
  if (e.key.toLowerCase() === "a") slot.w -= step;

  updateCameraPosition();
  console.log(`Current Slot: { x: ${slot.x.toFixed(1)}, y: ${slot.y.toFixed(1)}, w: ${slot.w.toFixed(1)}, h: ${slot.h.toFixed(1)} }`);
});
