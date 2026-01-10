const frames = [
  { 
    src: "assets/frames/frame1.png", 
    slots: [
      { x: 10, y: 2, w: 80, h: 30 }, // Top Slot
      { x: 10, y: 34, w: 80, h: 30 }, // Middle Slot
      { x: 10, y: 66, w: 80, h: 30 }  // Bottom Slot
    ] 
  },
  { 
    src: "assets/frames/frame2.png", 
    slots: [
      { x: 14, y: 10, w: 72, h: 38 }, // Top Slot
      { x: 14, y: 51, w: 72, h: 38 }  // Bottom Slot
    ] 
  },
  { 
    src: "assets/frames/frame3.png", 
    slots: [
      { x: 5, y: 38, w: 56, h: 50 }   // Canon Screen
    ] 
  },
  { 
    src: "assets/frames/frame4.png", 
    slots: [
      { x: 22, y: 21, w: 57, h: 51 }  // Polaroid Center
    ] 
  }
];

// We need an array to store the "taken" photos
let capturedImages = []; 

/* UPDATED CAPTURE LOGIC */
captureBtn.onclick = () => {
  const currentFrame = frames[frameIndex];
  if (shotIndex >= currentFrame.slots.length) {
    alert("Frame is full! Reset to take more.");
    return;
  }

  let count = 3;
  countdownEl.textContent = count;

  const timer = setInterval(() => {
    count--;
    if (count === 0) {
      clearInterval(timer);
      countdownEl.textContent = "";
      
      // Capture the current frame from video
      const tempCanvas = document.createElement("canvas");
      tempCanvas.width = camera.videoWidth;
      tempCanvas.height = camera.videoHeight;
      const tempCtx = tempCanvas.getContext("2d");
      tempCtx.drawImage(camera, 0, 0);
      
      // Store the image data
      capturedImages.push(tempCanvas.toDataURL("image/png"));
      
      shotIndex++;
      // Optional: Add a visual "flash" effect here
    } else {
      countdownEl.textContent = count;
    }
  }, 1000);
};

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
  
  const frameImg = new Image();
  frameImg.src = frames[frameIndex].src;

  frameImg.onload = () => {
    // Set canvas to the size of the template
    canvas.width = frameImg.width;
    canvas.height = frameImg.height;

    const currentTemplate = frames[frameIndex];

    // 1. Draw the captured photos into their slots FIRST (Background)
    capturedImages.forEach((imgData, index) => {
      const slot = currentTemplate.slots[index];
      const photo = new Image();
      photo.src = imgData;
      
      // Convert percentage to actual pixels
      const destX = (slot.x / 100) * canvas.width;
      const destY = (slot.y / 100) * canvas.height;
      const destW = (slot.w / 100) * canvas.width;
      const destH = (slot.h / 100) * canvas.height;

      ctx.drawImage(photo, destX, destY, destW, destH);
    });

    // 2. Draw the frame OVER the photos (Foreground)
    ctx.drawImage(frameImg, 0, 0, canvas.width, canvas.height);

    // 3. Trigger Download
    const a = document.createElement("a");
    a.download = `photobooth-${Date.now()}.png`;
    a.href = canvas.toDataURL("image/png");
    a.click();
  };
};
