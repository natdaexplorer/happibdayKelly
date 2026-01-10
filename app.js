// 1. Setup Elements
const landingPage = document.getElementById("landingPage");
const messageSection = document.getElementById("messageSection");
const photoSection = document.getElementById("photoSection");
const camera = document.getElementById("camera");
const frameOverlay = document.getElementById("frameOverlay");
const countdownEl = document.getElementById("countdown");
const frameCounter = document.getElementById("frameCounter");

// 2. Data Structures
const messages = ["assets/messages/birthdaymsg1.png", "assets/messages/birthdaymsg2.png"];

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
      { x: 6, y: 39.5, w: 54, h: 48 } // Precision fix for Canon screen
    ] 
  },
  { 
    src: "assets/frames/frame4.png", 
    slots: [
      { x: 21.5, y: 20, w: 57.5, h: 52 } // Precision fix for Polaroid
    ] 
  }
];

let messageIndex = 0;
let frameIndex = 0;
let shotIndex = 0;
let capturedImages = [];

// 3. Navigation
document.getElementById("btnMessage").onclick = () => {
  landingPage.classList.add("hidden");
  messageSection.classList.remove("hidden");
};

document.getElementById("btnStartBooth").onclick = async () => {
  landingPage.classList.add("hidden");
  photoSection.classList.remove("hidden");
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  camera.srcObject = stream;
  loadFrame();
};

document.querySelectorAll(".back-home-btn").forEach(btn => {
  btn.onclick = () => location.reload();
});

document.getElementById("nextMessage").onclick = () => {
  messageIndex = (messageIndex + 1) % messages.length;
  document.getElementById("messageImage").src = messages[messageIndex];
};

// 4. Frame Logic
function loadFrame() {
  frameOverlay.src = frames[frameIndex].src;
  frameCounter.textContent = frameIndex + 1;
  shotIndex = 0;
  capturedImages = [];
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
  if (shotIndex >= currentSlots.length) return alert("Frame full!");

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
      ctx.translate(canvas.width, 0); // Mirror fix
      ctx.scale(-1, 1);
      ctx.drawImage(camera, 0, 0);
      
      capturedImages.push(canvas.toDataURL("image/png"));
      shotIndex++;
      
      // Flash Effect
      camera.style.filter = "brightness(2)";
      setTimeout(() => camera.style.filter = "none", 100);
    } else {
      countdownEl.textContent = count;
    }
  }, 1000);
};

// 6. Download Logic
document.getElementById("downloadBtn").onclick = () => {
  if (capturedImages.length === 0) return alert("Take photos first!");

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const frameImg = new Image();
  frameImg.src = frames[frameIndex].src;

  frameImg.onload = () => {
    canvas.width = frameImg.width;
    canvas.height = frameImg.height;

    let loadedImages = 0;
    capturedImages.forEach((data, i) => {
      const img = new Image();
      img.src = data;
      img.onload = () => {
        const s = frames[frameIndex].slots[i];
        
        // --- SMART CROP CALCULATIONS ---
        const slotX = (s.x / 100) * canvas.width;
        const slotY = (s.y / 100) * canvas.height;
        const slotW = (s.w / 100) * canvas.width;
        const slotH = (s.h / 100) * canvas.height;

        const imgRatio = img.width / img.height;
        const slotRatio = slotW / slotH;

        let sourceX = 0, sourceY = 0, sourceW = img.width, sourceH = img.height;

        if (imgRatio > slotRatio) {
          // Photo is too wide - crop the sides
          sourceW = img.height * slotRatio;
          sourceX = (img.width - sourceW) / 2;
        } else {
          // Photo is too tall - crop the top/bottom
          sourceH = img.width / slotRatio;
          sourceY = (img.height - sourceH) / 2;
        }

        // Draw the cropped photo into the slot
        ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, slotX, slotY, slotW, slotH);
        
        loadedImages++;
        if (loadedImages === capturedImages.length) {
          // Draw frame last
          ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
          const link = document.createElement("a");
          link.download = `birthday-booth-${Date.now()}.png`;
          link.href = canvas.toDataURL("image/png");
          link.click();
        }
      };
    });
  };
};
