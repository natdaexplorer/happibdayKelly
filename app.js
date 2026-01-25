const camera = document.getElementById("camera");
const frameOverlay = document.getElementById("frameOverlay");
const photoPreviewContainer = document.getElementById("photoPreviewContainer");

// --- MUSIC LOGIC ---
const audio = new Audio("assets/song.mp3"); 
audio.loop = true;
const musicToggle = document.getElementById("musicToggle");

musicToggle.onclick = () => {
  if (audio.paused) {
    musicToggle.classList.remove("muted");
    audio.play().catch(err => console.log("Vercel update pending..."));
  } else {
    audio.pause();
    musicToggle.classList.add("muted");
  }
};

// --- MESSAGE NAVIGATION ---
const messages = ["assets/messages/birthdaymsg1.png", "assets/messages/birthdaymsg2.png"];
let msgIndex = 0;
document.getElementById("nextMessage").onclick = () => {
  msgIndex = (msgIndex + 1) % messages.length;
  document.getElementById("messageImage").src = messages[msgIndex];
};

// --- BOOTH LOGIC ---
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
  img.src = photoData;
  img.className = "captured-slot-photo";
  img.style.left = slot.x + "%"; img.style.top = slot.y + "%";
  img.style.width = slot.w + "%"; img.style.height = slot.h + "%";
  
  photoPreviewContainer.appendChild(img);
  shotIndex++; 
  updateCameraPosition();
};

// ... (Rest of navigation and download logic remains the same)
