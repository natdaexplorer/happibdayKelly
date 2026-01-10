// 1. Setup Elements
const landingPage = document.getElementById("landingPage");
const messageSection = document.getElementById("messageSection");
const photoSection = document.getElementById("photoSection");
const camera = document.getElementById("camera");
const frameOverlay = document.getElementById("frameOverlay");
const countdownEl = document.getElementById("countdown");
const frameCounter = document.getElementById("frameCounter");
const photoPreviewContainer = document.getElementById("photoPreviewContainer");

// 2. Data Structures
const messages = [
  "assets/messages/birthdaymsg1.png", 
  "assets/messages/birthdaymsg2.png"
];

const frames = [
  { 
    src: "assets/frames/frame1.png", 
    slots: [
      { x: 10.5, y: 3.5, w: 79, h: 29 }, 
      { x: 10.5, y: 34.8, w: 79, h: 29 }, 
      { x: 10.5, y: 66.2, w: 79, h: 29 }
    ] 
  },
  { 
    src: "assets/frames/frame2.png", 
    slots: [
      { x: 13, y: 8, w: 74, h: 39 }, 
      { x: 13, y: 51, w: 74, h: 39 }
    ] 
  },
  { 
    src: "assets/frames/frame3.png", 
    slots: [
      { x: 6, y: 39.5, w: 54, h: 48 }
    ] 
  },
  { 
    src: "assets/frames/frame4.png", 
    slots: [
      { x: 21.5, y: 20, w: 57.5, h: 52 }
    ] 
  }
];

let messageIndex = 0;
let frameIndex = 0;
let shotIndex = 0;
let capturedImages = [];

// 3. Navigation Logic
document.getElementById("btnMessage").onclick = () => {
  landingPage.classList.add("hidden");
  messageSection.classList.remove("hidden");
};

document.getElementById("btnStartBooth").onclick = async () => {
  landingPage.classList.add("hidden");
  photoSection.classList.remove("hidden");
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ 
      video: { width: { ideal: 1280 }, height: { ideal: 720 } } 
    });
    camera.srcObject = stream;
    loadFrame();
  } catch (err) {
    alert("Camera access denied or not found.");
  }
};

document.querySelectorAll(".back-home-btn").forEach(btn => {
  btn.onclick = () => location.reload();
});

document.getElementById("nextMessage").onclick = () => {
  messageIndex = (messageIndex + 1) % messages.length;
  document.getElementById("messageImage").src = messages[messageIndex];
};

// 4. Booth Logic (Camera Positioning)
function updateCameraPosition() {
  const currentSlots = frames[frameIndex].slots;
  
  if (shotIndex >= currentSlots.length) {
    camera.style.opacity = "0"; // Hide camera when all shots are taken
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
  if (shotIndex >= currentSlots.length) return alert("Frame full! Please reset.");

  let count = 3;
  countdownEl.textContent = count;
  
  const timer = setInterval(() => {
    count--;
    if (count === 0) {
      clearInterval(timer);
      countdownEl.textContent = "";
      
      // Capture from video
      const canvas = document.createElement("canvas");
      canvas.width = camera.videoWidth;
      canvas.height = camera.videoHeight;
      const ctx = canvas.getContext("2d");
      
      // Mirror the capture
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(camera, 0, 0);
      
      const photoData = canvas.toDataURL("image/png");
      capturedImages.push(photoData);

      // Create preview element
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

      // Flash Effect
      camera.style.filter = "brightness(3)";
      setTimeout(() => camera.style.filter = "none", 100);
    } else {
      countdownEl.textContent = count;
    }
  }, 1000);
};

// 6. Download Logic
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

        // Smart Crop (Cover)
        const imgRatio = img.width / img.height;
        const slotRatio = sw / sh;
        let cx, cy, cw, ch;

        if (imgRatio > slotRatio) {
          cw = img.height * slotRatio;
          ch = img.height;
          cx = (img.width - cw) / 2;
          cy = 0;
        } else {
          cw = img.width;
          ch = img.width / slotRatio;
          cx = 0;
          cy = (img.height - ch) / 2;
        }

        ctx.drawImage(img, cx, cy, cw, ch, sx, sy, sw, sh);
        
        loadedCount++;
        if (loadedCount === capturedImages.length) {
          // Draw frame on top last
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
