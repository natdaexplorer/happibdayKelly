/* DOM ELEMENTS */
const messageSection = document.getElementById("messageSection");
const photoSection = document.getElementById("photoSection");
const btnMessage = document.getElementById("btnMessage");
const btnPhoto = document.getElementById("btnPhoto");
const messageImage = document.getElementById("messageImage");
const nextMessage = document.getElementById("nextMessage");
const camera = document.getElementById("camera");
const frameOverlay = document.getElementById("frameOverlay");
const countdownEl = document.getElementById("countdown");
const resetBtn = document.getElementById("resetBtn");
const captureBtn = document.getElementById("captureBtn");
const downloadBtn = document.getElementById("downloadBtn");
const prevFrame = document.getElementById("prevFrame");
const nextFrame = document.getElementById("nextFrame");
const frameCounter = document.getElementById("frameCounter");

/* DATA */
const messages = [
  "assets/messages/birthdaymsg1.png",
  "assets/messages/birthdaymsg2.png"
];

const frames = [
  { 
    src: "assets/frames/frame1.png", 
    slots: [
      { x: 10, y: 2, w: 80, h: 30 },
      { x: 10, y: 34, w: 80, h: 30 },
      { x: 10, y: 66, w: 80, h: 30 }
    ] 
  },
  { 
    src: "assets/frames/frame2.png", 
    slots: [
      { x: 14, y: 10, w: 72, h: 38 },
      { x: 14, y: 51, w: 72, h: 38 }
    ] 
  },
  { 
    src: "assets/frames/frame3.png", 
    slots: [{ x: 5, y: 38, w: 56, h: 50 }] 
  },
  { 
    src: "assets/frames/frame4.png", 
    slots: [{ x: 22, y: 21, w: 57, h: 51 }] 
  }
];

let messageIndex = 0;
let frameIndex = 0;
let shotIndex = 0;
let capturedImages = []; // Stores the photos taken

/* MODE SWITCH */
btnMessage.onclick = () => {
  messageSection.classList.remove("hidden");
  photoSection.classList.add("hidden");
};

btnPhoto.onclick = async () => {
  messageSection.classList.add("hidden");
  photoSection.classList.remove("hidden");
  const stream = await navigator.mediaDevices.getUserMedia({ video: true });
  camera.srcObject = stream;
  loadFrame();
};

/* MESSAGE SLIDER */
nextMessage.onclick = () => {
  messageIndex = (messageIndex + 1) % messages.length;
  messageImage.src = messages[messageIndex];
};

/* FRAME NAV */
function loadFrame() {
  frameOverlay.src = frames[frameIndex].src;
  frameCounter.textContent = frameIndex + 1;
  shotIndex = 0;
  capturedImages = []; // Clear photos when switching frames
}

prevFrame.onclick = () => {
  frameIndex = (frameIndex - 1 + frames.length) % frames.length;
  loadFrame();
};

nextFrame.onclick = () => {
  frameIndex = (frameIndex + 1) % frames.length;
  loadFrame();
};

/* RESET */
resetBtn.onclick = () => {
  shotIndex = 0;
  capturedImages = [];
  alert("Photos cleared! Start again.");
};

/* CAPTURE LOGIC (Keep ONLY this version) */
captureBtn.onclick = () => {
  const currentFrame = frames[frameIndex];
  
  if (shotIndex >= currentFrame.slots.length) {
    alert("Frame is full! Download or Reset.");
    return;
  }

  let count = 3;
  countdownEl.textContent = count;

  const timer = setInterval(() => {
    count--;
    if (count === 0) {
      clearInterval(timer);
      countdownEl.textContent = "";
      
      // Capture from video
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = camera.videoWidth;
      tempCanvas.height = camera.videoHeight;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.drawImage(camera, 0, 0);
      
      capturedImages.push(tempCanvas.toDataURL("image/png"));
      shotIndex++;
      
      // Visual feedback
      camera.style.filter = "brightness(2)";
      setTimeout(() => camera.style.filter = "none", 100);

    } else {
      countdownEl.textContent = count;
    }
  }, 1000);
};

/* DOWNLOAD LOGIC */
downloadBtn.onclick = () => {
  if (capturedImages.length === 0) {
    alert("Take some photos first!");
    return;
  }

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const frameImg = new Image();
  frameImg.src = frames[frameIndex].src;

  frameImg.onload = () => {
    canvas.width = frameImg.width;
    canvas.height = frameImg.height;

    const currentTemplate = frames[frameIndex];

    // Draw images into slots
    capturedImages.forEach((imgData, index) => {
      const slot = currentTemplate.slots[index];
      const photo = new Image();
      photo.src = imgData;
      
      // We wrap the draw in a timeout or promise if needed, 
      // but for simple dataURLs this usually works:
      photo.onload = () => {
          const destX = (slot.x / 100) * canvas.width;
          const destY = (slot.y / 100) * canvas.height;
          const destW = (slot.w / 100) * canvas.width;
          const destH = (slot.h / 100) * canvas.height;
          ctx.drawImage(photo, destX, destY, destW, destH);
          
          // Only draw frame after the LAST photo is drawn
          if (index === capturedImages.length - 1) {
              ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
              const a = document.createElement("a");
              a.download = `birthday-shot.png`;
              a.href = canvas.toDataURL("image/png");
              a.click();
          }
      };
    });
  };
};
