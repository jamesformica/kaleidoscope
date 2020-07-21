let runState = false

const POINTS = 10
const RADIUS = 300
const SLICE = 30
const SLICE_HEIGHT = Math.abs(Math.sin(30 * Math.PI / 180) * RADIUS) + 10

const kCanvas = document.getElementById('kaleidoscope')
const kCtx = kCanvas.getContext('2d')

const patternCanvas = document.getElementById('pattern')
const patternCtx = patternCanvas.getContext('2d')
patternCanvas.width = RADIUS
patternCanvas.height = SLICE_HEIGHT

const invPatternCanvas = document.getElementById('invPattern')
const invPatternCtx = invPatternCanvas.getContext('2d')
invPatternCanvas.width = RADIUS
invPatternCanvas.height = SLICE_HEIGHT

const clearCanvas = (canvas, ctx) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

const clearCanvases = () => {
  clearCanvas(patternCanvas, patternCtx);
  clearCanvas(invPatternCanvas, invPatternCtx);
  clearCanvas(kCanvas, kCtx);
}

const drawWedge = (x, y, img) => {
  let degree = 345;
  const d1 = degree - 0.5
  const d2 = degree + SLICE + 0.2 // remove white seams

  patternCtx.save()

  // draw cheese wedge
  patternCtx.beginPath();
  patternCtx.moveTo(0, SLICE_HEIGHT / 2);
  patternCtx.arc(0, SLICE_HEIGHT / 2, RADIUS, (360 - d2) * Math.PI / 180, (360 - d1) * Math.PI / 180);
  patternCtx.lineTo(0, SLICE_HEIGHT / 2);

  // crop image section into wedge
  patternCtx.clip();
  patternCtx.drawImage(img, x, y, RADIUS, SLICE_HEIGHT, 0, 0, RADIUS, SLICE_HEIGHT)
  patternCtx.restore()
}

const drawInverseWedge = () => {
  invPatternCtx.save()
  invPatternCtx.translate(0, SLICE_HEIGHT)
  invPatternCtx.scale(1, -1);
  invPatternCtx.drawImage(patternCanvas, 0, 0);
  invPatternCtx.restore()
}

const drawWheel = () => {
  kCtx.save()
  kCtx.translate(RADIUS, RADIUS)

  for (let i = 0; i <= 360 / SLICE; i += 1) {
    kCtx.rotate(SLICE * Math.PI / 180);
    kCtx.drawImage(i % 2 ? patternCanvas : invPatternCanvas, 0, SLICE_HEIGHT / -2);
  }

  kCtx.restore()
}

const random = (min, max) => Math.floor(Math.random() * (max - min) + min)

const selectPoints = (imgWidth, imgHeight) => {
  const top = SLICE_HEIGHT
  const left = 0
  const right = imgWidth - RADIUS
  const bottom = imgHeight - SLICE_HEIGHT

  const points = []

  for (let i = 0; i < POINTS; i += 1) {
    points.push({ x: random(left, right), y: random(top, bottom) })
  }

  return points
}

const nextPoint = (current, destination) => {
  if (current === destination) return 0
  if (current > destination) return -1
  return 1
}

let pointCounter = 1
let x = -1
let y = -1

const kaleidoscopeGo = img => {
  const points = selectPoints(img.width, img.height)

  x = points[0].x
  y = points[0].y

  let destinationPoint = points[1]

  const loop = () => {
    clearCanvases()
    drawWedge(x, y, img)
    drawInverseWedge()
    drawWheel()

    const distanceX = Math.abs(x - destinationPoint.x)
    const distanceY = Math.abs(y - destinationPoint.y)

    if (distanceX === 0 && distanceY === 0) {
      console.log('on to the next point')
      pointCounter = (pointCounter + 1) % POINTS
      destinationPoint = points[pointCounter]
    } else if (distanceX === distanceY) {
      x += nextPoint(x, destinationPoint.x)
      y += nextPoint(y, destinationPoint.y)
    } else if (distanceX > distanceY) {
      x += nextPoint(x, destinationPoint.x)
    } else {
      y += nextPoint(y, destinationPoint.y)
    }

    if (runState) {
      window.requestAnimationFrame(loop)
    } else {
      console.log('stopping')
    }
  }
  console.log('starting')
  runState = true;
  window.requestAnimationFrame(loop)
}

const selectImage = (e) => {
  console.log('about to stop')
  runState = false;

  window.requestAnimationFrame(() => {
    const img = new Image();
    img.onload = () => kaleidoscopeGo(img)
    img.src = e.target.src;
  })
}

const options = document.getElementsByClassName('optionImg')

for (let i = 0; i < options.length; i++) {
  options[i].onclick = selectImage
}

options[0].click()