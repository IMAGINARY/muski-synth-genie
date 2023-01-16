import "./index.css";
import $1xfY9$swchelperssrc_define_propertymjs from "@swc/helpers/src/_define_property.mjs";
import {tf as $1xfY9$tf, PianoGenie as $1xfY9$PianoGenie} from "@magenta/music";
import {AMSynth as $1xfY9$AMSynth, now as $1xfY9$now, Time as $1xfY9$Time, Frequency as $1xfY9$Frequency, Gain as $1xfY9$Gain} from "tone";
import {strict as $1xfY9$strict} from "assert";

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}
var $450629445fe8fa68$exports = {};

$parcel$defineInteropFlag($450629445fe8fa68$exports);

$parcel$export($450629445fe8fa68$exports, "defaultOptions", function () { return $450629445fe8fa68$export$ba43bf67f3d48107; });
$parcel$export($450629445fe8fa68$exports, "default", function () { return $450629445fe8fa68$export$2e2bcd8739ae039; });
/* eslint-disable no-console */ 



var $1cf11a7bc80fe21b$exports = {};

$parcel$export($1cf11a7bc80fe21b$exports, "pane", function () { return $1cf11a7bc80fe21b$export$6dff30574f79a202; }, function (v) { return $1cf11a7bc80fe21b$export$6dff30574f79a202 = v; });
var $1cf11a7bc80fe21b$export$6dff30574f79a202;
$1cf11a7bc80fe21b$export$6dff30574f79a202 = `FC48wq_pane`;


function $12f1dd3205f197c4$export$79263550b33b988b(pe, elem) {
    const { left: left , top: top , width: width , height: height  } = elem.getBoundingClientRect();
    const x = pe.clientX - left;
    const y = pe.clientY - top;
    const relX = x / width;
    const relY = y / height;
    return {
        x: x,
        y: y,
        relX: relX,
        relY: relY,
        width: width,
        height: height
    };
}
function $12f1dd3205f197c4$export$cfd1427bc286eaca(points, tension = 0.5, isClosed = false, numOfSegments = 16) {
    // convert to internal format
    const pts = new Array();
    points.forEach(({ x: x , y: y  })=>pts.push(x, y));
    // The algorithm require a previous and next point to the actual point array.
    // Check if we will draw closed or open curve.
    // If closed, copy end points to beginning and first points to end
    // If open, duplicate first points to beginning, end points to end
    const firstPoint = points[0];
    const lastPoint = points[points.length - 1];
    if (isClosed) {
        pts.unshift(lastPoint.x, lastPoint.y);
        pts.unshift(lastPoint.x, lastPoint.y);
        pts.push(firstPoint.x, firstPoint.y);
    } else {
        pts.unshift(firstPoint.x, firstPoint.y); // copy 1. point and insert at beginning
        pts.push(lastPoint.x, lastPoint.y); // copy last point and append
    }
    // ok, lets start..
    const res = new Array();
    // 1. loop goes through point array
    // 2. loop goes through each segment between the 2 pts + 1e point before and after
    for(let i = 2; i < pts.length - 4; i += 2)for(let t = 0; t <= numOfSegments; t += 1){
        // calc tension vectors
        const t1x = (pts[i + 2] - pts[i - 2]) * tension;
        const t2x = (pts[i + 4] - pts[i]) * tension;
        const t1y = (pts[i + 3] - pts[i - 1]) * tension;
        const t2y = (pts[i + 5] - pts[i + 1]) * tension;
        // calc step
        const st = t / numOfSegments;
        // calc cardinals
        const c1 = 2 * st ** 3 - 3 * st ** 2 + 1;
        const c2 = -(2 * st ** 3) + 3 * st ** 2;
        const c3 = st ** 3 - 2 * st ** 2 + st;
        const c4 = st ** 3 - st ** 2;
        // calc x and y cords with common control vectors
        const x = c1 * pts[i] + c2 * pts[i + 2] + c3 * t1x + c4 * t2x;
        const y = c1 * pts[i + 1] + c2 * pts[i + 3] + c3 * t1y + c4 * t2y;
        // store points in array
        res.push({
            x: x,
            y: y
        });
    }
    return res;
}



class $e64336d5251bab09$export$2e2bcd8739ae039 {
    get size() {
        return this._size;
    }
    get numSegments() {
        return this.segments.length;
    }
    findSegmentIndex(x) {
        let numElements = 0;
        let segmentIndex = 0;
        while(segmentIndex < this.segments.length && numElements + this.segments[segmentIndex].length <= x){
            numElements += this.segments[segmentIndex].length;
            segmentIndex += 1;
        }
        const indexInSegment = x - numElements;
        return {
            segmentIndex: segmentIndex,
            indexInSegment: indexInSegment
        };
    }
    get(x, defaultValue) {
        if (x < 0 || x >= this.size) return defaultValue !== null && defaultValue !== void 0 ? defaultValue : undefined; // out of range
        const { segmentIndex: segmentIndex , indexInSegment: indexInSegment  } = this.findSegmentIndex(x);
        return this.segments[segmentIndex][indexInSegment];
    }
    set(x, ...values) {
        if (x < 0 || x >= this.size) return; // out of range
        let { segmentIndex: segmentIndex , indexInSegment: indexInSegment  } = this.findSegmentIndex(x);
        for(let i = 0; i < values.length; i += 1){
            this.segments[segmentIndex][indexInSegment] = values[i];
            indexInSegment += 1;
            if (indexInSegment >= this.segments[segmentIndex].length) {
                segmentIndex += 1;
                indexInSegment = 0;
            }
            if (segmentIndex > this.segments.length) break;
        }
    }
    getSegment(which) {
        return this.segments[which];
    }
    getSegmentOf(x) {
        const { segmentIndex: segmentIndex , indexInSegment: indexInSegment  } = this.findSegmentIndex(x);
        return {
            segment: [
                ...this.segments[segmentIndex]
            ],
            indexInSegment: indexInSegment
        };
    }
    getAllSegments() {
        return this.segments.map((s)=>[
                ...s
            ]);
    }
    /**
     * Split segments before in front of x.
     * @param x
     */ splitBefore(x) {
        if (x < 0 || x >= this.size) return -1; // out of range
        if (x === 0) return 0;
        const { segmentIndex: segmentIndex , indexInSegment: indexInSegment  } = this.findSegmentIndex(x);
        if (indexInSegment === 0) // a segment starts at x -> no split necessary
        return segmentIndex;
        const segment = this.segments[segmentIndex];
        const upper = segment.slice(indexInSegment);
        const lower = segment.slice(0, indexInSegment);
        this.segments.splice(segmentIndex, 1, lower, upper);
        return segmentIndex + 1;
    }
    splitAfter(x) {
        if (x < 0 || x >= this.size) return -1; // out of range
        if (x === this.size - 1) return this.size - 1;
        return this.splitBefore(x + 1) + 1;
    }
    /** Split segment before and after x.
     *
     * @param x The index of the element to put into an isolated segment.
     */ isolate(x) {
        this.splitAfter(x);
        return this.splitBefore(x);
    }
    join1(x) {
        if (x <= 0 || x >= this.size) return -1; // out of range
        const { segmentIndex: segmentIndex , indexInSegment: indexInSegment  } = this.findSegmentIndex(x);
        if (indexInSegment !== 0) this.joinSegments(segmentIndex);
        return segmentIndex;
    }
    join2(x0, x1) {
        if (x0 > x1) {
            const [segmentIndex1, segmentIndex0] = this.join2(x1, x0);
            return [
                segmentIndex0,
                segmentIndex1
            ];
        }
        if (x1 < 0 || x0 >= this.size) return [
            -1,
            -1
        ];
        const clampedX0 = Math.min(this.size - 1, Math.max(x0, 0));
        const clampedX1 = Math.min(this.size - 1, Math.max(x1, 0));
        const { segmentIndex: segmentIndex01  } = this.findSegmentIndex(clampedX0);
        const { segmentIndex: segmentIndex11  } = this.findSegmentIndex(clampedX1);
        for(let i = 0; i < segmentIndex11 - segmentIndex01; i += 1)this.joinSegments(segmentIndex01 + 1);
        return [
            x0 < 0 ? -1 : segmentIndex01,
            x1 >= this.size ? -1 : segmentIndex11
        ];
    }
    join(x0, x1) {
        return typeof x1 === "undefined" ? this.join1(x0) : this.join2(x0, x1);
    }
    /**
     * Join the segment with the one in front of it.
     *
     * @param segmentIndex The index of the segment to join with its predecessor.
     */ joinSegments(segmentIndex) {
        if (segmentIndex <= 0 || segmentIndex >= this.numSegments) return -1;
        const lower = this.segments[segmentIndex - 1];
        const upper = this.segments[segmentIndex];
        this.segments.splice(segmentIndex, 1);
        lower.push(...upper);
        return segmentIndex - 1;
    }
    resize(size) {
        if (size > this.size) {
            const diff = size - this.size;
            this.segments.push(new Array(diff).fill(0).map(this.defaultValueCallback));
            this._size = size;
        } else if (size > 0 && size < this.size) {
            this.splitBefore(size);
            const { segmentIndex: segmentIndex  } = this.findSegmentIndex(size);
            this.segments.splice(segmentIndex);
            this._size = size;
        }
    }
    constructor(size, defaultValueCallback){
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "segments", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "_size", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "defaultValueCallback", void 0);
        this.segments = [
            new Array(size).fill(undefined).map(defaultValueCallback)
        ];
        this._size = size;
        this.defaultValueCallback = defaultValueCallback;
    }
}


(0, $1xfY9$tf).disableDeprecationWarnings();
const $450629445fe8fa68$var$PIANO_GENIE_CHECKPOINT = "https://storage.googleapis.com/magentadata/js/checkpoints/piano_genie/model/epiano/stp_iq_auto_contour_dt_166006";
const $450629445fe8fa68$var$LOWEST_PIANO_KEY_MIDI_NOTE = 21;
const $450629445fe8fa68$var$NUM_BEATS = 16;
const $450629445fe8fa68$var$NUM_BUTTONS = 8;
const $450629445fe8fa68$var$exponentialEnvelopeCurve = "exponential";
const $450629445fe8fa68$var$envelopeOptions = {
    attack: 0.01,
    attackCurve: $450629445fe8fa68$var$exponentialEnvelopeCurve,
    decay: 0.01,
    decayCurve: $450629445fe8fa68$var$exponentialEnvelopeCurve,
    release: 0.5,
    releaseCurve: $450629445fe8fa68$var$exponentialEnvelopeCurve,
    sustain: 0.9
};
const $450629445fe8fa68$var$SYNTH_OPTIONS = {
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
function $450629445fe8fa68$var$computeAllowedPianoKeys(minMidiNote, maxMidiNote) {
    (0, $1xfY9$strict)(minMidiNote < maxMidiNote);
    const keyMin = Math.max(0, minMidiNote - $450629445fe8fa68$var$LOWEST_PIANO_KEY_MIDI_NOTE);
    const maxKey = Math.min(maxMidiNote - $450629445fe8fa68$var$LOWEST_PIANO_KEY_MIDI_NOTE, 87);
    const numKeys = Math.max(0, maxKey - keyMin + 1);
    const keys = new Array(numKeys).fill(0).map((_, i)=>keyMin + i);
    console.log(keys);
    return keys;
}
const $450629445fe8fa68$var$TEMPERATURE = 0.25;
const $450629445fe8fa68$var$CANVAS_WIDTH = 512;
const $450629445fe8fa68$var$CANVAS_HEIGHT = 256;
const $450629445fe8fa68$export$ba43bf67f3d48107 = {};
class $450629445fe8fa68$export$2e2bcd8739ae039 {
    static async create(element, options = {}) {
        const synthGenie = new $450629445fe8fa68$export$2e2bcd8739ae039(element, options);
        await synthGenie.init();
        return synthGenie;
    }
    play() {
        if (this.timer === 0) {
            const { beatLength: beatLength  } = this;
            this.timer = setTimeout(()=>{
                this.timer = setInterval(()=>this.playBeat(), beatLength);
            }, 0);
        }
    }
    pause() {
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
    isPlaying() {
        return this.timer !== 0;
    }
    playBeat() {
        const { genie: genie  } = this;
        const { segment: segment , indexInSegment: indexInSegment  } = this.segments.getSegmentOf(this.position);
        const cell = segment[indexInSegment];
        (0, $1xfY9$strict)(typeof cell !== "undefined");
        if (this.synth !== null && cell === -1) {
            // note still ringing, but shouldn't (grid values changed)
            this.releaseAndFreeSynth(this.synth, 0);
            this.synth = null;
        }
        if (cell !== -1) {
            const frequency = this.getGenieFrequency(cell);
            const attack = this.synth === null || indexInSegment === 0 || !this.sustainInSegments;
            const release = indexInSegment === segment.length - 1 || !this.sustainInSegments;
            var _this_synth, _ref;
            this.synth = (_ref = (_this_synth = this.synth) !== null && _this_synth !== void 0 ? _this_synth : this.synthPool.pop()) !== null && _ref !== void 0 ? _ref : this.createSynth();
            const noteDuration = this.beatLength * this.relativeNoteLength / 1000;
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
    createSynth() {
        return new $1xfY9$AMSynth(this.synthOptions).connect(this.gain);
    }
    releaseAndFreeSynth(synth, seconds) {
        synth.triggerRelease($1xfY9$now() + seconds);
        const releaseDuration = $1xfY9$Time(synth.envelope.release).toSeconds();
        const toneDuration = seconds + releaseDuration;
        setTimeout(()=>this.synthPool.push(synth), toneDuration * 1000);
    }
    getGenieFrequency(cell) {
        const genieButton = $450629445fe8fa68$var$NUM_BUTTONS - 1 - cell;
        const pianoKey = this.genie.nextFromKeyList(genieButton, this.allowedPianoKeys, $450629445fe8fa68$var$TEMPERATURE);
        const midiNote = $450629445fe8fa68$var$LOWEST_PIANO_KEY_MIDI_NOTE + pianoKey;
        const frequency = $1xfY9$Frequency(midiNote, "midi").toFrequency();
        return frequency;
    }
    async init() {
        const { genie: genie  } = this;
        await genie.initialize();
        console.log("\uD83E\uDDDE‍♀️ ready!");
        this.play();
    }
    getOptions() {
        return {
            ...this._options
        };
    }
    applyOptions(o) {
        Object.assign(this._options, o);
    }
    getHandlers() {
        return {
            addPointer: this.addPointer.bind(this),
            updatePointer: this.updatePointer.bind(this),
            removePointer: this.removePointer.bind(this)
        };
    }
    getCellCoordinates(relX, relY) {
        const cellX = Math.floor(relX * this.numNotes);
        const cellY = Math.floor(relY * $450629445fe8fa68$var$NUM_BUTTONS);
        return {
            cellX: cellX,
            cellY: cellY
        };
    }
    addPointer(pe) {
        this.removePointer(pe);
        this.pane.addEventListener("pointermove", this.handlers.updatePointer);
        this.pane.setPointerCapture(pe.pointerId);
        const { relX: relX , relY: relY  } = (0, $12f1dd3205f197c4$export$79263550b33b988b)(pe, this.pane);
        const { cellX: cellX , cellY: cellY  } = this.getCellCoordinates(relX, relY);
        this.pointers.set(pe.pointerId, {
            cellX: cellX,
            cellY: cellY
        });
        const { segments: segments  } = this;
        segments.isolate(cellX);
        segments.set(cellX, cellY);
        this.updateGrid();
    }
    updateAllowedPianoKeys() {
        this.allowedPianoKeys = $450629445fe8fa68$var$computeAllowedPianoKeys(this.minMidiNote, this.maxMidiNote);
    }
    updatePointer(pe) {
        if (pe.buttons === 0) return;
        const id = pe.pointerId;
        const { relX: relX , relY: relY  } = (0, $12f1dd3205f197c4$export$79263550b33b988b)(pe, this.pane);
        const pointerData = this.pointers.get(id);
        (0, $1xfY9$strict)(typeof pointerData !== "undefined");
        const { cellX: prevCellX , cellY: prevCellY  } = pointerData;
        const { cellX: cellX , cellY: cellY  } = this.getCellCoordinates(relX, relY);
        this.pointers.set(id, {
            cellX: cellX,
            cellY: cellY
        });
        const { segments: segments  } = this;
        if (prevCellX === cellX) // same x cell
        {
            if (prevCellY !== cellY) {
                // different y cell
                if (cellY < 0 || cellY >= $450629445fe8fa68$var$NUM_BUTTONS) {
                    // out of y range
                    segments.isolate(cellX);
                    segments.set(cellX, -1);
                } else // within y range
                segments.set(cellX, cellY);
                this.updateGrid();
            }
        } else {
            // different x cell (possibly with some columns in between)
            const [previousSegmentIndex, segmentIndex] = this.connectCells(pointerData, {
                cellX: cellX,
                cellY: cellY
            });
            console.log(prevCellX, previousSegmentIndex, cellX, segmentIndex);
            if (prevCellX !== -1 && cellX !== -1 && previousSegmentIndex !== segmentIndex) {
                if (prevCellX < cellX) segments.splitAfter(cellX);
                else segments.splitBefore(cellX);
            }
            this.updateGrid();
        }
    }
    connectCells(first, second) {
        if (second.cellX < first.cellX) {
            const [secondSegmentIndex, firstSegmentIndex] = this.connectCells(second, first);
            return [
                firstSegmentIndex,
                secondSegmentIndex
            ];
        }
        const { cellX: x0 , cellY: y0  } = first;
        const { cellX: x1 , cellY: y1  } = second;
        const slope = (y1 - y0) / (x1 - x0);
        const { segments: segments  } = this;
        const [firstSegmentIndex1, secondSegmentIndex1] = segments.join(x0, x1);
        const clampedX0 = Math.min(segments.size - 1, Math.max(x0, 0));
        const clampedX1 = Math.min(segments.size - 1, Math.max(x1, 0));
        for(let x = clampedX0; x <= clampedX1; x += 1){
            const y = Math.floor(y0 + slope * (x - x0));
            if (y < 0 || y >= $450629445fe8fa68$var$NUM_BUTTONS) {
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
    removePointer(pe) {
        const id = pe.pointerId;
        this.pointers.delete(id);
        if (this.pointers.size === 0) this.pane.removeEventListener("pointermove", this.handlers.updatePointer);
    }
    updateGrid() {
        this.context.clearRect(0, 0, $450629445fe8fa68$var$CANVAS_WIDTH, $450629445fe8fa68$var$CANVAS_HEIGHT);
        if (this.showBar) this.paintBar();
        if (this.showGrid) {
            this.paintCells();
            this.paintGrid();
        }
        this.paintSegments();
    }
    paintSegments() {
        const { segments: segments  } = this;
        // compute segments
        const controlPointsPerSegment = [];
        const stepX = $450629445fe8fa68$var$CANVAS_WIDTH / segments.size;
        const stepY = $450629445fe8fa68$var$CANVAS_HEIGHT / $450629445fe8fa68$var$NUM_BUTTONS;
        let cellX = 0;
        for(let i = 0; i < segments.numSegments; i += 1){
            const segment = segments.getSegment(i);
            const controlPoints = [];
            (0, $1xfY9$strict)(typeof segment !== "undefined");
            for(let j = 0; j < segment.length; j += 1){
                const cellY = segment[j];
                if (cellY >= 0) {
                    const x = stepX * (0.5 + cellX);
                    const y = stepY * (0.5 + cellY);
                    controlPoints.push({
                        x: x,
                        y: y
                    });
                }
                cellX += 1;
            }
            controlPointsPerSegment.push(controlPoints);
        }
        const minCellDim = Math.min($450629445fe8fa68$var$CANVAS_HEIGHT / $450629445fe8fa68$var$NUM_BUTTONS, $450629445fe8fa68$var$CANVAS_WIDTH / segments.size);
        const { context: context , relativeDotSize: relativeDotSize , dotColor: dotColor , relativeLineWidth: relativeLineWidth , lineColor: lineColor  } = this;
        context.save();
        const dotRadius = minCellDim * relativeDotSize * 0.5;
        if (dotRadius > 0) {
            context.fillStyle = dotColor;
            controlPointsPerSegment.forEach((controlPoints)=>controlPoints.forEach(({ x: x , y: y  })=>{
                    context.beginPath();
                    context.ellipse(x, y, dotRadius, dotRadius, 0, 0, 2 * Math.PI);
                    context.closePath();
                    context.fill();
                }));
        }
        const lineWidth = minCellDim * relativeLineWidth;
        if (lineWidth > 0) {
            context.beginPath();
            context.strokeStyle = lineColor;
            context.lineWidth = lineWidth;
            context.lineCap = "round";
            context.lineJoin = "round";
            controlPointsPerSegment.forEach((controlPoints)=>{
                if (controlPoints.length === 1) {
                    const [{ x: x , y: y  }] = controlPoints;
                    context.moveTo(x, y);
                    context.lineTo(x, y);
                } else if (controlPoints.length === 2) {
                    const [{ x: x0 , y: y0  }, { x: x1 , y: y1  }] = controlPoints;
                    context.moveTo(x0, y0);
                    context.lineTo(x1, y1);
                } else if (controlPoints.length >= 3) {
                    const points = (0, $12f1dd3205f197c4$export$cfd1427bc286eaca)(controlPoints, 0.35);
                    const firstPoint = points.shift();
                    (0, $1xfY9$strict)(typeof firstPoint !== "undefined");
                    context.moveTo(firstPoint.x, firstPoint.y);
                    points.forEach(({ x: x , y: y  })=>context.lineTo(x, y));
                }
            });
            context.stroke();
            context.closePath();
        }
        context.restore();
    }
    paintGrid() {
        const { context: context , segments: segments  } = this;
        context.save();
        context.beginPath();
        context.strokeStyle = "#b3b2b2";
        const stepX = $450629445fe8fa68$var$CANVAS_WIDTH / segments.size;
        for(let i = 1; i < segments.size; i += 1){
            const x = stepX * i;
            context.moveTo(x, 0);
            context.lineTo(x, $450629445fe8fa68$var$CANVAS_HEIGHT);
        }
        const stepY = $450629445fe8fa68$var$CANVAS_HEIGHT / $450629445fe8fa68$var$NUM_BUTTONS;
        for(let i1 = 1; i1 < $450629445fe8fa68$var$NUM_BUTTONS; i1 += 1){
            const y = stepY * i1;
            context.moveTo(0, y);
            context.lineTo($450629445fe8fa68$var$CANVAS_WIDTH, y);
        }
        context.stroke();
        context.closePath();
        context.restore();
    }
    paintCells() {
        const { context: context , segments: segments  } = this;
        context.save();
        context.beginPath();
        context.fillStyle = "#b3b2b2";
        const stepX = $450629445fe8fa68$var$CANVAS_WIDTH / segments.size;
        const stepY = $450629445fe8fa68$var$CANVAS_HEIGHT / $450629445fe8fa68$var$NUM_BUTTONS;
        let cellX = 0;
        for(let i = 0; i < this.segments.numSegments; i += 1){
            const segment = this.segments.getSegment(i);
            (0, $1xfY9$strict)(typeof segment !== "undefined");
            for(let j = 0; j < segment.length; j += 1){
                const cellY = segment[j];
                if (cellY >= 0) {
                    const x = stepX * cellX;
                    const y = stepY * cellY;
                    context.rect(x, y, stepX, stepY);
                }
                cellX += 1;
            }
        }
        context.fill();
        context.closePath();
        context.restore();
    }
    paintBar() {
        const { context: context  } = this;
        context.save();
        context.fillStyle = "rgba(211,211,211,0.4)";
        const stepX = $450629445fe8fa68$var$CANVAS_WIDTH / this.numNotes;
        const x = stepX * this.position;
        context.fillRect(x, 0, stepX, $450629445fe8fa68$var$CANVAS_WIDTH);
        context.restore();
    }
    constructor(element, options = {}){
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "_options", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "handlers", this.getHandlers());
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "element", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "pane", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "pointers", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "canvas", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "context", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "segments", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "numNotes", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "position", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "loopCount", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "genie", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "gain", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "beatLength", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "relativeNoteLength", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "minMidiNote", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "maxMidiNote", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "allowedPianoKeys", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "resetStateOnLoop", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "sustainInSegments", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "slideInSegments", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "showGrid", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "showBar", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "dotColor", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "relativeDotSize", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "lineColor", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "relativeLineWidth", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "synthOptions", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "synthPool", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "synth", void 0);
        (0, $1xfY9$swchelperssrc_define_propertymjs)(this, "timer", void 0);
        console.log("Starting");
        this._options = {
            ...$450629445fe8fa68$export$ba43bf67f3d48107,
            ...options
        };
        this.numNotes = $450629445fe8fa68$var$NUM_BEATS;
        this.segments = new (0, $e64336d5251bab09$export$2e2bcd8739ae039)(this.numNotes, ()=>-1);
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
        this.allowedPianoKeys = $450629445fe8fa68$var$computeAllowedPianoKeys(this.minMidiNote, this.maxMidiNote);
        console.log("Starting 2");
        const canvas = document.createElement("canvas");
        canvas.width = $450629445fe8fa68$var$CANVAS_WIDTH;
        canvas.height = $450629445fe8fa68$var$CANVAS_HEIGHT;
        const context = canvas.getContext("2d");
        (0, $1xfY9$strict)(context !== null);
        const pane = document.createElement("div");
        pane.setAttribute("touch-action", "none"); // for Pointer Events Polyfill
        pane.classList.add((0, (/*@__PURE__*/$parcel$interopDefault($1cf11a7bc80fe21b$exports))).pane);
        pane.addEventListener("pointerdown", this.handlers.addPointer);
        pane.addEventListener("pointerup", this.handlers.removePointer);
        pane.addEventListener("pointercancel", this.handlers.removePointer);
        pane.addEventListener("contextmenu", (event)=>event.preventDefault());
        pane.appendChild(canvas);
        while(element.firstChild)element.firstChild.remove();
        element.appendChild(pane);
        this.pane = pane;
        this.element = element;
        this.canvas = canvas;
        this.context = context;
        this.pointers = new Map();
        this.genie = new (0, $1xfY9$PianoGenie)($450629445fe8fa68$var$PIANO_GENIE_CHECKPOINT);
        this.gain = new $1xfY9$Gain(1).toDestination();
        this.synthOptions = $450629445fe8fa68$var$SYNTH_OPTIONS;
        this.synthPool = [];
        this.synth = null;
        this.timer = 0;
        this.updateGrid();
    }
}



var $e8a6df3c5af17b1e$export$2e2bcd8739ae039 = (0, $450629445fe8fa68$export$2e2bcd8739ae039);


export {$e8a6df3c5af17b1e$export$2e2bcd8739ae039 as default, $450629445fe8fa68$export$ba43bf67f3d48107 as defaultOptions};
//# sourceMappingURL=index.mjs.map
