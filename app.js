// Navigation
const messageSection = document.getElementById("messageSection");
const photoSection = document.getElementById("photoSection");

document.getElementById("btnMessage").onclick = () => {
  messageSection.classList.add("active");
  photoSection.classList.remove("active");
};

document.getElementById("btnPhoto").onclick = () => {
  photoSection.classList.add("active");
  messageSection.classList.remove("active");
};

// Birthday messages
const messages = [
  "assets/messages/birthdaymsg1.png",
  "assets/messages/birthdaymsg2.png"
];
let msgIndex = 0;

document.getElementById("nextMessage").onclick = () => {
  msgIndex = (msgIndex + 1) % messages.length;
  document.getElementById("messageImage").src = messages[msgIndex];
};

// Camera
const video = document.getElementById("camera");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const frameOverlay = document.getElementById("frameOverlay");

navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" } })
  .then(stream => video.srcObject = stream);

// Countdown photo
document.getElementById("countdownBtn").onclick = () => {
  setTimeout(takePhoto, 3000);
};

function takePhoto() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  ctx.drawImage(video, 0, 0);
  ctx.drawImage(frameOverlay, 0, 0, canvas.width, canvas.height);
}

// Reset
document.getElementById("resetBtn").onclick = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
};

// Download
document.getElementById("downloadBtn").onclick = () => {
  const link = document.createElement("a");
  link.download = "birthday_photo.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
};

// Frame switching
document.querySelectorAll(".frameSelector img").forEach(img => {
  img.onclick = () => {
    frameOverlay.src = "assets/frames/" + img.dataset.frame;
  };
});
