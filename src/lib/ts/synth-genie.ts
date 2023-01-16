/* eslint-disable no-console */
import { tf, PianoGenie } from '@magenta/music';
import * as Tone from 'tone';
import { strict as assert } from 'assert';

import classes from '../scss/synth-genie.module.scss';
import { getRelativePointerPosition, getCurvePoints } from './util';
import Segments from './segments';

tf.disableDeprecationWarnings();

const PIANO_GENIE_CHECKPOINT =
  'https://storage.googleapis.com/magentadata/js/checkpoints/piano_genie/model/epiano/stp_iq_auto_contour_dt_166006';

const LOWEST_PIANO_KEY_MIDI_NOTE = 21;
const NUM_BEATS = 16;
const NUM_BUTTONS = 8;

const exponentialEnvelopeCurve: Tone.EnvelopeCurve = 'exponential';
const envelopeOptions = {
  attack: 0.01,
  attackCurve: exponentialEnvelopeCurve,
  decay: 0.01,
  decayCurve: exponentialEnvelopeCurve,
  release: 0.5,
  releaseCurve: exponentialEnvelopeCurve,
  sustain: 0.9,
};
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
  assert(minMidiNote < maxMidiNote);
  const keyMin = Math.max(0, minMidiNote - LOWEST_PIANO_KEY_MIDI_NOTE);
  const maxKey = Math.min(maxMidiNote - LOWEST_PIANO_KEY_MIDI_NOTE, 88 - 1);
  const numKeys = Math.max(0, maxKey - keyMin + 1);
  const keys = new Array(numKeys).fill(0).map((_, i) => keyMin + i);
  console.log(keys);
  return keys;
}

const TEMPERATURE = 0.25;

const CANVAS_WIDTH = 512;
const CANVAS_HEIGHT = 256;

export type SynthGenieOptions = Record<string, unknown>;

const defaultOptions: Readonly<SynthGenieOptions> = {};

type RenderingContext2D =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

type CellData = {
  cellX: number;
  cellY: number;
};

export default class SynthGenie {
  protected readonly _options: SynthGenieOptions;

  protected handlers = this.getHandlers();

  protected element: Element;

  protected pane: HTMLDivElement;

  protected pointers: Map<number, CellData>;

  protected canvas: HTMLCanvasElement;

  protected context: RenderingContext2D;

  protected segments: Segments<number>;

  protected numNotes: number;

  protected position: number;

  protected loopCount: number;

  protected genie: PianoGenie;

  protected gain: Tone.Gain;

  protected beatLength: number;

  protected relativeNoteLength: number;

  protected minMidiNote: number;

  protected maxMidiNote: number;

  protected allowedPianoKeys: number[];

  protected resetStateOnLoop: boolean;

  protected sustainInSegments: boolean;

  protected slideInSegments: boolean;

  protected showGrid: boolean;

  protected showBar: boolean;

  protected dotColor: string;

  protected relativeDotSize: number;

  protected lineColor: string;

  protected relativeLineWidth: number;

  protected synthOptions: ConstructorParameters<typeof Tone.AMSynth>[0];

  protected synthPool: Tone.AMSynth[];

  protected synth: Tone.AMSynth | null;

  protected timer: ReturnType<typeof setInterval> | 0;

  protected constructor(
    element: Element,
    options: Partial<SynthGenieOptions> = {},
  ) {
    console.log('Starting');
    this._options = { ...defaultOptions, ...options };

    this.numNotes = NUM_BEATS;
    this.segments = new Segments(this.numNotes, () => -1);
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
    this.maxMidiNote = 21 + 88 - 1;
    this.dotColor = '#2c2c2c';
    this.relativeDotSize = 0.0;
    this.lineColor = '#2c2c2c';
    this.relativeLineWidth = 0.6;
    this.allowedPianoKeys = computeAllowedPianoKeys(
      this.minMidiNote,
      this.maxMidiNote,
    );
    console.log('Starting 2');

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
    this.timer = 0;

    this.updateGrid();
  }

  static async create(
    element: Element,
    options: Partial<SynthGenieOptions> = {},
  ) {
    const synthGenie = new SynthGenie(element, options);
    await synthGenie.init();
    return synthGenie;
  }

  play() {
    if (this.timer === 0) {
      const { beatLength } = this;
      this.timer = setTimeout(() => {
        this.timer = setInterval(() => this.playBeat(), beatLength);
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

  protected playBeat() {
    const { genie } = this;

    const { segment, indexInSegment } = this.segments.getSegmentOf(
      this.position,
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

      const noteDuration = (this.beatLength * this.relativeNoteLength) / 1000;

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

    this.updateGrid();

    this.position += 1;
    if (this.position === this.segments.size) {
      this.position = 0;
      this.loopCount += 1;
      if (this.resetStateOnLoop) genie.resetState();
    }
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

    this.play();
  }

  getOptions() {
    return { ...this._options };
  }

  applyOptions(o: Partial<SynthGenieOptions>) {
    Object.assign(this._options, o);
  }

  protected getHandlers() {
    return {
      addPointer: this.addPointer.bind(this),
      updatePointer: this.updatePointer.bind(this),
      removePointer: this.removePointer.bind(this),
    };
  }

  getCellCoordinates(relX: number, relY: number) {
    const cellX = Math.floor(relX * this.numNotes);
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

    this.updateGrid();
  }

  protected updateAllowedPianoKeys() {
    this.allowedPianoKeys = computeAllowedPianoKeys(
      this.minMidiNote,
      this.maxMidiNote,
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
        this.updateGrid();
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
      this.updateGrid();
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

  protected updateGrid() {
    this.context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    if (this.showBar) {
      this.paintBar();
    }
    if (this.showGrid) {
      this.paintCells();
      this.paintGrid();
    }

    this.paintSegments();
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
    const stepX = CANVAS_WIDTH / this.numNotes;
    const x = stepX * this.position;
    context.fillRect(x, 0, stepX, CANVAS_WIDTH);
    context.restore();
  }
}

export { defaultOptions };
