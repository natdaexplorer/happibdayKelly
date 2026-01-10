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

const messages = [
  "assets/messages/birthdaymsg1.png",
  "assets/messages/birthdaymsg2.png"
];

const frames = [
  { src: "assets/frames/frame1.png", slots: 3 },
  { src: "assets/frames/frame2.png", slots: 2 },
  { src: "assets/frames/frame3.png", slots: 1 },
  { src: "assets/frames/frame4.png", slots: 1 }
];

let messageIndex = 0;
let frameIndex = 0;
let shotIndex = 0;

/* MODE SWITCH */
btnMessage.onclick = () => {
  messageSection.classList.remove("hidden");
  photoSection.classList.add("hidden");
};

btnPhoto.onclick = async () => {
  messageSection.classList.add("hidden");
  photoSection.classList.remove("hidden");
  await navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => camera.srcObject = stream);
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
};

/* CAPTURE */
captureBtn.onclick = () => {
  if (shotIndex >= frames[frameIndex].slots) return;

  let count = 3;
  countdownEl.textContent = count;

  const timer = setInterval(() => {
    count--;
    if (count === 0) {
      clearInterval(timer);
      countdownEl.textContent = "";
      shotIndex++;
    } else {
      countdownEl.textContent = count;
    }
  }, 1000);
};

/* DOWNLOAD */
downloadBtn.onclick = () => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  canvas.width = camera.videoWidth;
  canvas.height = camera.videoHeight;

  ctx.drawImage(camera, 0, 0);
  const frameImg = new Image();
  frameImg.src = frames[frameIndex].src;
  frameImg.onload = () => {
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);
    const a = document.createElement("a");
    a.download = "photo.png";
    a.href = canvas.toDataURL();
    a.click();
  };
};
