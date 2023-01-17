/* eslint-disable no-console */
import { tf, PianoGenie } from '@magenta/music';
import * as Tone from 'tone';
import { strict as assert } from 'assert';

import classes from '../scss/synth-genie.module.scss';
import { getRelativePointerPosition, getCurvePoints, clamp } from './util';
import Segments from './segments';

tf.disableDeprecationWarnings();

const PIANO_GENIE_CHECKPOINT =
  'https://storage.googleapis.com/magentadata/js/checkpoints/piano_genie/model/epiano/stp_iq_auto_contour_dt_166006';

const LOWEST_PIANO_KEY_MIDI_NOTE = 21;
const NUM_BUTTONS = 8;

const SYNTH_OPTIONS: ConstructorParameters<typeof Tone.AMSynth>[0] = {
  volume: 0,
  detune: 0,
  portamento: 0,
  harmonicity: 2.5,
  oscillator: {
    phase: 0,
    type: 'fatsawtooth',
    count: 3,
    spread: 20,
  },
  envelope: {
    attack: 0.1,
    attackCurve: 'linear',
    decay: 0.2,
    decayCurve: 'exponential',
    release: 0.3,
    releaseCurve: 'exponential',
    sustain: 0.2,
  },
  modulation: {
    phase: 0,
    type: 'square',
  },
  modulationEnvelope: {
    attack: 0.5,
    attackCurve: 'linear',
    decay: 0.01,
    decayCurve: 'exponential',
    release: 0.5,
    releaseCurve: 'exponential',
    sustain: 1,
  },
};

function computeAllowedPianoKeys(minMidiNote: number, maxMidiNote: number) {
  assert(minMidiNote + 2 <= maxMidiNote);
  const keyMin = Math.max(0, minMidiNote - LOWEST_PIANO_KEY_MIDI_NOTE);
  const maxKey = Math.min(maxMidiNote - LOWEST_PIANO_KEY_MIDI_NOTE, 88 - 1);
  const numKeys = Math.max(0, maxKey - keyMin + 1);
  const keys = new Array(numKeys).fill(0).map((_, i) => keyMin + i);
  return keys;
}

const TEMPERATURE = 0.25;

const CANVAS_WIDTH = 512;
const CANVAS_HEIGHT = 256;

export type SynthGenieOptions = {
  resetStateOnLoop: boolean;

  sustainInSegments: boolean;

  slideInSegments: boolean;

  numBeats: number;

  mute: boolean;

  volume: number;

  pause: boolean;

  beatLength: number;

  relativeNoteLength: number;

  minMidiNote: number;

  maxMidiNote: number;

  showGrid: boolean;

  showBar: boolean;

  dotColor: string;

  relativeDotSize: number;

  lineColor: string;

  relativeLineWidth: number;
};

const defaultOptions: Readonly<SynthGenieOptions> = {
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
  dotColor: '#2c2c2c',
  relativeDotSize: 0.0,
  lineColor: '#2c2c2c',
  relativeLineWidth: 0.6,
};

type RenderingContext2D =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

type CellData = {
  cellX: number;
  cellY: number;
};

export default class SynthGenie<T extends Element> {
  protected handlers = this.getHandlers();

  public readonly element: T;

  protected pane: HTMLDivElement;

  protected pointers: Map<number, CellData>;

  protected canvas: HTMLCanvasElement;

  protected context: RenderingContext2D;

  protected segments: Segments<number> = new Segments(
    defaultOptions.numBeats,
    () => -1,
  );

  protected _position = 0;

  protected genie: PianoGenie;

  protected _volume: number = defaultOptions.volume;

  protected _mute: boolean = defaultOptions.mute;

  protected gain: Tone.Gain;

  protected _beatLength: number = defaultOptions.beatLength;

  protected _relativeNoteLength: number = defaultOptions.relativeNoteLength;

  protected _minMidiNote: number = defaultOptions.minMidiNote;

  protected _maxMidiNote: number = defaultOptions.maxMidiNote;

  protected allowedPianoKeys: number[] = [];

  public resetStateOnLoop: boolean = defaultOptions.resetStateOnLoop;

  public sustainInSegments: boolean = defaultOptions.sustainInSegments;

  public slideInSegments: boolean = defaultOptions.slideInSegments;

  protected _showGrid: boolean = defaultOptions.showGrid;

  protected _showBar: boolean = defaultOptions.showBar;

  protected _dotColor: string = defaultOptions.dotColor;

  protected _relativeDotSize: number = defaultOptions.relativeDotSize;

  protected _lineColor: string = defaultOptions.lineColor;

  protected _relativeLineWidth: number = defaultOptions.relativeLineWidth;

  protected synthOptions: ConstructorParameters<typeof Tone.AMSynth>[0];

  protected synthPool: Tone.AMSynth[];

  protected synth: Tone.AMSynth | null;

  protected beatTimer: ReturnType<typeof setInterval> | 0;

  protected repaintTimer: ReturnType<typeof setTimeout> | 0;

  protected constructor(element: T, options: Partial<SynthGenieOptions> = {}) {
    const canvas = document.createElement('canvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    const context = canvas.getContext('2d');
    assert(context !== null);

    const pane = document.createElement('div');
    pane.setAttribute('touch-action', 'none'); // for Pointer Events Polyfill
    pane.classList.add(classes.pane);
    pane.addEventListener('pointerdown', this.handlers.addPointer);
    pane.addEventListener('pointerup', this.handlers.removePointer);
    pane.addEventListener('pointercancel', this.handlers.removePointer);
    pane.addEventListener('contextmenu', (event) => event.preventDefault());
    pane.appendChild(canvas);

    while (element.firstChild) element.firstChild.remove();
    element.appendChild(pane);

    this.pane = pane;
    this.element = element;
    this.canvas = canvas;
    this.context = context;

    this.pointers = new Map();

    this.genie = new PianoGenie(PIANO_GENIE_CHECKPOINT);
    this.gain = new Tone.Gain(1).toDestination();

    this.synthOptions = SYNTH_OPTIONS;
    this.synthPool = [];
    this.synth = null;
    this.beatTimer = 0;
    this.repaintTimer = 0;

    const optionsWithDefaults = { ...defaultOptions, ...options };
    Object.assign(this, optionsWithDefaults);
    this.repaint();
  }

  static async create<T extends Element>(
    element: T,
    options: Partial<SynthGenieOptions> = {},
  ) {
    const synthGenie = new SynthGenie<T>(element, options);
    const pauseState = synthGenie.pause;
    // do not start playback before everything is initialized
    synthGenie.pause = true;
    await synthGenie.init();
    synthGenie.pause = pauseState;

    return synthGenie;
  }

  get numBeats(): number {
    return this.segments.size;
  }

  set numBeats(b: number) {
    this.segments.resize(Math.max(1, Math.floor(b)));
  }

  get position(): number {
    return this._position;
  }

  set position(p: number) {
    this._position = clamp(Math.floor(p), 0, this.segments.size - 1);
  }

  protected updateGain() {
    this.gain.gain.linearRampTo(this.mute ? 0 : this.volume, 0.1);
  }

  get mute(): boolean {
    return this._mute;
  }

  set mute(m: boolean) {
    this._mute = m;
    this.updateGain();
  }

  get volume(): number {
    return this._volume;
  }

  set volume(v: number) {
    this._volume = Math.max(0, v);
    this.updateGain();
  }

  get beatLength(): number {
    return this._beatLength;
  }

  set beatLength(l: number) {
    const pauseState = this.pause;
    this.pause = true;
    this._beatLength = Math.max(0, l);
    this.pause = pauseState;
  }

  get relativeNoteLength(): number {
    return this._relativeNoteLength;
  }

  set relativeNoteLength(l: number) {
    this._relativeNoteLength = Math.max(0, l);
  }

  get minMidiNote(): number {
    return this._minMidiNote;
  }

  set minMidiNote(n: number) {
    this._minMidiNote = clamp(n, 0, 127 - 2);
    this._maxMidiNote = Math.max(this._minMidiNote + 2, this._maxMidiNote);
    this.updateAllowedPianoKeys();
  }

  get maxMidiNote(): number {
    return this._maxMidiNote;
  }

  set maxMidiNote(n: number) {
    this._maxMidiNote = clamp(n, 2, 127);
    this._minMidiNote = Math.min(this._minMidiNote, this._maxMidiNote - 2);
    this.updateAllowedPianoKeys();
  }

  get showGrid(): boolean {
    return this._showGrid;
  }

  set showGrid(val: boolean) {
    this._showGrid = val;
    this.scheduleRepaint();
  }

  get showBar(): boolean {
    return this._showBar;
  }

  set showBar(val: boolean) {
    this._showBar = val;
    this.scheduleRepaint();
  }

  get dotColor(): string {
    return this._dotColor;
  }

  set dotColor(c: string) {
    this._dotColor = c;
    this.scheduleRepaint();
  }

  get relativeDotSize(): number {
    return this._relativeDotSize;
  }

  set relativeDotSize(s: number) {
    this._relativeDotSize = Math.max(0, s);
    this.scheduleRepaint();
  }

  get lineColor(): string {
    return this._lineColor;
  }

  set lineColor(c: string) {
    this._lineColor = c;
    this.scheduleRepaint();
  }

  get relativeLineWidth(): number {
    return this._relativeLineWidth;
  }

  set relativeLineWidth(w: number) {
    this._relativeLineWidth = Math.max(0, w);
    this.scheduleRepaint();
  }

  get(): SynthGenieOptions {
    return Object.fromEntries(
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      Object.keys(defaultOptions).map((key) => [key, this[key] as unknown]),
    ) as SynthGenieOptions;
  }

  set(options: Partial<SynthGenieOptions>) {
    Object.assign(this, options);
  }

  get pause(): boolean {
    return this.beatTimer !== 0;
  }

  set pause(pause: boolean) {
    if (pause && this.beatTimer !== 0) {
      // pause
      clearTimeout(this.beatTimer);
      clearInterval(this.beatTimer);
      this.beatTimer = 0;
      if (this.synth !== null) {
        this.releaseAndFreeSynth(this.synth, 0);
        this.synth = null;
      }
    } else if (!pause && this.beatTimer === 0) {
      // play
      this.beatTimer = setTimeout(() => {
        this.beatTimer = setInterval(() => this.playBeat(), this.beatLength);
      }, 0);
    }
  }

  protected playBeat() {
    const { genie } = this;

    if (this._position >= this.segments.size) {
      this._position = 0;
      if (this.resetStateOnLoop) genie.resetState();
    }

    const { segment, indexInSegment } = this.segments.getSegmentOf(
      this._position,
    );
    const cell = segment[indexInSegment];
    assert(typeof cell !== 'undefined');

    if (this.synth !== null && cell === -1) {
      // note still ringing, but shouldn't (grid values changed)
      this.releaseAndFreeSynth(this.synth, 0);
      this.synth = null;
    }

    if (cell !== -1) {
      const frequency = this.getGenieFrequency(cell);

      const attack =
        this.synth === null || indexInSegment === 0 || !this.sustainInSegments;
      const release =
        indexInSegment === segment.length - 1 || !this.sustainInSegments;

      this.synth = this.synth ?? this.synthPool.pop() ?? this.createSynth();

      const noteDuration = (this._beatLength * this._relativeNoteLength) / 1000;

      if (attack || !this.slideInSegments) {
        // attack
        this.synth.triggerAttack(frequency);
      } else {
        // ramp to next note frequency
        this.synth.frequency.exponentialRampTo(frequency, noteDuration * 0.1);
      }
      if (release) {
        // release note at the end of this cell
        this.releaseAndFreeSynth(this.synth, noteDuration);
        this.synth = null;
      }
    }

    this.repaint();

    this._position += 1;
  }

  createSynth() {
    return new Tone.AMSynth(this.synthOptions).connect(this.gain);
  }

  releaseAndFreeSynth(synth: Tone.AMSynth, seconds: number) {
    synth.triggerRelease(Tone.now() + seconds);
    const releaseDuration = Tone.Time(synth.envelope.release).toSeconds();
    const toneDuration = seconds + releaseDuration;
    setTimeout(() => this.synthPool.push(synth), toneDuration * 1000);
  }

  getGenieFrequency(cell: number) {
    const genieButton = NUM_BUTTONS - 1 - cell;
    const pianoKey = this.genie.nextFromKeyList(
      genieButton,
      this.allowedPianoKeys,
      TEMPERATURE,
    );
    const midiNote = LOWEST_PIANO_KEY_MIDI_NOTE + pianoKey;
    const frequency = Tone.Frequency(midiNote, 'midi').toFrequency();
    return frequency;
  }

  async init() {
    const { genie } = this;
    await genie.initialize();
    console.log('🧞‍♀️ ready!');
  }

  protected getHandlers() {
    return {
      addPointer: this.addPointer.bind(this),
      updatePointer: this.updatePointer.bind(this),
      removePointer: this.removePointer.bind(this),
    };
  }

  getCellCoordinates(relX: number, relY: number) {
    const cellX = Math.floor(relX * this.numBeats);
    const cellY = Math.floor(relY * NUM_BUTTONS);
    return { cellX, cellY };
  }

  protected addPointer(pe: PointerEvent) {
    this.removePointer(pe);
    this.pane.addEventListener('pointermove', this.handlers.updatePointer);
    this.pane.setPointerCapture(pe.pointerId);

    const { relX, relY } = getRelativePointerPosition(pe, this.pane);
    const { cellX, cellY } = this.getCellCoordinates(relX, relY);
    this.pointers.set(pe.pointerId, { cellX, cellY });

    const { segments } = this;
    segments.isolate(cellX);
    segments.set(cellX, cellY);

    this.repaint();
  }

  protected updateAllowedPianoKeys() {
    this.allowedPianoKeys = computeAllowedPianoKeys(
      this._minMidiNote,
      this._maxMidiNote,
    );
  }

  protected updatePointer(pe: PointerEvent) {
    if (pe.buttons === 0) return;

    const id = pe.pointerId;
    const { relX, relY } = getRelativePointerPosition(pe, this.pane);
    const pointerData = this.pointers.get(id);
    assert(typeof pointerData !== 'undefined');
    const { cellX: prevCellX, cellY: prevCellY } = pointerData;

    const { cellX, cellY } = this.getCellCoordinates(relX, relY);
    this.pointers.set(id, { cellX, cellY });

    const { segments } = this;
    if (prevCellX === cellX) {
      // same x cell
      if (prevCellY !== cellY) {
        // different y cell
        if (cellY < 0 || cellY >= NUM_BUTTONS) {
          // out of y range
          segments.isolate(cellX);
          segments.set(cellX, -1);
        } else {
          // within y range
          segments.set(cellX, cellY);
        }
        this.repaint();
      }
    } else {
      // different x cell (possibly with some columns in between)
      const [previousSegmentIndex, segmentIndex] = this.connectCells(
        pointerData,
        { cellX, cellY },
      );
      if (
        prevCellX !== -1 &&
        cellX !== -1 &&
        previousSegmentIndex !== segmentIndex
      ) {
        if (prevCellX < cellX) {
          segments.splitAfter(cellX);
        } else {
          segments.splitBefore(cellX);
        }
      }
      this.repaint();
    }
  }

  protected connectCells(first: CellData, second: CellData): [number, number] {
    if (second.cellX < first.cellX) {
      const [secondSegmentIndex, firstSegmentIndex] = this.connectCells(
        second,
        first,
      );
      return [firstSegmentIndex, secondSegmentIndex];
    }

    const { cellX: x0, cellY: y0 } = first;
    const { cellX: x1, cellY: y1 } = second;

    const slope = (y1 - y0) / (x1 - x0);

    const { segments } = this;
    const [firstSegmentIndex, secondSegmentIndex] = segments.join(x0, x1);

    const clampedX0 = Math.min(segments.size - 1, Math.max(x0, 0));
    const clampedX1 = Math.min(segments.size - 1, Math.max(x1, 0));
    for (let x = clampedX0; x <= clampedX1; x += 1) {
      const y = Math.floor(y0 + slope * (x - x0));
      if (y < 0 || y >= NUM_BUTTONS) {
        // make it possible to disable columns by dragging them out of the y range
        segments.isolate(x);
        segments.set(x, -1);
      } else {
        segments.set(x, y);
      }
    }

    return [firstSegmentIndex, secondSegmentIndex];
  }

  protected removePointer(pe: PointerEvent) {
    const id = pe.pointerId;

    this.pointers.delete(id);

    if (this.pointers.size === 0)
      this.pane.removeEventListener('pointermove', this.handlers.updatePointer);
  }

  public clear() {
    this.segments.set(0, ...Array<number>(this.segments.size).fill(-1));
    this._position = 0;
    this.repaint();
    this.genie.resetState();
  }

  public repaint() {
    clearTimeout(this.repaintTimer);
    this.repaintTimer = 0;
    this.context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    if (this._showBar) {
      this.paintBar();
    }
    if (this._showGrid) {
      this.paintCells();
      this.paintGrid();
    }

    this.paintSegments();
  }

  public scheduleRepaint() {
    if (this.repaintTimer !== 0) {
      this.repaintTimer = setTimeout(() => this.repaint(), 0);
    }
  }

  protected paintSegments() {
    const { segments } = this;

    // compute segments
    const controlPointsPerSegment: { x: number; y: number }[][] = [];
    const stepX = CANVAS_WIDTH / segments.size;
    const stepY = CANVAS_HEIGHT / NUM_BUTTONS;
    let cellX = 0;
    for (let i = 0; i < segments.numSegments; i += 1) {
      const segment = segments.getSegment(i);
      const controlPoints: { x: number; y: number }[] = [];
      assert(typeof segment !== 'undefined');
      for (let j = 0; j < segment.length; j += 1) {
        const cellY = segment[j];
        if (cellY >= 0) {
          const x = stepX * (0.5 + cellX);
          const y = stepY * (0.5 + cellY);
          controlPoints.push({ x, y });
        }
        cellX += 1;
      }
      controlPointsPerSegment.push(controlPoints);
    }

    const minCellDim = Math.min(
      CANVAS_HEIGHT / NUM_BUTTONS,
      CANVAS_WIDTH / segments.size,
    );

    const { context, relativeDotSize, dotColor, relativeLineWidth, lineColor } =
      this;

    context.save();
    const dotRadius = minCellDim * relativeDotSize * 0.5;
    if (dotRadius > 0) {
      context.fillStyle = dotColor;
      controlPointsPerSegment.forEach((controlPoints) =>
        controlPoints.forEach(({ x, y }) => {
          context.beginPath();
          context.ellipse(x, y, dotRadius, dotRadius, 0, 0, 2 * Math.PI);
          context.closePath();
          context.fill();
        }),
      );
    }

    const lineWidth = minCellDim * relativeLineWidth;
    if (lineWidth > 0) {
      context.beginPath();
      context.strokeStyle = lineColor;
      context.lineWidth = lineWidth;
      context.lineCap = 'round';
      context.lineJoin = 'round';
      controlPointsPerSegment.forEach((controlPoints) => {
        if (controlPoints.length === 1) {
          const [{ x, y }] = controlPoints;
          context.moveTo(x, y);
          context.lineTo(x, y);
        } else if (controlPoints.length === 2) {
          const [{ x: x0, y: y0 }, { x: x1, y: y1 }] = controlPoints;
          context.moveTo(x0, y0);
          context.lineTo(x1, y1);
        } else if (controlPoints.length >= 3) {
          const points = getCurvePoints(controlPoints, 0.35);
          const firstPoint = points.shift();
          assert(typeof firstPoint !== 'undefined');

          context.moveTo(firstPoint.x, firstPoint.y);
          points.forEach(({ x, y }) => context.lineTo(x, y));
        }
      });
      context.stroke();
      context.closePath();
    }
    context.restore();
  }

  protected paintGrid() {
    const { context, segments } = this;

    context.save();
    context.beginPath();
    context.strokeStyle = '#b3b2b2';
    const stepX = CANVAS_WIDTH / segments.size;
    for (let i = 1; i < segments.size; i += 1) {
      const x = stepX * i;
      context.moveTo(x, 0);
      context.lineTo(x, CANVAS_HEIGHT);
    }
    const stepY = CANVAS_HEIGHT / NUM_BUTTONS;
    for (let i = 1; i < NUM_BUTTONS; i += 1) {
      const y = stepY * i;
      context.moveTo(0, y);
      context.lineTo(CANVAS_WIDTH, y);
    }
    context.stroke();
    context.closePath();
    context.restore();
  }

  protected paintCells() {
    const { context, segments } = this;

    context.save();
    context.beginPath();
    context.fillStyle = '#b3b2b2';
    const stepX = CANVAS_WIDTH / segments.size;
    const stepY = CANVAS_HEIGHT / NUM_BUTTONS;
    let cellX = 0;
    for (let i = 0; i < this.segments.numSegments; i += 1) {
      const segment = this.segments.getSegment(i);
      assert(typeof segment !== 'undefined');
      for (let j = 0; j < segment.length; j += 1) {
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

  protected paintBar() {
    const { context } = this;

    context.save();
    context.fillStyle = 'rgba(211,211,211,0.4)';
    const stepX = CANVAS_WIDTH / this.numBeats;
    const x = stepX * this._position;
    context.fillRect(x, 0, stepX, CANVAS_WIDTH);
    context.restore();
  }
}

export { defaultOptions };
