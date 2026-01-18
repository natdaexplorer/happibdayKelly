const camera = document.getElementById("camera");
const frameOverlay = document.getElementById("frameOverlay");
const countdownEl = document.getElementById("countdown");
const frameCounter = document.getElementById("frameCounter");
const photoPreviewContainer = document.getElementById("photoPreviewContainer");

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

// Navigation
document.getElementById("btnStartBooth").onclick = async () => {
  document.getElementById("landingPage").classList.add("hidden");
  document.getElementById("photoSection").classList.remove("hidden");
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  camera.srcObject = stream;
  loadFrame();
};

document.querySelectorAll(".back-home-btn").forEach(btn => btn.onclick = () => location.reload());

function updateCameraPosition() {
  const currentSlots = frames[frameIndex].slots;
  if (shotIndex >= currentSlots.length) {
    camera.style.opacity = "0";
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
  shotIndex = 0; capturedImages = [];
  photoPreviewContainer.innerHTML = ""; 
  updateCameraPosition();
}

document.getElementById("prevFrame").onclick = () => { frameIndex = (frameIndex - 1 + frames.length) % frames.length; loadFrame(); };
document.getElementById("nextFrame").onclick = () => { frameIndex = (frameIndex + 1) % frames.length; loadFrame(); };

// Capture
document.getElementById("captureBtn").onclick = () => {
  const currentSlots = frames[frameIndex].slots;
  if (shotIndex >= currentSlots.length) return alert("Frame full!");

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
      img.style.left = slot.x + "%"; img.style.top = slot.y + "%";
      img.style.width = slot.w + "%"; img.style.height = slot.h + "%";
      photoPreviewContainer.appendChild(img);

      shotIndex++;
      updateCameraPosition();
    } else { countdownEl.textContent = count; }
  }, 1000);
};

// Download
document.getElementById("downloadBtn").onclick = () => {
  if (capturedImages.length === 0) return;
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const frameImg = new Image();
  frameImg.src = frames[frameIndex].src;
  frameImg.onload = () => {
    canvas.width = frameImg.width; canvas.height = frameImg.height;
    let loaded = 0;
    capturedImages.forEach((data, i) => {
      const img = new Image();
      img.src = data;
      img.onload = () => {
        const s = frames[frameIndex].slots[i];
        const sw = (s.w/100)*canvas.width, sh = (s.h/100)*canvas.height;
        const sx = (s.x/100)*canvas.width, sy = (s.y/100)*canvas.height;
        const imgRatio = img.width/img.height, slotRatio = sw/sh;
        let cx, cy, cw, ch;
        if (imgRatio > slotRatio) { cw = img.height*slotRatio; ch = img.height; cx = (img.width-cw)/2; cy = 0; }
        else { cw = img.width; ch = img.width/slotRatio; cx = 0; cy = (img.height-ch)/2; }
        ctx.drawImage(img, cx, cy, cw, ch, sx, sy, sw, sh);
        loaded++;
        if (loaded === capturedImages.length) {
          ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
          const a = document.createElement("a");
          a.download = "booth.png"; a.href = canvas.toDataURL(); a.click();
        }
      };
    });
  };
};
