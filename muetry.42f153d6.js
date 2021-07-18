// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"av7D":[function(require,module,exports) {
/** PHASE 1 - Setup **/

/**
 * I like working in degrees. 0 - 360. It's nice and human. Canvas likes
 * working in radians. Whatever the f*** they are. This converts degress
 * to radians using math found on stack overflow #noshame
 */
var rad = function rad(deg) {
  return deg * Math.PI / 180;
};
/**
 * This function will come in handy later when we want to pick random points
 * on an image. It returns a whole number between the min and max provided
 */


var random = function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}; // This will be the radius of our kaleidoscope. Meaning the diameter will be double this #quickmaths


var RADIUS = 300; // Think of this as the "size of pacman's mouth"

var SLICE_ANGLE = 30; // Essentially we need to know the height of "pacman's mouth" (see dia. 1)

var SLICE_OPPOSITE_ANGLE = (180 - SLICE_ANGLE) / 2;
var SLICE_HEIGHT = RADIUS / (2 * Math.sin(rad(SLICE_OPPOSITE_ANGLE)));
/**
 * This preps each of the canvases we are going to use. All up there are 3
 * canvases. The first draws a wedge, the second inverts that wedge, and the third
 * draws and animates the full kaleidoscope
 */
// canvas 1 - wedge pattern - size of the area around pacman's mouth

var patternCanvas = document.getElementById("pattern");
var patternCtx = patternCanvas.getContext("2d");
patternCanvas.width = RADIUS;
patternCanvas.height = SLICE_HEIGHT; // canvas 2 - inverted wedge pattern - size of the above canvas

var invPatternCanvas = document.getElementById("invPattern");
var invPatternCtx = invPatternCanvas.getContext("2d");
invPatternCanvas.width = patternCanvas.width;
invPatternCanvas.height = patternCanvas.height; // canvas 3 - kaleidoscope - size of full circle

var kCanvas = document.getElementById("kaleidoscope");
var kCtx = kCanvas.getContext("2d");
kCanvas.width = RADIUS * 2;
kCanvas.height = RADIUS * 2;
/** PHASE 2 - Loading the image **/

/**
 * This second simply loads the image into memory then calls a function
 * once it's ready to go
 */

var img = new Image();
img.src = document.getElementById("image").src;

img.onload = function () {
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


var drawWedge = function drawWedge(x, y, img) {
  patternCtx.save();
  patternCtx.beginPath();
  patternCtx.moveTo(0, SLICE_HEIGHT / 2);
  var circlStart = rad(SLICE_ANGLE / -2) - 0.005;
  var circleStop = rad(SLICE_ANGLE / 2) + 0.005;
  patternCtx.arc(0, SLICE_HEIGHT / 2, RADIUS, circlStart, circleStop); // clip the current shape so the image fills inside it

  patternCtx.clip(); // fill it with whatever is in the image at that x and y coord

  patternCtx.drawImage(img, x, y, RADIUS, SLICE_HEIGHT, 0, 0, RADIUS, SLICE_HEIGHT);
  patternCtx.restore();
};
/** PHASE 4 - Drawing an inverted wedge **/

/**
 * When we draw the kaleidoscope, each alternative slice of the circle is an
 * inverted version. We'll use a second canvas to invert the wedge we just drew
 */


var drawInverseWedge = function drawInverseWedge() {
  invPatternCtx.save();
  invPatternCtx.beginPath();
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


var drawWheel = function drawWheel() {
  kCtx.save();
  kCtx.beginPath();
  kCtx.translate(RADIUS, RADIUS); // go to middle

  for (var i = 0; i <= 360 / SLICE_ANGLE; i += 1) {
    kCtx.rotate(rad(SLICE_ANGLE));
    kCtx.drawImage(i % 2 ? patternCanvas : invPatternCanvas, 0, SLICE_HEIGHT / -2);
  }

  kCtx.arc(0, 0, RADIUS - 2, rad(0), rad(360));
  kCtx.lineWidth = 2;
  kCtx.strokeStyle = "black";
  kCtx.stroke();
  kCtx.restore();
};
/** PHASE 6 - Animation helpers **/

/* Before each loop we need to wipe clean the canvases and start fresh */


var clearCanvases = function clearCanvases() {
  patternCtx.clearRect(0, 0, patternCanvas.width, patternCanvas.height);
  invPatternCtx.clearRect(0, 0, invPatternCanvas.width, invPatternCanvas.height);
  kCtx.clearRect(0, 0, kCanvas.width, kCanvas.height);
};

var getQueryPoint1 = function getQueryPoint1(query) {
  return {
    x: Number(query.get("x1")),
    y: Number(query.get("y1"))
  };
};

var getQueryPoint2 = function getQueryPoint2(query) {
  return {
    x: Number(query.get("x2")),
    y: Number(query.get("y2"))
  };
};
/** PHASE 7 - Animation loop **/

/**
 * This is it folks. Here we pick a point and incrementally move towards it
 * each loop. Once we arrive we simply pick a new point and off we go again.
 * See dia. 5 for a visual representation of what is happening
 */


var kaleidoscopeGo = function kaleidoscopeGo(img) {
  var query = new URLSearchParams(location.search);
  var points = [getQueryPoint1(query), getQueryPoint2(query)];
  var counter = 0;
  var point = points[counter];
  var x = point.x;
  var y = point.y;

  var loop = function loop() {
    clearCanvases(); // wipe clean the canvases

    drawWedge(x, y, img); // draw the normal wedge

    drawInverseWedge(); // draw the inverted wedge

    drawWheel(); // draw the full circle

    var distanceX = point.x - x; // figure out how far away we are from

    var distanceY = point.y - y; // the target point

    if (distanceX === 0 && distanceY === 0) {
      counter = (counter + 1) % points.length;
      point = points[counter];
    } else {
      var length = Math.sqrt(distanceY * distanceY + distanceX * distanceX);
      x = Math.round(x + distanceX / length); // options: -1, 0, 1 in x direction

      y = Math.round(y + distanceY / length); // options: -1, 0, 1 in y direction
    }

    window.requestAnimationFrame(loop); // trigger the loop again
  };

  window.requestAnimationFrame(loop);
};
},{}]},{},["av7D"], null)
//# sourceMappingURL=/kaleidoscope/muetry.42f153d6.js.map