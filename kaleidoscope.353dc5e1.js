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
})({"Focm":[function(require,module,exports) {
var rad = function rad(deg) {
  return deg * Math.PI / 180;
};

var random = function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
};

var RADIUS = 300;
var SLICE_ANGLE = 30;
var SLICE_OPPOSITE_ANGLE = (180 - SLICE_ANGLE) / 2;
var SLICE_HEIGHT = RADIUS / (2 * Math.sin(rad(SLICE_OPPOSITE_ANGLE)));
var patternCanvas = document.getElementById("pattern");
var patternCtx = patternCanvas.getContext("2d");
patternCanvas.width = RADIUS;
patternCanvas.height = SLICE_HEIGHT;
var invPatternCanvas = document.getElementById("invPattern");
var invPatternCtx = invPatternCanvas.getContext("2d");
invPatternCanvas.width = patternCanvas.width;
invPatternCanvas.height = patternCanvas.height;
var kCanvas = document.getElementById("kaleidoscope");
var kCtx = kCanvas.getContext("2d");
kCanvas.width = RADIUS * 2;
kCanvas.height = RADIUS * 2;

var drawWedge = function drawWedge(x, y, img) {
  patternCtx.save();
  patternCtx.beginPath();
  patternCtx.moveTo(0, SLICE_HEIGHT / 2);
  var circlStart = rad(SLICE_ANGLE / -2) - 0.02;
  var circleStop = rad(SLICE_ANGLE / 2) + 0.02;
  patternCtx.arc(0, SLICE_HEIGHT / 2, RADIUS, circlStart, circleStop);
  patternCtx.clip();
  patternCtx.drawImage(img, x, y, RADIUS, SLICE_HEIGHT, 0, 0, RADIUS, SLICE_HEIGHT);
  patternCtx.restore();
};

var drawInverseWedge = function drawInverseWedge() {
  invPatternCtx.save();
  invPatternCtx.translate(0, SLICE_HEIGHT);
  invPatternCtx.scale(1, -1);
  invPatternCtx.drawImage(patternCanvas, 0, 0);
  invPatternCtx.restore();
};

var drawWheel = function drawWheel() {
  kCtx.save();
  kCtx.translate(RADIUS, RADIUS);

  for (var i = 0; i <= 360 / SLICE_ANGLE; i += 1) {
    kCtx.rotate(rad(SLICE_ANGLE));
    kCtx.drawImage(i % 2 ? patternCanvas : invPatternCanvas, 0, SLICE_HEIGHT / -2);
  }

  kCtx.restore();
};

var clearCanvases = function clearCanvases() {
  patternCtx.clearRect(0, 0, patternCanvas.width, patternCanvas.height);
  invPatternCtx.clearRect(0, 0, invPatternCanvas.width, invPatternCanvas.height);
  kCtx.clearRect(0, 0, kCanvas.width, kCanvas.height);
};

var selectPoint = function selectPoint(imgWidth, imgHeight) {
  var top = 0;
  var left = 0;
  var right = imgWidth - RADIUS;
  var bottom = imgHeight - SLICE_HEIGHT;
  return {
    x: random(left, right),
    y: random(top, bottom)
  };
};

var kaleidoscopeGo = function kaleidoscopeGo(img) {
  var point = selectPoint(img.width, img.height);
  var x = img.width / 2;
  var y = img.height / 2;

  var loop = function loop() {
    clearCanvases();
    drawWedge(x, y, img);
    drawInverseWedge();
    drawWheel();
    var distanceX = point.x - x;
    var distanceY = point.y - y;

    if (distanceX === 0 && distanceY === 0) {
      point = selectPoint(img.width, img.height);
    } else {
      var length = Math.sqrt(distanceY * distanceY + distanceX * distanceX);
      x = Math.round(x + distanceX / length);
      y = Math.round(y + distanceY / length);
    }

    window.requestAnimationFrame(loop);
  };

  window.requestAnimationFrame(loop);
};
/* SELECTING A SUPPLIED IMAGE */


var selectImage = function selectImage(e) {
  window.requestAnimationFrame(function () {
    var img = new Image();

    img.onload = function () {
      return kaleidoscopeGo(img);
    };

    img.src = e.target.src;
  });
};

var options = document.getElementsByClassName("optionImg");

for (var i = 0; i < options.length; i++) {
  options[i].onclick = selectImage;
}

document.getElementById("slowSpeed").onclick = function () {
  return speed = 0.5;
};

document.getElementById("fastSpeed").onclick = function () {
  return speed = 1;
};

var handleFiles = function handleFiles() {
  runState = false;
  var file = inputElement.files[0];
  var reader = new FileReader();

  reader.onload = function (e) {
    var img = new Image();

    img.onload = function () {
      return kaleidoscopeGo(img);
    };

    img.src = e.target.result;
  };

  reader.readAsDataURL(file);
};

var inputElement = document.getElementById("upload");
inputElement.addEventListener("change", handleFiles, false);
/* SELECTING THE FIRST IMAGE BY DEFAULT */

options[0].click();
},{}]},{},["Focm"], null)
//# sourceMappingURL=/kaleidoscope/kaleidoscope.353dc5e1.js.map