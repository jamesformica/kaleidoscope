import guitars from './img/guitars.jpg'

const RADIUS = 300
const DIAMETER = RADIUS * 2
const SLICE = 30
const height = Math.abs(Math.sin(30 * Math.PI / 180) * RADIUS) + 10

const kCanvas = document.getElementById('kaleidoscope')
const kCtx = kCanvas.getContext('2d')

const imgCanvas = document.getElementById('image')
const imgCtx = imgCanvas.getContext('2d')

const patternCanvas = document.getElementById('pattern')
const patternCtx = patternCanvas.getContext('2d')
patternCanvas.width = RADIUS
patternCanvas.height = height

const invPatternCanvas = document.getElementById('invPattern')
const invPatternCtx = invPatternCanvas.getContext('2d')
invPatternCanvas.width = RADIUS
invPatternCanvas.height = height

const clearCanvas = (canvas, ctx) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

// Create an image element
var img = document.createElement('img');

// When the image is loaded, draw it

let rotate = 0
let x = 1200
let y = 2000

img.onload = function () {
  imgCanvas.width = img.width
  imgCanvas.height = img.height

  const letDoIt = () => {
    clearCanvas(imgCanvas, imgCtx)
    clearCanvas(patternCanvas, patternCtx);
    clearCanvas(invPatternCanvas, invPatternCtx);
    clearCanvas(kCanvas, kCtx);


    let degree = 345;
    const d1 = degree - 0.5
    const d2 = degree + SLICE + 0.5

    imgCtx.save()
    imgCtx.translate(img.width / 2, img.height / 2);
    imgCtx.rotate(rotate * Math.PI / 180);
    imgCtx.translate(img.width / -2, img.height / -2);
    imgCtx.drawImage(img, 0, 0)
    imgCtx.restore()


    patternCtx.save()
    patternCtx.beginPath();
    patternCtx.moveTo(0, height / 2);
    patternCtx.arc(0, height / 2, RADIUS, (360 - d2) * Math.PI / 180, (360 - d1) * Math.PI / 180);
    patternCtx.lineTo(0, height / 2);

    patternCtx.clip();
    patternCtx.drawImage(imgCanvas, x, y, RADIUS, height, 0, 0, RADIUS, height)

    patternCtx.restore()


    invPatternCtx.save()
    invPatternCtx.translate(0, height)
    invPatternCtx.scale(1, -1);
    invPatternCtx.drawImage(patternCanvas, 0, 0);
    invPatternCtx.restore()

    kCtx.save()
    kCtx.translate(RADIUS, RADIUS)
    for (let i = 0; i <= 12; i += 1) {
      kCtx.rotate(SLICE * Math.PI / 180);
      kCtx.drawImage(i % 2 ? patternCanvas : invPatternCanvas, 0, height / -2);
    }
    kCtx.restore()
    // kCtx.drawImage(patternCanvas, 0, 0);
    // kCtx.drawImage(patternCanvas, 300, 300 - height, 150, height, 0, 0, 150, height);

    x++
    // rotate = rotate + 0.05 % 360
    window.requestAnimationFrame(letDoIt)
  }

  window.requestAnimationFrame(letDoIt)
}

// Specify the src to load the image
img.src = guitars;