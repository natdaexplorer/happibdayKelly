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
  { src: "assets/frames/frame1.png", slots: [{x:10,y:2,w:80,h:30},{x:10,y:34,w:80,h:30},{x:10,y:66,w:80,h:30}] },
  { src: "assets/frames/frame2.png", slots: [{x:14,y:10,w:72,h:38},{x:14,y:51,w:72,h:38}] },
  { src: "assets/frames/frame3.png", slots: [{x:5,y:38,w:56,h:50}] },
  { src: "assets/frames/frame4.png", slots: [{x:22,y:21,w:57,h:51}] }
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

    let loadedCount = 0;
    capturedImages.forEach((data, i) => {
      const img = new Image();
      img.src = data;
      img.onload = () => {
        const s = frames[frameIndex].slots[i];
        ctx.drawImage(img, (s.x/100)*canvas.width, (s.y/100)*canvas.height, (s.w/100)*canvas.width, (s.h/100)*canvas.height);
        loadedCount++;
        if (loadedCount === capturedImages.length) {
          ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
          const link = document.createElement("a");
          link.download = "birthday-photo.png";
          link.href = canvas.toDataURL();
          link.click();
        }
      };
    });
  };
};
