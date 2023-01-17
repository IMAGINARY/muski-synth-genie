import "./index.css";
import $6GFVM$swchelperssrc_define_propertymjs from "@swc/helpers/src/_define_property.mjs";
import {tf as $6GFVM$tf, PianoGenie as $6GFVM$PianoGenie} from "@magenta/music";
import {AMSynth as $6GFVM$AMSynth, now as $6GFVM$now, Time as $6GFVM$Time, Frequency as $6GFVM$Frequency, Gain as $6GFVM$Gain} from "tone";
import {ResizeObserver as $6GFVM$ResizeObserver} from "@juggle/resize-observer";
import {strict as $6GFVM$strict} from "assert";

function $parcel$interopDefault(a) {
  return a && a.__esModule ? a.default : a;
}
function $parcel$defineInteropFlag(a) {
  Object.defineProperty(a, '__esModule', {value: true, configurable: true});
}
function $parcel$export(e, n, v, s) {
  Object.defineProperty(e, n, {get: v, set: s, enumerable: true, configurable: true});
}
var $ac42edad4610f0cf$exports = {};

$parcel$defineInteropFlag($ac42edad4610f0cf$exports);

$parcel$export($ac42edad4610f0cf$exports, "defaultOptions", function () { return $ac42edad4610f0cf$export$ba43bf67f3d48107; });
$parcel$export($ac42edad4610f0cf$exports, "default", function () { return $ac42edad4610f0cf$export$2e2bcd8739ae039; });
/* eslint-disable no-console */ 




var $0b227a8ac7910066$exports = {};

$parcel$export($0b227a8ac7910066$exports, "pane", function () { return $0b227a8ac7910066$export$6dff30574f79a202; }, function (v) { return $0b227a8ac7910066$export$6dff30574f79a202 = v; });
var $0b227a8ac7910066$export$6dff30574f79a202;
$0b227a8ac7910066$export$6dff30574f79a202 = `FC48wq_pane`;


function $826d2a65147a9c31$export$79263550b33b988b(pe, elem) {
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
function $826d2a65147a9c31$export$cfd1427bc286eaca(points, tension = 0.5, isClosed = false, numOfSegments = 16) {
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
function $826d2a65147a9c31$export$7d15b64cf5a3a4c4(x, min, max) {
    return Math.max(min, Math.min(x, max));
}



class $87a0a6ceb46ed965$export$2e2bcd8739ae039 {
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
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "segments", void 0);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "_size", void 0);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "defaultValueCallback", void 0);
        this.segments = [
            new Array(size).fill(undefined).map(defaultValueCallback)
        ];
        this._size = size;
        this.defaultValueCallback = defaultValueCallback;
    }
}


// eslint-disable-next-line compat/compat
const $ac42edad4610f0cf$var$ResizeObserver = window.ResizeObserver || (0, $6GFVM$ResizeObserver);
(0, $6GFVM$tf).disableDeprecationWarnings();
const $ac42edad4610f0cf$var$LOWEST_PIANO_KEY_MIDI_NOTE = 21;
const $ac42edad4610f0cf$var$NUM_BUTTONS = 8;
const $ac42edad4610f0cf$var$SYNTH_OPTIONS = {
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
function $ac42edad4610f0cf$var$computeAllowedPianoKeys(minMidiNote, maxMidiNote) {
    (0, $6GFVM$strict)(minMidiNote + 2 <= maxMidiNote);
    const keyMin = Math.max(0, minMidiNote - $ac42edad4610f0cf$var$LOWEST_PIANO_KEY_MIDI_NOTE);
    const maxKey = Math.min(maxMidiNote - $ac42edad4610f0cf$var$LOWEST_PIANO_KEY_MIDI_NOTE, 87);
    const numKeys = Math.max(0, maxKey - keyMin + 1);
    const keys = new Array(numKeys).fill(0).map((_, i)=>keyMin + i);
    return keys;
}
const $ac42edad4610f0cf$var$TEMPERATURE = 0.25;
const $ac42edad4610f0cf$export$ba43bf67f3d48107 = {
    resetStateOnLoop: true,
    sustainInSegments: true,
    slideInSegments: false,
    numBeats: 16,
    mute: false,
    volume: 0.75,
    pause: false,
    beatLength: 240,
    relativeNoteLength: 0.9,
    minMidiNote: 21,
    maxMidiNote: 108,
    showGrid: false,
    showBar: false,
    gridColor: "#b3b2b2",
    barColor: "rgba(211,211,211,0.4)",
    activeCellColor: "#b3b2b2",
    dotColor: "#2c2c2c",
    relativeDotSize: 0.0,
    lineColor: "#2c2c2c",
    relativeLineWidth: 0.6
};
class $ac42edad4610f0cf$export$2e2bcd8739ae039 {
    static async create(element, checkpoint, options = {}) {
        var _options_pause;
        // do not start playback before everything is initialized
        const pauseState = (_options_pause = options.pause) !== null && _options_pause !== void 0 ? _options_pause : $ac42edad4610f0cf$export$ba43bf67f3d48107.pause;
        const synthGenie = new $ac42edad4610f0cf$export$2e2bcd8739ae039(element, checkpoint, {
            ...options,
            pause: true
        });
        await synthGenie.init();
        synthGenie.pause = pauseState;
        return synthGenie;
    }
    get numBeats() {
        return this.segments.size;
    }
    set numBeats(b) {
        this.segments.resize(Math.max(1, Math.floor(b)));
        this.scheduleRepaint();
    }
    get position() {
        return this._position;
    }
    set position(p) {
        this._position = (0, $826d2a65147a9c31$export$7d15b64cf5a3a4c4)(Math.floor(p), 0, this.segments.size - 1);
        this.scheduleRepaint();
    }
    updateGain() {
        this.gain.gain.linearRampTo(this.mute ? 0 : this.volume, 0.1);
    }
    get mute() {
        return this._mute;
    }
    set mute(m) {
        this._mute = m;
        this.updateGain();
    }
    get volume() {
        return this._volume;
    }
    set volume(v) {
        this._volume = Math.max(0, v);
        this.updateGain();
    }
    get beatLength() {
        return this._beatLength;
    }
    set beatLength(l) {
        const pauseState = this.pause;
        this.pause = true;
        this._beatLength = Math.max(0, l);
        this.pause = pauseState;
    }
    get relativeNoteLength() {
        return this._relativeNoteLength;
    }
    set relativeNoteLength(l) {
        this._relativeNoteLength = Math.max(0, l);
    }
    get minMidiNote() {
        return this._minMidiNote;
    }
    set minMidiNote(n) {
        this._minMidiNote = (0, $826d2a65147a9c31$export$7d15b64cf5a3a4c4)(n, 0, 125);
        this._maxMidiNote = Math.max(this._minMidiNote + 2, this._maxMidiNote);
        this.updateAllowedPianoKeys();
    }
    get maxMidiNote() {
        return this._maxMidiNote;
    }
    set maxMidiNote(n) {
        this._maxMidiNote = (0, $826d2a65147a9c31$export$7d15b64cf5a3a4c4)(n, 2, 127);
        this._minMidiNote = Math.min(this._minMidiNote, this._maxMidiNote - 2);
        this.updateAllowedPianoKeys();
    }
    get showGrid() {
        return this._showGrid;
    }
    set showGrid(val) {
        this._showGrid = val;
        this.scheduleRepaint();
    }
    get showBar() {
        return this._showBar;
    }
    set showBar(val) {
        this._showBar = val;
        this.scheduleRepaint();
    }
    get gridColor() {
        return this._gridColor;
    }
    set gridColor(c) {
        this._gridColor = c;
        this.scheduleRepaint();
    }
    get barColor() {
        return this._barColor;
    }
    set barColor(c) {
        this._barColor = c;
        this.scheduleRepaint();
    }
    get activeCellColor() {
        return this._activeCellColor;
    }
    set activeCellColor(c) {
        this._activeCellColor = c;
        this.scheduleRepaint();
    }
    get dotColor() {
        return this._dotColor;
    }
    set dotColor(c) {
        this._dotColor = c;
        this.scheduleRepaint();
    }
    get relativeDotSize() {
        return this._relativeDotSize;
    }
    set relativeDotSize(s) {
        this._relativeDotSize = Math.max(0, s);
        this.scheduleRepaint();
    }
    get lineColor() {
        return this._lineColor;
    }
    set lineColor(c) {
        this._lineColor = c;
        this.scheduleRepaint();
    }
    get relativeLineWidth() {
        return this._relativeLineWidth;
    }
    set relativeLineWidth(w) {
        this._relativeLineWidth = Math.max(0, w);
        this.scheduleRepaint();
    }
    get() {
        return Object.fromEntries(// eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        Object.keys($ac42edad4610f0cf$export$ba43bf67f3d48107).map((key)=>[
                key,
                this[key]
            ]));
    }
    set(options) {
        Object.assign(this, options);
    }
    get pause() {
        return this.beatTimer === 0;
    }
    set pause(pause) {
        if (pause && this.beatTimer !== 0) {
            // pause
            clearTimeout(this.beatTimer);
            clearInterval(this.beatTimer);
            this.beatTimer = 0;
            if (this.synth !== null) {
                this.releaseAndFreeSynth(this.synth, 0);
                this.synth = null;
            }
        } else if (!pause && this.beatTimer === 0) // play
        this.beatTimer = setTimeout(()=>{
            this.beatTimer = setInterval(()=>this.playBeat(), this.beatLength);
        }, 0);
    }
    playBeat() {
        const { genie: genie  } = this;
        this._position += 1;
        if (this._position >= this.segments.size) {
            this._position = 0;
            if (this.resetStateOnLoop) genie.resetState();
        }
        const { segment: segment , indexInSegment: indexInSegment  } = this.segments.getSegmentOf(this._position);
        const cell = segment[indexInSegment];
        (0, $6GFVM$strict)(typeof cell !== "undefined");
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
            const noteDuration = this._beatLength * this._relativeNoteLength / 1000;
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
        this.repaint();
    }
    createSynth() {
        return new $6GFVM$AMSynth(this.synthOptions).connect(this.gain);
    }
    releaseAndFreeSynth(synth, seconds) {
        synth.triggerRelease($6GFVM$now() + seconds);
        const releaseDuration = $6GFVM$Time(synth.envelope.release).toSeconds();
        const toneDuration = seconds + releaseDuration;
        setTimeout(()=>this.synthPool.push(synth), toneDuration * 1000);
    }
    getGenieFrequency(cell) {
        const genieButton = $ac42edad4610f0cf$var$NUM_BUTTONS - 1 - cell;
        const pianoKey = this.genie.nextFromKeyList(genieButton, this.allowedPianoKeys, $ac42edad4610f0cf$var$TEMPERATURE);
        const midiNote = $ac42edad4610f0cf$var$LOWEST_PIANO_KEY_MIDI_NOTE + pianoKey;
        const frequency = $6GFVM$Frequency(midiNote, "midi").toFrequency();
        return frequency;
    }
    async init() {
        if (this.initPromise !== null) await this.initPromise;
        else {
            const { genie: genie  } = this;
            await genie.initialize();
            console.log("\uD83E\uDDDE‍♀️ ready!");
        }
    }
    getHandlers() {
        return {
            addPointer: this.addPointer.bind(this),
            updatePointer: this.updatePointer.bind(this),
            removePointer: this.removePointer.bind(this)
        };
    }
    getCellCoordinates(relX, relY) {
        const cellX = Math.floor(relX * this.numBeats);
        const cellY = Math.floor(relY * $ac42edad4610f0cf$var$NUM_BUTTONS);
        return {
            cellX: cellX,
            cellY: cellY
        };
    }
    addPointer(pe) {
        this.removePointer(pe);
        this.pane.addEventListener("pointermove", this.handlers.updatePointer);
        this.pane.setPointerCapture(pe.pointerId);
        const { relX: relX , relY: relY  } = (0, $826d2a65147a9c31$export$79263550b33b988b)(pe, this.pane);
        const { cellX: cellX , cellY: cellY  } = this.getCellCoordinates(relX, relY);
        this.pointers.set(pe.pointerId, {
            cellX: cellX,
            cellY: cellY
        });
        const { segments: segments  } = this;
        segments.isolate(cellX);
        segments.set(cellX, cellY);
        this.repaint();
    }
    updateAllowedPianoKeys() {
        this.allowedPianoKeys = $ac42edad4610f0cf$var$computeAllowedPianoKeys(this._minMidiNote, this._maxMidiNote);
    }
    updatePointer(pe) {
        if (pe.buttons === 0) return;
        const id = pe.pointerId;
        const { relX: relX , relY: relY  } = (0, $826d2a65147a9c31$export$79263550b33b988b)(pe, this.pane);
        const pointerData = this.pointers.get(id);
        (0, $6GFVM$strict)(typeof pointerData !== "undefined");
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
                if (cellY < 0 || cellY >= $ac42edad4610f0cf$var$NUM_BUTTONS) {
                    // out of y range
                    segments.isolate(cellX);
                    segments.set(cellX, -1);
                } else // within y range
                segments.set(cellX, cellY);
                this.repaint();
            }
        } else {
            // different x cell (possibly with some columns in between)
            const [previousSegmentIndex, segmentIndex] = this.connectCells(pointerData, {
                cellX: cellX,
                cellY: cellY
            });
            if (prevCellX !== -1 && cellX !== -1 && previousSegmentIndex !== segmentIndex) {
                if (prevCellX < cellX) segments.splitAfter(cellX);
                else segments.splitBefore(cellX);
            }
            this.repaint();
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
            if (y < 0 || y >= $ac42edad4610f0cf$var$NUM_BUTTONS) {
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
    clear() {
        this.segments.set(0, ...Array(this.segments.size).fill(-1));
        this._position = 0;
        this.repaint();
        this.genie.resetState();
    }
    repaint() {
        if (this.repaintTimer !== 0) {
            clearTimeout(this.repaintTimer);
            this.repaintTimer = 0;
        }
        const { canvas: canvas , context: context , canvasTargetSize: canvasTargetSize  } = this;
        if (canvas.width !== canvasTargetSize.width) canvas.width = canvasTargetSize.width;
        if (canvas.height !== canvasTargetSize.height) canvas.height = canvasTargetSize.height;
        context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this._showBar) this.paintBar();
        if (this._showGrid) {
            this.paintCells();
            this.paintGrid();
        }
        this.paintSegments();
    }
    scheduleRepaint() {
        if (this.repaintTimer === 0) this.repaintTimer = setTimeout(()=>this.repaint(), 0);
    }
    paintSegments() {
        const { segments: segments , canvas: canvas  } = this;
        // compute segments
        const controlPointsPerSegment = [];
        const stepX = canvas.width / segments.size;
        const stepY = canvas.height / $ac42edad4610f0cf$var$NUM_BUTTONS;
        let cellX = 0;
        for(let i = 0; i < segments.numSegments; i += 1){
            const segment = segments.getSegment(i);
            const controlPoints = [];
            (0, $6GFVM$strict)(typeof segment !== "undefined");
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
        const minCellDim = Math.min(canvas.height / $ac42edad4610f0cf$var$NUM_BUTTONS, canvas.width / segments.size);
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
                    const points = (0, $826d2a65147a9c31$export$cfd1427bc286eaca)(controlPoints, 0.35);
                    const firstPoint = points.shift();
                    (0, $6GFVM$strict)(typeof firstPoint !== "undefined");
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
        const { canvas: canvas , context: context , segments: segments  } = this;
        context.save();
        context.beginPath();
        context.strokeStyle = this.gridColor;
        const stepX = canvas.width / segments.size;
        for(let i = 1; i < segments.size; i += 1){
            const x = stepX * i;
            context.moveTo(x, 0);
            context.lineTo(x, canvas.height);
        }
        const stepY = canvas.height / $ac42edad4610f0cf$var$NUM_BUTTONS;
        for(let i1 = 1; i1 < $ac42edad4610f0cf$var$NUM_BUTTONS; i1 += 1){
            const y = stepY * i1;
            context.moveTo(0, y);
            context.lineTo(canvas.width, y);
        }
        context.stroke();
        context.closePath();
        context.restore();
    }
    paintCells() {
        const { canvas: canvas , context: context , segments: segments  } = this;
        context.save();
        context.beginPath();
        context.fillStyle = this.activeCellColor;
        const stepX = canvas.width / segments.size;
        const stepY = canvas.height / $ac42edad4610f0cf$var$NUM_BUTTONS;
        let cellX = 0;
        for(let i = 0; i < this.segments.numSegments; i += 1){
            const segment = this.segments.getSegment(i);
            (0, $6GFVM$strict)(typeof segment !== "undefined");
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
        const { canvas: canvas , context: context  } = this;
        context.save();
        context.fillStyle = this.barColor;
        const stepX = canvas.width / this.numBeats;
        const x = stepX * this._position;
        context.fillRect(x, 0, stepX, canvas.height);
        context.restore();
    }
    constructor(element, checkpoint, options = {}){
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "handlers", this.getHandlers());
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "element", void 0);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "pane", void 0);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "pointers", void 0);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "canvas", void 0);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "context", void 0);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "segments", new (0, $87a0a6ceb46ed965$export$2e2bcd8739ae039)($ac42edad4610f0cf$export$ba43bf67f3d48107.numBeats, ()=>-1));
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "_position", 0);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "genie", void 0);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "_volume", $ac42edad4610f0cf$export$ba43bf67f3d48107.volume);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "_mute", $ac42edad4610f0cf$export$ba43bf67f3d48107.mute);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "gain", void 0);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "_beatLength", $ac42edad4610f0cf$export$ba43bf67f3d48107.beatLength);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "_relativeNoteLength", $ac42edad4610f0cf$export$ba43bf67f3d48107.relativeNoteLength);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "_minMidiNote", $ac42edad4610f0cf$export$ba43bf67f3d48107.minMidiNote);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "_maxMidiNote", $ac42edad4610f0cf$export$ba43bf67f3d48107.maxMidiNote);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "allowedPianoKeys", []);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "resetStateOnLoop", $ac42edad4610f0cf$export$ba43bf67f3d48107.resetStateOnLoop);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "sustainInSegments", $ac42edad4610f0cf$export$ba43bf67f3d48107.sustainInSegments);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "slideInSegments", $ac42edad4610f0cf$export$ba43bf67f3d48107.slideInSegments);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "_showGrid", $ac42edad4610f0cf$export$ba43bf67f3d48107.showGrid);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "_showBar", $ac42edad4610f0cf$export$ba43bf67f3d48107.showBar);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "_gridColor", $ac42edad4610f0cf$export$ba43bf67f3d48107.gridColor);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "_barColor", $ac42edad4610f0cf$export$ba43bf67f3d48107.barColor);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "_activeCellColor", $ac42edad4610f0cf$export$ba43bf67f3d48107.activeCellColor);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "_dotColor", $ac42edad4610f0cf$export$ba43bf67f3d48107.dotColor);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "_relativeDotSize", $ac42edad4610f0cf$export$ba43bf67f3d48107.relativeDotSize);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "_lineColor", $ac42edad4610f0cf$export$ba43bf67f3d48107.lineColor);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "_relativeLineWidth", $ac42edad4610f0cf$export$ba43bf67f3d48107.relativeLineWidth);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "synthOptions", void 0);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "synthPool", void 0);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "synth", void 0);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "beatTimer", void 0);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "repaintTimer", void 0);
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "canvasTargetSize", {
            width: 0,
            height: 0
        });
        (0, $6GFVM$swchelperssrc_define_propertymjs)(this, "initPromise", null);
        const canvas = document.createElement("canvas");
        canvas.width = 0;
        canvas.height = 0;
        const context = canvas.getContext("2d");
        (0, $6GFVM$strict)(context !== null);
        const pane = document.createElement("div");
        pane.setAttribute("touch-action", "none"); // for Pointer Events Polyfill
        pane.classList.add((0, (/*@__PURE__*/$parcel$interopDefault($0b227a8ac7910066$exports))).pane);
        pane.addEventListener("pointerdown", this.handlers.addPointer);
        pane.addEventListener("pointerup", this.handlers.removePointer);
        pane.addEventListener("pointercancel", this.handlers.removePointer);
        pane.addEventListener("contextmenu", (event)=>event.preventDefault());
        pane.appendChild(canvas);
        while(element.firstChild)element.firstChild.remove();
        element.appendChild(pane);
        this.element = element;
        this.pane = pane;
        this.canvas = canvas;
        this.context = context;
        const resizeObserver = new $ac42edad4610f0cf$var$ResizeObserver((entries)=>{
            entries.forEach((entry)=>{
                const { width: width , height: height  } = entry.contentRect;
                this.canvasTargetSize = {
                    width: width,
                    height: height
                };
                this.scheduleRepaint();
            });
        });
        resizeObserver.observe(pane);
        this.pointers = new Map();
        this.genie = new (0, $6GFVM$PianoGenie)(checkpoint.href);
        this.gain = new $6GFVM$Gain(1).toDestination();
        this.synthOptions = $ac42edad4610f0cf$var$SYNTH_OPTIONS;
        this.synthPool = [];
        this.synth = null;
        this.beatTimer = 0;
        this.repaintTimer = 0;
        const optionsWithDefaults = {
            ...$ac42edad4610f0cf$export$ba43bf67f3d48107,
            ...options
        };
        Object.assign(this, optionsWithDefaults);
        this.repaint();
    }
}



var $da7e591f815ee7c7$export$2e2bcd8739ae039 = (0, $ac42edad4610f0cf$export$2e2bcd8739ae039);


export {$da7e591f815ee7c7$export$2e2bcd8739ae039 as default, $ac42edad4610f0cf$export$ba43bf67f3d48107 as defaultOptions};
//# sourceMappingURL=index.mjs.map
