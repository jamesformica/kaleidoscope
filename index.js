const rad = (deg) => (deg * Math.PI) / 180;

const random = (min, max) => Math.floor(Math.random() * (max - min) + min);

const RADIUS = 300;
const SLICE_ANGLE = 30;

const SLICE_OPPOSITE_ANGLE = (180 - SLICE_ANGLE) / 2;
const SLICE_HEIGHT = RADIUS / (2 * Math.sin(rad(SLICE_OPPOSITE_ANGLE)));

const patternCanvas = document.getElementById("pattern");
const patternCtx = patternCanvas.getContext("2d");
patternCanvas.width = RADIUS;
patternCanvas.height = SLICE_HEIGHT;

const invPatternCanvas = document.getElementById("invPattern");
const invPatternCtx = invPatternCanvas.getContext("2d");
invPatternCanvas.width = patternCanvas.width;
invPatternCanvas.height = patternCanvas.height;

const kCanvas = document.getElementById("kaleidoscope");
const kCtx = kCanvas.getContext("2d");
kCanvas.width = RADIUS * 2;
kCanvas.height = RADIUS * 2;

const drawWedge = (x, y, img) => {
  patternCtx.save();

  patternCtx.beginPath();
  patternCtx.moveTo(0, SLICE_HEIGHT / 2);

  const circlStart = rad(SLICE_ANGLE / -2) - 0.005;
  const circleStop = rad(SLICE_ANGLE / 2) + 0.005;
  patternCtx.arc(0, SLICE_HEIGHT / 2, RADIUS, circlStart, circleStop);

  patternCtx.clip();
  patternCtx.drawImage(
    img,
    x,
    y,
    RADIUS,
    SLICE_HEIGHT,
    0,
    0,
    RADIUS,
    SLICE_HEIGHT
  );

  patternCtx.restore();
};


const drawInverseWedge = () => {
  invPatternCtx.save();
  invPatternCtx.beginPath();
  invPatternCtx.translate(0, SLICE_HEIGHT);
  invPatternCtx.scale(1, -1);
  invPatternCtx.drawImage(patternCanvas, 0, 0);
  invPatternCtx.restore();
};


const drawWheel = () => {
  kCtx.save();
  kCtx.beginPath();
  kCtx.translate(RADIUS, RADIUS);

  for (let i = 0; i <= 360 / SLICE_ANGLE; i += 1) {
    kCtx.rotate(rad(SLICE_ANGLE));
    kCtx.drawImage(
      i % 2 ? patternCanvas : invPatternCanvas,
      0,
      SLICE_HEIGHT / -2
    );
  }

  kCtx.restore();
};

const clearCanvases = () => {
  patternCtx.clearRect(0, 0, patternCanvas.width, patternCanvas.height);
  invPatternCtx.clearRect(
    0,
    0,
    invPatternCanvas.width,
    invPatternCanvas.height
  );
  kCtx.clearRect(0, 0, kCanvas.width, kCanvas.height);
};


const selectPoint = (imgWidth, imgHeight) => {
  const top = 0;
  const left = 0;
  const right = imgWidth - RADIUS;
  const bottom = imgHeight - SLICE_HEIGHT;

  return { x: random(left, right), y: random(top, bottom) };
};


const kaleidoscopeGo = (img) => {
  let point = selectPoint(img.width, img.height);
  let x = img.width / 2;
  let y = img.height / 2;

  const loop = () => {
    clearCanvases();
    drawWedge(x, y, img);
    drawInverseWedge();
    drawWheel();

    const distanceX = point.x - x;
    const distanceY = point.y - y;

    if (distanceX === 0 && distanceY === 0) {
      point = selectPoint(img.width, img.height);
    } else {
      const length = Math.sqrt(distanceY * distanceY + distanceX * distanceX);
      x = Math.round(x + distanceX / length);
      y = Math.round(y + distanceY / length);
    }

    window.requestAnimationFrame(loop);
  };

  window.requestAnimationFrame(loop);
};

/* SELECTING A SUPPLIED IMAGE */
const selectImage = (e) => {
  window.requestAnimationFrame(() => {
    const img = new Image();
    img.onload = () => kaleidoscopeGo(img);
    img.src = e.target.src;
  });
};

const options = document.getElementsByClassName("optionImg");

for (let i = 0; i < options.length; i++) {
  options[i].onclick = selectImage;
}

const handleFiles = () => {
  runState = false;

  const file = inputElement.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => kaleidoscopeGo(img);
    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
};

const inputElement = document.getElementById("upload");
inputElement.addEventListener("change", handleFiles, false);

/* SELECTING THE FIRST IMAGE BY DEFAULT */
options[0].click();
