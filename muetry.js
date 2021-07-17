/** PHASE 1 - Setup **/

/**
 * I like working in degrees. 0 - 360. It's nice and human. Canvas likes
 * working in radians. Whatever the f*** they are. This converts degress
 * to radians using math found on stack overflow #noshame
 */
const rad = (deg) => (deg * Math.PI) / 180;

/**
 * This function will come in handy later when we want to pick random points
 * on an image. It returns a whole number between the min and max provided
 */
const random = (min, max) => Math.floor(Math.random() * (max - min) + min);

// This will be the radius of our kaleidoscope. Meaning the diameter will be double this #quickmaths
const RADIUS = 300;

// Think of this as the "size of pacman's mouth"
const SLICE_ANGLE = 30;

// Essentially we need to know the height of "pacman's mouth" (see dia. 1)
const SLICE_OPPOSITE_ANGLE = (180 - SLICE_ANGLE) / 2;
const SLICE_HEIGHT = RADIUS / (2 * Math.sin(rad(SLICE_OPPOSITE_ANGLE)));

/**
 * This preps each of the canvases we are going to use. All up there are 3
 * canvases. The first draws a wedge, the second inverts that wedge, and the third
 * draws and animates the full kaleidoscope
 */

// canvas 1 - wedge pattern - size of the area around pacman's mouth
const patternCanvas = document.getElementById("pattern");
const patternCtx = patternCanvas.getContext("2d");
patternCanvas.width = RADIUS;
patternCanvas.height = SLICE_HEIGHT;

// canvas 2 - inverted wedge pattern - size of the above canvas
const invPatternCanvas = document.getElementById("invPattern");
const invPatternCtx = invPatternCanvas.getContext("2d");
invPatternCanvas.width = patternCanvas.width;
invPatternCanvas.height = patternCanvas.height;

// canvas 3 - kaleidoscope - size of full circle
const kCanvas = document.getElementById("kaleidoscope");
const kCtx = kCanvas.getContext("2d");
kCanvas.width = RADIUS * 2;
kCanvas.height = RADIUS * 2;

/** PHASE 2 - Loading the image **/

/**
 * This second simply loads the image into memory then calls a function
 * once it's ready to go
 */
const img = new Image();
img.src = document.getElementById("image").src;
img.onload = () => {
  kaleidoscopeGo(img);
};

/** PHASE 3 - Drawing a wedge **/

/**
 * Okay, this is the first tricky bit. We are essentially drawing a section of
 * a circle, then filling it in with the image. Think of this section as filling in
 * pacman's mouth. See dia. 2 for a visual representation of what we are doing here.
 * The red line is the shape we are drawing, the blue box is the canvas we are drawing
 * on, and the circle is the size of the circle we are drawing.
 */
const drawWedge = (x, y, img) => {
  patternCtx.save();

  patternCtx.beginPath();
  patternCtx.moveTo(0, SLICE_HEIGHT / 2);

  const circlStart = rad(SLICE_ANGLE / -2);
  const circleStop = rad(SLICE_ANGLE / 2);
  patternCtx.arc(0, SLICE_HEIGHT / 2, RADIUS, circlStart, circleStop);

  // clip the current shape so the image fills inside it
  patternCtx.clip();
  // fill it with whatever is in the image at that x and y coord
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

/** PHASE 4 - Drawing an inverted wedge **/

/**
 * When we draw the kaleidoscope, each alternative slice of the circle is an
 * inverted version. We'll use a second canvas to invert the wedge we just drew
 */
const drawInverseWedge = () => {
  invPatternCtx.save();
  invPatternCtx.translate(0, SLICE_HEIGHT); // go to bottom left corner
  invPatternCtx.scale(1, -1); // flip the canvas vertically
  invPatternCtx.drawImage(patternCanvas, 0, 0); // draw the pattern canvas
  invPatternCtx.restore();
};

/** PHASE 5 - Drawing the full wheel **/

/**
 * With both the normal and inverted wedge drawn we can now fill in the full circle.
 * We go to the middle of the circle, then rotate, draw the normal wedge, rotate again,
 * draw the inverted wedge, and so on until the circle is full. See dia. 3
 */
const drawWheel = () => {
  kCtx.save();
  kCtx.translate(RADIUS, RADIUS); // go to middle

  for (let i = 0; i <= 360 / SLICE_ANGLE; i += 1) {
    kCtx.rotate(rad(SLICE_ANGLE));
    kCtx.drawImage(
      i % 2 ? patternCanvas : invPatternCanvas,
      0,
      SLICE_HEIGHT / -2
    );
  }


  kCtx.arc(0, 0, RADIUS - 2, 0, rad(360));
  kCtx.lineWidth = 2;
  kCtx.strokeStyle = "black";
  kCtx.stroke();

  kCtx.restore();
};

/** PHASE 6 - Animation helpers **/

/* Before each loop we need to wipe clean the canvases and start fresh */
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

const getQueryPoint1 = (query) => ({
  x: Number(query.get("x1")),
  y: Number(query.get("y1")),
});

const getQueryPoint2 = (query) => ({
  x: Number(query.get("x2")),
  y: Number(query.get("y2")),
});

/** PHASE 7 - Animation loop **/

/**
 * This is it folks. Here we pick a point and incrementally move towards it
 * each loop. Once we arrive we simply pick a new point and off we go again.
 * See dia. 5 for a visual representation of what is happening
 */
const kaleidoscopeGo = (img) => {
  const query = new URLSearchParams(location.search);
  const points = [getQueryPoint1(query), getQueryPoint2(query)];

  let counter = 0;
  let point = points[counter];
  let x = point.x;
  let y = point.y;

  const loop = () => {
    clearCanvases(); // wipe clean the canvases
    drawWedge(x, y, img); // draw the normal wedge
    drawInverseWedge(); // draw the inverted wedge
    drawWheel(); // draw the full circle

    const distanceX = point.x - x; // figure out how far away we are from
    const distanceY = point.y - y; // the target point

    if (distanceX === 0 && distanceY === 0) {
      counter = (counter + 1) % points.length;
      point = points[counter];
    } else {
      const length = Math.sqrt(distanceY * distanceY + distanceX * distanceX);
      x = Math.round(x + distanceX / length); // options: -1, 0, 1 in x direction
      y = Math.round(y + distanceY / length); // options: -1, 0, 1 in y direction
    }

    window.requestAnimationFrame(loop); // trigger the loop again
  };

  window.requestAnimationFrame(loop);
};
