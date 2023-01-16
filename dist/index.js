require("./index.css");
var $49SJR$swchelperslib_async_to_generatorjs = require("@swc/helpers/lib/_async_to_generator.js");
var $49SJR$swchelperslib_class_call_checkjs = require("@swc/helpers/lib/_class_call_check.js");
var $49SJR$swchelperslib_create_classjs = require("@swc/helpers/lib/_create_class.js");
var $49SJR$swchelperslib_define_propertyjs = require("@swc/helpers/lib/_define_property.js");
var $49SJR$swchelperslib_object_spreadjs = require("@swc/helpers/lib/_object_spread.js");
var $49SJR$swchelperslib_sliced_to_arrayjs = require("@swc/helpers/lib/_sliced_to_array.js");
var $49SJR$swchelperslib_ts_generatorjs = require("@swc/helpers/lib/_ts_generator.js");
var $49SJR$magentamusic = require("@magenta/music");
var $49SJR$tone = require("tone");
var $49SJR$assert = require("assert");
var $49SJR$swchelperslib_to_consumable_arrayjs = require("@swc/helpers/lib/_to_consumable_array.js");

function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}
function $parcel$exportWildcard(dest, source) {
  Object.keys(source).forEach(function(key) {
    if (key === 'default' || key === '__esModule' || dest.hasOwnProperty(key)) {
      return;
    }

    Object.defineProperty(dest, key, {
      enumerable: true,
      get: function get() {
        return source[key];
      }
    });
  });

  return dest;
}
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}
function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}

$parcel$defineInteropFlag(module.exports);

$parcel$export(module.exports, "default", function () { return $8762181023e429c8$export$2e2bcd8739ae039; });
var $df410cf7d5f8b9de$exports = {};

$parcel$defineInteropFlag($df410cf7d5f8b9de$exports);

$parcel$export($df410cf7d5f8b9de$exports, "defaultOptions", function () { return $df410cf7d5f8b9de$export$ba43bf67f3d48107; });
$parcel$export($df410cf7d5f8b9de$exports, "default", function () { return $df410cf7d5f8b9de$export$2e2bcd8739ae039; });
/* eslint-disable no-console */ 









var $e23a394c8f7de312$exports = {};

$parcel$export($e23a394c8f7de312$exports, "pane", function () { return $e23a394c8f7de312$export$6dff30574f79a202; }, function (v) { return $e23a394c8f7de312$export$6dff30574f79a202 = v; });
var $e23a394c8f7de312$export$6dff30574f79a202;
$e23a394c8f7de312$export$6dff30574f79a202 = "FC48wq_pane";


function $aba086a96c3a6af4$export$79263550b33b988b(pe, elem) {
    var _elem_getBoundingClientRect = elem.getBoundingClientRect(), left = _elem_getBoundingClientRect.left, top = _elem_getBoundingClientRect.top, width = _elem_getBoundingClientRect.width, height = _elem_getBoundingClientRect.height;
    var x = pe.clientX - left;
    var y = pe.clientY - top;
    var relX = x / width;
    var relY = y / height;
    return {
        x: x,
        y: y,
        relX: relX,
        relY: relY,
        width: width,
        height: height
    };
}
function $aba086a96c3a6af4$export$cfd1427bc286eaca(points) {
    var tension = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0.5, isClosed = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false, numOfSegments = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 16;
    // convert to internal format
    var pts = new Array();
    points.forEach(function(param) {
        var x = param.x, y = param.y;
        return pts.push(x, y);
    });
    // The algorithm require a previous and next point to the actual point array.
    // Check if we will draw closed or open curve.
    // If closed, copy end points to beginning and first points to end
    // If open, duplicate first points to beginning, end points to end
    var firstPoint = points[0];
    var lastPoint = points[points.length - 1];
    if (isClosed) {
        pts.unshift(lastPoint.x, lastPoint.y);
        pts.unshift(lastPoint.x, lastPoint.y);
        pts.push(firstPoint.x, firstPoint.y);
    } else {
        pts.unshift(firstPoint.x, firstPoint.y); // copy 1. point and insert at beginning
        pts.push(lastPoint.x, lastPoint.y); // copy last point and append
    }
    // ok, lets start..
    var res = new Array();
    // 1. loop goes through point array
    // 2. loop goes through each segment between the 2 pts + 1e point before and after
    for(var i = 2; i < pts.length - 4; i += 2)for(var t = 0; t <= numOfSegments; t += 1){
        // calc tension vectors
        var t1x = (pts[i + 2] - pts[i - 2]) * tension;
        var t2x = (pts[i + 4] - pts[i]) * tension;
        var t1y = (pts[i + 3] - pts[i - 1]) * tension;
        var t2y = (pts[i + 5] - pts[i + 1]) * tension;
        // calc step
        var st = t / numOfSegments;
        // calc cardinals
        var c1 = 2 * Math.pow(st, 3) - 3 * Math.pow(st, 2) + 1;
        var c2 = -(2 * Math.pow(st, 3)) + 3 * Math.pow(st, 2);
        var c3 = Math.pow(st, 3) - 2 * Math.pow(st, 2) + st;
        var c4 = Math.pow(st, 3) - Math.pow(st, 2);
        // calc x and y cords with common control vectors
        var x = c1 * pts[i] + c2 * pts[i + 2] + c3 * t1x + c4 * t2x;
        var y = c1 * pts[i + 1] + c2 * pts[i + 3] + c3 * t1y + c4 * t2y;
        // store points in array
        res.push({
            x: x,
            y: y
        });
    }
    return res;
}







var $c2fcd35583ae7c6c$export$2e2bcd8739ae039 = /*#__PURE__*/ function() {
    "use strict";
    function Segments(size, defaultValueCallback) {
        (0, ($parcel$interopDefault($49SJR$swchelperslib_class_call_checkjs)))(this, Segments);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "segments", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "_size", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "defaultValueCallback", void 0);
        this.segments = [
            new Array(size).fill(undefined).map(defaultValueCallback)
        ];
        this._size = size;
        this.defaultValueCallback = defaultValueCallback;
    }
    (0, ($parcel$interopDefault($49SJR$swchelperslib_create_classjs)))(Segments, [
        {
            key: "size",
            get: function get() {
                return this._size;
            }
        },
        {
            key: "numSegments",
            get: function get() {
                return this.segments.length;
            }
        },
        {
            key: "findSegmentIndex",
            value: function findSegmentIndex(x) {
                var numElements = 0;
                var segmentIndex = 0;
                while(segmentIndex < this.segments.length && numElements + this.segments[segmentIndex].length <= x){
                    numElements += this.segments[segmentIndex].length;
                    segmentIndex += 1;
                }
                var indexInSegment = x - numElements;
                return {
                    segmentIndex: segmentIndex,
                    indexInSegment: indexInSegment
                };
            }
        },
        {
            key: "get",
            value: function get(x, defaultValue) {
                if (x < 0 || x >= this.size) return defaultValue !== null && defaultValue !== void 0 ? defaultValue : undefined; // out of range
                var _this_findSegmentIndex = this.findSegmentIndex(x), segmentIndex = _this_findSegmentIndex.segmentIndex, indexInSegment = _this_findSegmentIndex.indexInSegment;
                return this.segments[segmentIndex][indexInSegment];
            }
        },
        {
            key: "set",
            value: function set(x) {
                for(var _len = arguments.length, values = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++){
                    values[_key - 1] = arguments[_key];
                }
                if (x < 0 || x >= this.size) return; // out of range
                var _this_findSegmentIndex = this.findSegmentIndex(x), segmentIndex = _this_findSegmentIndex.segmentIndex, indexInSegment = _this_findSegmentIndex.indexInSegment;
                for(var i = 0; i < values.length; i += 1){
                    this.segments[segmentIndex][indexInSegment] = values[i];
                    indexInSegment += 1;
                    if (indexInSegment >= this.segments[segmentIndex].length) {
                        segmentIndex += 1;
                        indexInSegment = 0;
                    }
                    if (segmentIndex > this.segments.length) break;
                }
            }
        },
        {
            key: "getSegment",
            value: function getSegment(which) {
                return this.segments[which];
            }
        },
        {
            key: "getSegmentOf",
            value: function getSegmentOf(x) {
                var _this_findSegmentIndex = this.findSegmentIndex(x), segmentIndex = _this_findSegmentIndex.segmentIndex, indexInSegment = _this_findSegmentIndex.indexInSegment;
                return {
                    segment: (0, ($parcel$interopDefault($49SJR$swchelperslib_to_consumable_arrayjs)))(this.segments[segmentIndex]),
                    indexInSegment: indexInSegment
                };
            }
        },
        {
            key: "getAllSegments",
            value: function getAllSegments() {
                return this.segments.map(function(s) {
                    return (0, ($parcel$interopDefault($49SJR$swchelperslib_to_consumable_arrayjs)))(s);
                });
            }
        },
        {
            /**
     * Split segments before in front of x.
     * @param x
     */ key: "splitBefore",
            value: function splitBefore(x) {
                if (x < 0 || x >= this.size) return -1; // out of range
                if (x === 0) return 0;
                var _this_findSegmentIndex = this.findSegmentIndex(x), segmentIndex = _this_findSegmentIndex.segmentIndex, indexInSegment = _this_findSegmentIndex.indexInSegment;
                if (indexInSegment === 0) // a segment starts at x -> no split necessary
                return segmentIndex;
                var segment = this.segments[segmentIndex];
                var upper = segment.slice(indexInSegment);
                var lower = segment.slice(0, indexInSegment);
                this.segments.splice(segmentIndex, 1, lower, upper);
                return segmentIndex + 1;
            }
        },
        {
            key: "splitAfter",
            value: function splitAfter(x) {
                if (x < 0 || x >= this.size) return -1; // out of range
                if (x === this.size - 1) return this.size - 1;
                return this.splitBefore(x + 1) + 1;
            }
        },
        {
            /** Split segment before and after x.
     *
     * @param x The index of the element to put into an isolated segment.
     */ key: "isolate",
            value: function isolate(x) {
                this.splitAfter(x);
                return this.splitBefore(x);
            }
        },
        {
            key: "join1",
            value: function join1(x) {
                if (x <= 0 || x >= this.size) return -1; // out of range
                var _this_findSegmentIndex = this.findSegmentIndex(x), segmentIndex = _this_findSegmentIndex.segmentIndex, indexInSegment = _this_findSegmentIndex.indexInSegment;
                if (indexInSegment !== 0) this.joinSegments(segmentIndex);
                return segmentIndex;
            }
        },
        {
            key: "join2",
            value: function join2(x0, x1) {
                if (x0 > x1) {
                    var _this_join2 = (0, ($parcel$interopDefault($49SJR$swchelperslib_sliced_to_arrayjs)))(this.join2(x1, x0), 2), segmentIndex1 = _this_join2[0], segmentIndex0 = _this_join2[1];
                    return [
                        segmentIndex0,
                        segmentIndex1
                    ];
                }
                if (x1 < 0 || x0 >= this.size) return [
                    -1,
                    -1
                ];
                var clampedX0 = Math.min(this.size - 1, Math.max(x0, 0));
                var clampedX1 = Math.min(this.size - 1, Math.max(x1, 0));
                var _this_findSegmentIndex = this.findSegmentIndex(clampedX0), segmentIndex01 = _this_findSegmentIndex.segmentIndex;
                var _this_findSegmentIndex1 = this.findSegmentIndex(clampedX1), segmentIndex11 = _this_findSegmentIndex1.segmentIndex;
                for(var i = 0; i < segmentIndex11 - segmentIndex01; i += 1)this.joinSegments(segmentIndex01 + 1);
                return [
                    x0 < 0 ? -1 : segmentIndex01,
                    x1 >= this.size ? -1 : segmentIndex11
                ];
            }
        },
        {
            key: "join",
            value: function join(x0, x1) {
                return typeof x1 === "undefined" ? this.join1(x0) : this.join2(x0, x1);
            }
        },
        {
            /**
     * Join the segment with the one in front of it.
     *
     * @param segmentIndex The index of the segment to join with its predecessor.
     */ key: "joinSegments",
            value: function joinSegments(segmentIndex) {
                var _lower;
                if (segmentIndex <= 0 || segmentIndex >= this.numSegments) return -1;
                var lower = this.segments[segmentIndex - 1];
                var upper = this.segments[segmentIndex];
                this.segments.splice(segmentIndex, 1);
                (_lower = lower).push.apply(_lower, (0, ($parcel$interopDefault($49SJR$swchelperslib_to_consumable_arrayjs)))(upper));
                return segmentIndex - 1;
            }
        },
        {
            key: "resize",
            value: function resize(size) {
                if (size > this.size) {
                    var diff = size - this.size;
                    this.segments.push(new Array(diff).fill(0).map(this.defaultValueCallback));
                    this._size = size;
                } else if (size > 0 && size < this.size) {
                    this.splitBefore(size);
                    var segmentIndex = this.findSegmentIndex(size).segmentIndex;
                    this.segments.splice(segmentIndex);
                    this._size = size;
                }
            }
        }
    ]);
    return Segments;
}();


(0, $49SJR$magentamusic.tf).disableDeprecationWarnings();
var $df410cf7d5f8b9de$var$PIANO_GENIE_CHECKPOINT = "https://storage.googleapis.com/magentadata/js/checkpoints/piano_genie/model/epiano/stp_iq_auto_contour_dt_166006";
var $df410cf7d5f8b9de$var$LOWEST_PIANO_KEY_MIDI_NOTE = 21;
var $df410cf7d5f8b9de$var$NUM_BEATS = 16;
var $df410cf7d5f8b9de$var$NUM_BUTTONS = 8;
var $df410cf7d5f8b9de$var$exponentialEnvelopeCurve = "exponential";
var $df410cf7d5f8b9de$var$envelopeOptions = {
    attack: 0.01,
    attackCurve: $df410cf7d5f8b9de$var$exponentialEnvelopeCurve,
    decay: 0.01,
    decayCurve: $df410cf7d5f8b9de$var$exponentialEnvelopeCurve,
    release: 0.5,
    releaseCurve: $df410cf7d5f8b9de$var$exponentialEnvelopeCurve,
    sustain: 0.9
};
var $df410cf7d5f8b9de$var$SYNTH_OPTIONS = {
    volume: 0,
    detune: 0,
    portamento: 0,
    harmonicity: 2.5,
    oscillator: {
        phase: 0,
        type: "fatsawtooth",
        count: 3,
        spread: 20
    },
    envelope: {
        attack: 0.1,
        attackCurve: "linear",
        decay: 0.2,
        decayCurve: "exponential",
        release: 0.3,
        releaseCurve: "exponential",
        sustain: 0.2
    },
    modulation: {
        phase: 0,
        type: "square"
    },
    modulationEnvelope: {
        attack: 0.5,
        attackCurve: "linear",
        decay: 0.01,
        decayCurve: "exponential",
        release: 0.5,
        releaseCurve: "exponential",
        sustain: 1
    }
};
function $df410cf7d5f8b9de$var$computeAllowedPianoKeys(minMidiNote, maxMidiNote) {
    (0, $49SJR$assert.strict)(minMidiNote < maxMidiNote);
    var keyMin = Math.max(0, minMidiNote - $df410cf7d5f8b9de$var$LOWEST_PIANO_KEY_MIDI_NOTE);
    var maxKey = Math.min(maxMidiNote - $df410cf7d5f8b9de$var$LOWEST_PIANO_KEY_MIDI_NOTE, 87);
    var numKeys = Math.max(0, maxKey - keyMin + 1);
    var keys = new Array(numKeys).fill(0).map(function(_, i) {
        return keyMin + i;
    });
    console.log(keys);
    return keys;
}
var $df410cf7d5f8b9de$var$TEMPERATURE = 0.25;
var $df410cf7d5f8b9de$var$CANVAS_WIDTH = 512;
var $df410cf7d5f8b9de$var$CANVAS_HEIGHT = 256;
var $df410cf7d5f8b9de$export$ba43bf67f3d48107 = {};
var $df410cf7d5f8b9de$export$2e2bcd8739ae039 = /*#__PURE__*/ function() {
    "use strict";
    function SynthGenie(element) {
        var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
        (0, ($parcel$interopDefault($49SJR$swchelperslib_class_call_checkjs)))(this, SynthGenie);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "_options", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "handlers", this.getHandlers());
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "element", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "pane", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "pointers", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "canvas", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "context", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "segments", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "numNotes", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "position", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "loopCount", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "genie", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "gain", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "beatLength", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "relativeNoteLength", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "minMidiNote", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "maxMidiNote", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "allowedPianoKeys", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "resetStateOnLoop", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "sustainInSegments", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "slideInSegments", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "showGrid", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "showBar", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "dotColor", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "relativeDotSize", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "lineColor", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "relativeLineWidth", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "synthOptions", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "synthPool", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "synth", void 0);
        (0, ($parcel$interopDefault($49SJR$swchelperslib_define_propertyjs)))(this, "timer", void 0);
        console.log("Starting");
        this._options = (0, ($parcel$interopDefault($49SJR$swchelperslib_object_spreadjs)))({}, $df410cf7d5f8b9de$export$ba43bf67f3d48107, options);
        this.numNotes = $df410cf7d5f8b9de$var$NUM_BEATS;
        this.segments = new (0, $c2fcd35583ae7c6c$export$2e2bcd8739ae039)(this.numNotes, function() {
            return -1;
        });
        this.position = 0;
        this.loopCount = 0;
        this.resetStateOnLoop = true;
        this.sustainInSegments = true;
        this.slideInSegments = true;
        this.showGrid = true;
        this.showBar = true;
        this.beatLength = 250;
        this.relativeNoteLength = 1.0;
        this.minMidiNote = 21;
        this.maxMidiNote = 108;
        this.dotColor = "#2c2c2c";
        this.relativeDotSize = 0.0;
        this.lineColor = "#2c2c2c";
        this.relativeLineWidth = 0.6;
        this.allowedPianoKeys = $df410cf7d5f8b9de$var$computeAllowedPianoKeys(this.minMidiNote, this.maxMidiNote);
        console.log("Starting 2");
        var canvas = document.createElement("canvas");
        canvas.width = $df410cf7d5f8b9de$var$CANVAS_WIDTH;
        canvas.height = $df410cf7d5f8b9de$var$CANVAS_HEIGHT;
        var context = canvas.getContext("2d");
        (0, $49SJR$assert.strict)(context !== null);
        var pane = document.createElement("div");
        pane.setAttribute("touch-action", "none"); // for Pointer Events Polyfill
        pane.classList.add((0, (/*@__PURE__*/$parcel$interopDefault($e23a394c8f7de312$exports))).pane);
        pane.addEventListener("pointerdown", this.handlers.addPointer);
        pane.addEventListener("pointerup", this.handlers.removePointer);
        pane.addEventListener("pointercancel", this.handlers.removePointer);
        pane.addEventListener("contextmenu", function(event) {
            return event.preventDefault();
        });
        pane.appendChild(canvas);
        while(element.firstChild)element.firstChild.remove();
        element.appendChild(pane);
        this.pane = pane;
        this.element = element;
        this.canvas = canvas;
        this.context = context;
        this.pointers = new Map();
        this.genie = new (0, $49SJR$magentamusic.PianoGenie)($df410cf7d5f8b9de$var$PIANO_GENIE_CHECKPOINT);
        this.gain = new $49SJR$tone.Gain(1).toDestination();
        this.synthOptions = $df410cf7d5f8b9de$var$SYNTH_OPTIONS;
        this.synthPool = [];
        this.synth = null;
        this.timer = 0;
        this.updateGrid();
    }
    (0, ($parcel$interopDefault($49SJR$swchelperslib_create_classjs)))(SynthGenie, [
        {
            key: "play",
            value: function play() {
                var _this = this;
                if (this.timer === 0) {
                    var beatLength = this.beatLength;
                    this.timer = setTimeout(function() {
                        _this.timer = setInterval(function() {
                            return _this.playBeat();
                        }, beatLength);
                    }, 0);
                }
            }
        },
        {
            key: "pause",
            value: function pause() {
                if (this.timer !== 0) {
                    clearTimeout(this.timer);
                    clearInterval(this.timer);
                    this.timer = 0;
                    if (this.synth !== null) {
                        this.releaseAndFreeSynth(this.synth, 0);
                        this.synth = null;
                    }
                }
            }
        },
        {
            key: "isPlaying",
            value: function isPlaying() {
                return this.timer !== 0;
            }
        },
        {
            key: "playBeat",
            value: function playBeat() {
                var genie = this.genie;
                var _this_segments_getSegmentOf = this.segments.getSegmentOf(this.position), segment = _this_segments_getSegmentOf.segment, indexInSegment = _this_segments_getSegmentOf.indexInSegment;
                var cell = segment[indexInSegment];
                (0, $49SJR$assert.strict)(typeof cell !== "undefined");
                if (this.synth !== null && cell === -1) {
                    // note still ringing, but shouldn't (grid values changed)
                    this.releaseAndFreeSynth(this.synth, 0);
                    this.synth = null;
                }
                if (cell !== -1) {
                    var frequency = this.getGenieFrequency(cell);
                    var attack = this.synth === null || indexInSegment === 0 || !this.sustainInSegments;
                    var release = indexInSegment === segment.length - 1 || !this.sustainInSegments;
                    var _this_synth, _ref;
                    this.synth = (_ref = (_this_synth = this.synth) !== null && _this_synth !== void 0 ? _this_synth : this.synthPool.pop()) !== null && _ref !== void 0 ? _ref : this.createSynth();
                    var noteDuration = this.beatLength * this.relativeNoteLength / 1000;
                    if (attack || !this.slideInSegments) // attack
                    this.synth.triggerAttack(frequency);
                    else // ramp to next note frequency
                    this.synth.frequency.exponentialRampTo(frequency, noteDuration * 0.1);
                    if (release) {
                        // release note at the end of this cell
                        this.releaseAndFreeSynth(this.synth, noteDuration);
                        this.synth = null;
                    }
                }
                this.updateGrid();
                this.position += 1;
                if (this.position === this.segments.size) {
                    this.position = 0;
                    this.loopCount += 1;
                    if (this.resetStateOnLoop) genie.resetState();
                }
            }
        },
        {
            key: "createSynth",
            value: function createSynth() {
                return new $49SJR$tone.AMSynth(this.synthOptions).connect(this.gain);
            }
        },
        {
            key: "releaseAndFreeSynth",
            value: function releaseAndFreeSynth(synth, seconds) {
                var _this = this;
                synth.triggerRelease($49SJR$tone.now() + seconds);
                var releaseDuration = $49SJR$tone.Time(synth.envelope.release).toSeconds();
                var toneDuration = seconds + releaseDuration;
                setTimeout(function() {
                    return _this.synthPool.push(synth);
                }, toneDuration * 1000);
            }
        },
        {
            key: "getGenieFrequency",
            value: function getGenieFrequency(cell) {
                var genieButton = $df410cf7d5f8b9de$var$NUM_BUTTONS - 1 - cell;
                var pianoKey = this.genie.nextFromKeyList(genieButton, this.allowedPianoKeys, $df410cf7d5f8b9de$var$TEMPERATURE);
                var midiNote = $df410cf7d5f8b9de$var$LOWEST_PIANO_KEY_MIDI_NOTE + pianoKey;
                var frequency = $49SJR$tone.Frequency(midiNote, "midi").toFrequency();
                return frequency;
            }
        },
        {
            key: "init",
            value: function init() {
                var _this = this;
                return (0, ($parcel$interopDefault($49SJR$swchelperslib_async_to_generatorjs)))(function() {
                    var genie;
                    return (0, ($parcel$interopDefault($49SJR$swchelperslib_ts_generatorjs)))(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                genie = _this.genie;
                                return [
                                    4,
                                    genie.initialize()
                                ];
                            case 1:
                                _state.sent();
                                console.log("\uD83E\uDDDE‍♀️ ready!");
                                _this.play();
                                return [
                                    2
                                ];
                        }
                    });
                })();
            }
        },
        {
            key: "getOptions",
            value: function getOptions() {
                return (0, ($parcel$interopDefault($49SJR$swchelperslib_object_spreadjs)))({}, this._options);
            }
        },
        {
            key: "applyOptions",
            value: function applyOptions(o) {
                Object.assign(this._options, o);
            }
        },
        {
            key: "getHandlers",
            value: function getHandlers() {
                return {
                    addPointer: this.addPointer.bind(this),
                    updatePointer: this.updatePointer.bind(this),
                    removePointer: this.removePointer.bind(this)
                };
            }
        },
        {
            key: "getCellCoordinates",
            value: function getCellCoordinates(relX, relY) {
                var cellX = Math.floor(relX * this.numNotes);
                var cellY = Math.floor(relY * $df410cf7d5f8b9de$var$NUM_BUTTONS);
                return {
                    cellX: cellX,
                    cellY: cellY
                };
            }
        },
        {
            key: "addPointer",
            value: function addPointer(pe) {
                this.removePointer(pe);
                this.pane.addEventListener("pointermove", this.handlers.updatePointer);
                this.pane.setPointerCapture(pe.pointerId);
                var _getRelativePointerPosition = (0, $aba086a96c3a6af4$export$79263550b33b988b)(pe, this.pane), relX = _getRelativePointerPosition.relX, relY = _getRelativePointerPosition.relY;
                var _this_getCellCoordinates = this.getCellCoordinates(relX, relY), cellX = _this_getCellCoordinates.cellX, cellY = _this_getCellCoordinates.cellY;
                this.pointers.set(pe.pointerId, {
                    cellX: cellX,
                    cellY: cellY
                });
                var segments = this.segments;
                segments.isolate(cellX);
                segments.set(cellX, cellY);
                this.updateGrid();
            }
        },
        {
            key: "updateAllowedPianoKeys",
            value: function updateAllowedPianoKeys() {
                this.allowedPianoKeys = $df410cf7d5f8b9de$var$computeAllowedPianoKeys(this.minMidiNote, this.maxMidiNote);
            }
        },
        {
            key: "updatePointer",
            value: function updatePointer(pe) {
                if (pe.buttons === 0) return;
                var id = pe.pointerId;
                var _getRelativePointerPosition = (0, $aba086a96c3a6af4$export$79263550b33b988b)(pe, this.pane), relX = _getRelativePointerPosition.relX, relY = _getRelativePointerPosition.relY;
                var pointerData = this.pointers.get(id);
                (0, $49SJR$assert.strict)(typeof pointerData !== "undefined");
                var prevCellX = pointerData.cellX, prevCellY = pointerData.cellY;
                var _this_getCellCoordinates = this.getCellCoordinates(relX, relY), cellX = _this_getCellCoordinates.cellX, cellY = _this_getCellCoordinates.cellY;
                this.pointers.set(id, {
                    cellX: cellX,
                    cellY: cellY
                });
                var segments = this.segments;
                if (prevCellX === cellX) // same x cell
                {
                    if (prevCellY !== cellY) {
                        // different y cell
                        if (cellY < 0 || cellY >= $df410cf7d5f8b9de$var$NUM_BUTTONS) {
                            // out of y range
                            segments.isolate(cellX);
                            segments.set(cellX, -1);
                        } else // within y range
                        segments.set(cellX, cellY);
                        this.updateGrid();
                    }
                } else {
                    // different x cell (possibly with some columns in between)
                    var _this_connectCells = (0, ($parcel$interopDefault($49SJR$swchelperslib_sliced_to_arrayjs)))(this.connectCells(pointerData, {
                        cellX: cellX,
                        cellY: cellY
                    }), 2), previousSegmentIndex = _this_connectCells[0], segmentIndex = _this_connectCells[1];
                    console.log(prevCellX, previousSegmentIndex, cellX, segmentIndex);
                    if (prevCellX !== -1 && cellX !== -1 && previousSegmentIndex !== segmentIndex) {
                        if (prevCellX < cellX) segments.splitAfter(cellX);
                        else segments.splitBefore(cellX);
                    }
                    this.updateGrid();
                }
            }
        },
        {
            key: "connectCells",
            value: function connectCells(first, second) {
                if (second.cellX < first.cellX) {
                    var _this_connectCells = (0, ($parcel$interopDefault($49SJR$swchelperslib_sliced_to_arrayjs)))(this.connectCells(second, first), 2), secondSegmentIndex = _this_connectCells[0], firstSegmentIndex = _this_connectCells[1];
                    return [
                        firstSegmentIndex,
                        secondSegmentIndex
                    ];
                }
                var x0 = first.cellX, y0 = first.cellY;
                var x1 = second.cellX, y1 = second.cellY;
                var slope = (y1 - y0) / (x1 - x0);
                var segments = this.segments;
                var _segments_join = (0, ($parcel$interopDefault($49SJR$swchelperslib_sliced_to_arrayjs)))(segments.join(x0, x1), 2), firstSegmentIndex1 = _segments_join[0], secondSegmentIndex1 = _segments_join[1];
                var clampedX0 = Math.min(segments.size - 1, Math.max(x0, 0));
                var clampedX1 = Math.min(segments.size - 1, Math.max(x1, 0));
                for(var x = clampedX0; x <= clampedX1; x += 1){
                    var y = Math.floor(y0 + slope * (x - x0));
                    if (y < 0 || y >= $df410cf7d5f8b9de$var$NUM_BUTTONS) {
                        // make it possible to disable columns by dragging them out of the y range
                        segments.isolate(x);
                        segments.set(x, -1);
                    } else segments.set(x, y);
                }
                return [
                    firstSegmentIndex1,
                    secondSegmentIndex1
                ];
            }
        },
        {
            key: "removePointer",
            value: function removePointer(pe) {
                var id = pe.pointerId;
                this.pointers.delete(id);
                if (this.pointers.size === 0) this.pane.removeEventListener("pointermove", this.handlers.updatePointer);
            }
        },
        {
            key: "updateGrid",
            value: function updateGrid() {
                this.context.clearRect(0, 0, $df410cf7d5f8b9de$var$CANVAS_WIDTH, $df410cf7d5f8b9de$var$CANVAS_HEIGHT);
                if (this.showBar) this.paintBar();
                if (this.showGrid) {
                    this.paintCells();
                    this.paintGrid();
                }
                this.paintSegments();
            }
        },
        {
            key: "paintSegments",
            value: function paintSegments() {
                var segments = this.segments;
                // compute segments
                var controlPointsPerSegment = [];
                var stepX = $df410cf7d5f8b9de$var$CANVAS_WIDTH / segments.size;
                var stepY = $df410cf7d5f8b9de$var$CANVAS_HEIGHT / $df410cf7d5f8b9de$var$NUM_BUTTONS;
                var cellX = 0;
                for(var i = 0; i < segments.numSegments; i += 1){
                    var segment = segments.getSegment(i);
                    var controlPoints = [];
                    (0, $49SJR$assert.strict)(typeof segment !== "undefined");
                    for(var j = 0; j < segment.length; j += 1){
                        var cellY = segment[j];
                        if (cellY >= 0) {
                            var x = stepX * (0.5 + cellX);
                            var y = stepY * (0.5 + cellY);
                            controlPoints.push({
                                x: x,
                                y: y
                            });
                        }
                        cellX += 1;
                    }
                    controlPointsPerSegment.push(controlPoints);
                }
                var minCellDim = Math.min($df410cf7d5f8b9de$var$CANVAS_HEIGHT / $df410cf7d5f8b9de$var$NUM_BUTTONS, $df410cf7d5f8b9de$var$CANVAS_WIDTH / segments.size);
                var _this = this, context = _this.context, relativeDotSize = _this.relativeDotSize, dotColor = _this.dotColor, relativeLineWidth = _this.relativeLineWidth, lineColor = _this.lineColor;
                context.save();
                var dotRadius = minCellDim * relativeDotSize * 0.5;
                if (dotRadius > 0) {
                    context.fillStyle = dotColor;
                    controlPointsPerSegment.forEach(function(controlPoints) {
                        return controlPoints.forEach(function(param) {
                            var x = param.x, y = param.y;
                            context.beginPath();
                            context.ellipse(x, y, dotRadius, dotRadius, 0, 0, 2 * Math.PI);
                            context.closePath();
                            context.fill();
                        });
                    });
                }
                var lineWidth = minCellDim * relativeLineWidth;
                if (lineWidth > 0) {
                    context.beginPath();
                    context.strokeStyle = lineColor;
                    context.lineWidth = lineWidth;
                    context.lineCap = "round";
                    context.lineJoin = "round";
                    controlPointsPerSegment.forEach(function(controlPoints) {
                        if (controlPoints.length === 1) {
                            var _controlPoints = (0, ($parcel$interopDefault($49SJR$swchelperslib_sliced_to_arrayjs)))(controlPoints, 1), _controlPoints_ = _controlPoints[0], x = _controlPoints_.x, y = _controlPoints_.y;
                            context.moveTo(x, y);
                            context.lineTo(x, y);
                        } else if (controlPoints.length === 2) {
                            var _controlPoints1 = (0, ($parcel$interopDefault($49SJR$swchelperslib_sliced_to_arrayjs)))(controlPoints, 2), _controlPoints_1 = _controlPoints1[0], x0 = _controlPoints_1.x, y0 = _controlPoints_1.y, _controlPoints_2 = _controlPoints1[1], x1 = _controlPoints_2.x, y1 = _controlPoints_2.y;
                            context.moveTo(x0, y0);
                            context.lineTo(x1, y1);
                        } else if (controlPoints.length >= 3) {
                            var points = (0, $aba086a96c3a6af4$export$cfd1427bc286eaca)(controlPoints, 0.35);
                            var firstPoint = points.shift();
                            (0, $49SJR$assert.strict)(typeof firstPoint !== "undefined");
                            context.moveTo(firstPoint.x, firstPoint.y);
                            points.forEach(function(param) {
                                var x = param.x, y = param.y;
                                return context.lineTo(x, y);
                            });
                        }
                    });
                    context.stroke();
                    context.closePath();
                }
                context.restore();
            }
        },
        {
            key: "paintGrid",
            value: function paintGrid() {
                var _this = this, context = _this.context, segments = _this.segments;
                context.save();
                context.beginPath();
                context.strokeStyle = "#b3b2b2";
                var stepX = $df410cf7d5f8b9de$var$CANVAS_WIDTH / segments.size;
                for(var i = 1; i < segments.size; i += 1){
                    var x = stepX * i;
                    context.moveTo(x, 0);
                    context.lineTo(x, $df410cf7d5f8b9de$var$CANVAS_HEIGHT);
                }
                var stepY = $df410cf7d5f8b9de$var$CANVAS_HEIGHT / $df410cf7d5f8b9de$var$NUM_BUTTONS;
                for(var i1 = 1; i1 < $df410cf7d5f8b9de$var$NUM_BUTTONS; i1 += 1){
                    var y = stepY * i1;
                    context.moveTo(0, y);
                    context.lineTo($df410cf7d5f8b9de$var$CANVAS_WIDTH, y);
                }
                context.stroke();
                context.closePath();
                context.restore();
            }
        },
        {
            key: "paintCells",
            value: function paintCells() {
                var _this = this, context = _this.context, segments = _this.segments;
                context.save();
                context.beginPath();
                context.fillStyle = "#b3b2b2";
                var stepX = $df410cf7d5f8b9de$var$CANVAS_WIDTH / segments.size;
                var stepY = $df410cf7d5f8b9de$var$CANVAS_HEIGHT / $df410cf7d5f8b9de$var$NUM_BUTTONS;
                var cellX = 0;
                for(var i = 0; i < this.segments.numSegments; i += 1){
                    var segment = this.segments.getSegment(i);
                    (0, $49SJR$assert.strict)(typeof segment !== "undefined");
                    for(var j = 0; j < segment.length; j += 1){
                        var cellY = segment[j];
                        if (cellY >= 0) {
                            var x = stepX * cellX;
                            var y = stepY * cellY;
                            context.rect(x, y, stepX, stepY);
                        }
                        cellX += 1;
                    }
                }
                context.fill();
                context.closePath();
                context.restore();
            }
        },
        {
            key: "paintBar",
            value: function paintBar() {
                var context = this.context;
                context.save();
                context.fillStyle = "rgba(211,211,211,0.4)";
                var stepX = $df410cf7d5f8b9de$var$CANVAS_WIDTH / this.numNotes;
                var x = stepX * this.position;
                context.fillRect(x, 0, stepX, $df410cf7d5f8b9de$var$CANVAS_WIDTH);
                context.restore();
            }
        }
    ], [
        {
            key: "create",
            value: function create(element) {
                var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
                return (0, ($parcel$interopDefault($49SJR$swchelperslib_async_to_generatorjs)))(function() {
                    var synthGenie;
                    return (0, ($parcel$interopDefault($49SJR$swchelperslib_ts_generatorjs)))(this, function(_state) {
                        switch(_state.label){
                            case 0:
                                synthGenie = new SynthGenie(element, options);
                                return [
                                    4,
                                    synthGenie.init()
                                ];
                            case 1:
                                _state.sent();
                                return [
                                    2,
                                    synthGenie
                                ];
                        }
                    });
                })();
            }
        }
    ]);
    return SynthGenie;
}();



var $8762181023e429c8$export$2e2bcd8739ae039 = (0, $df410cf7d5f8b9de$export$2e2bcd8739ae039);
$parcel$exportWildcard(module.exports, $df410cf7d5f8b9de$exports);


//# sourceMappingURL=index.js.map
