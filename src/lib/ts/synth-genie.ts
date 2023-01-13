import { tf, PianoGenie } from '@magenta/music';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as Tone from 'tone';
import { strict as assert } from 'assert';

import classes from '../scss/canvas.module.scss';
import { getRelativePointerPosition, getCurvePoints } from './util';
import Segments from './segments';

window.Segments = Segments;

tf.disableDeprecationWarnings();

const CONSTANTS = {
  COLORS: [
    '#EE2B29',
    '#ff9800',
    '#ffff00',
    '#c6ff00',
    '#00e5ff',
    '#2979ff',
    '#651fff',
    '#d500f9',
  ],
  NUM_BUTTONS: 8,
  NOTES_PER_OCTAVE: 12,
  WHITE_NOTES_PER_OCTAVE: 7,
  LOWEST_PIANO_KEY_MIDI_NOTE: 21,
  GENIE_CHECKPOINT: 'https://imaginary.github.io/piano-genie/model/genie',
};

const NUM_NOTES = 16;
const NUM_BUTTONS = CONSTANTS.NUM_BUTTONS;
const NOTE_DURATION_MS = 250;

const MINOR = [0, 2, 3, 5, 7, 8, 10];
const MAJOR = [0, 2, 4, 5, 7, 9, 11];
const CHROMATIC = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const SCALE = CHROMATIC;

const ROOT_NOTE = CONSTANTS.LOWEST_PIANO_KEY_MIDI_NOTE;
const OCTAVES = 7;
const totalNotes = CONSTANTS.NOTES_PER_OCTAVE * OCTAVES;
const keyWhitelist: number[] = [];
for (let octave = 0; octave < OCTAVES; octave += 1) {
  const offset = ROOT_NOTE + octave * 12;
  const degreesInOctave = SCALE.map((degree) => offset + degree);
  keyWhitelist.push(...degreesInOctave);
}
console.log(keyWhitelist);

function computeAllowedNotes(minMidiNote: number, maxMidiNote: number) {
  const numNotes = Math.max(0, maxMidiNote - minMidiNote);
  const notes = new Array(numNotes).fill(0).map((_, i) => minMidiNote + i);
  return notes;
}

const TEMPERATURE = 0.25;

const CANVAS_WIDTH = 512;
const CANVAS_HEIGHT = 256;

export type SynthGenieOptions = Record<string, unknown>;

const defaultOptions: Readonly<SynthGenieOptions> = {};

type RenderingContext2D =
  | CanvasRenderingContext2D
  | OffscreenCanvasRenderingContext2D;

export default class SynthGenie {
  protected readonly _options: SynthGenieOptions;

  protected handlers = this.getHandlers();

  protected element: Element;

  protected pane: HTMLDivElement;

  protected pointers: Map<number, { x: number; y: number; cellX: number }>;

  protected layers: HTMLDivElement;

  protected gridLayer: HTMLCanvasElement;

  protected segmentLayer: HTMLCanvasElement;

  protected segments: Segments<number>;

  protected numNotes: number;

  protected position: number;

  protected loopCount: number;

  protected genie: PianoGenie;

  protected beatLength: number;

  protected relativeNoteLength: number;

  protected minMidiNote: number;

  protected maxMidiNote: number;

  protected allowedNotes: number[];

  protected resetStateOnLoop: boolean;

  protected showGrid: boolean;

  protected showBar: boolean;

  protected constructor(
    element: Element,
    options: Partial<SynthGenieOptions> = {},
  ) {
    this._options = { ...defaultOptions, ...options };

    this.numNotes = NUM_NOTES;
    this.segments = new Segments(this.numNotes, () => -1);
    this.position = 0;
    this.loopCount = 0;
    this.resetStateOnLoop = true;
    this.showGrid = true;
    this.showBar = true;
    this.beatLength = 250;
    this.relativeNoteLength = 1.0;
    this.minMidiNote = 21;
    this.maxMidiNote = 21 + 12 * 7;
    this.allowedNotes = computeAllowedNotes(this.maxMidiNote, this.maxMidiNote);

    const gridLayer = document.createElement('canvas');
    gridLayer.width = CANVAS_WIDTH;
    gridLayer.height = CANVAS_HEIGHT;

    const segmentLayer = document.createElement('canvas');
    segmentLayer.width = CANVAS_WIDTH;
    segmentLayer.height = CANVAS_HEIGHT;

    const layers = document.createElement('div');
    layers.classList.add(classes.layers);
    layers.appendChild(gridLayer);
    layers.appendChild(segmentLayer);

    const pane = document.createElement('div');
    pane.setAttribute('touch-action', 'none'); // for Pointer Events Polyfill
    pane.classList.add(classes.pane);
    pane.addEventListener('pointerdown', this.handlers.addPointer);
    pane.addEventListener('pointerup', this.handlers.removePointer);
    pane.addEventListener('pointercancel', this.handlers.removePointer);
    pane.addEventListener('contextmenu', (event) => event.preventDefault());
    pane.appendChild(layers);

    while (element.firstChild) element.firstChild.remove();
    element.appendChild(pane);

    this.pane = pane;
    this.element = element;
    this.layers = layers;
    this.gridLayer = gridLayer;
    this.segmentLayer = segmentLayer;

    this.pointers = new Map();

    this.genie = new PianoGenie(CONSTANTS.GENIE_CHECKPOINT);

    this.updateGrid();
  }

  protected initControls() {
    const numNotesLabel =
      this.element.ownerDocument.querySelector<HTMLInputElement>(
        '#num-notes-label',
      );
    assert(numNotesLabel !== null);

    const numNotesSlider =
      this.element.ownerDocument.querySelector<HTMLInputElement>(
        '#num-notes-slider',
      );
    assert(numNotesSlider !== null);
    numNotesLabel.innerText = numNotesSlider.value;
    numNotesSlider.addEventListener('input', () => {
      numNotesLabel.innerText = numNotesSlider.value;
      this.numNotes = numNotesSlider.valueAsNumber;
      this.segments.resize(this.numNotes);
      this.position = 0;
      this.updateGrid();
      this.genie.resetState();
    });

    const beatLengthLabel =
      this.element.ownerDocument.querySelector<HTMLInputElement>(
        '#beat-length-label',
      );
    assert(beatLengthLabel !== null);

    const beatLengthSlider =
      this.element.ownerDocument.querySelector<HTMLInputElement>(
        '#beat-length-slider',
      );
    assert(beatLengthSlider !== null);
    const handleBeatLengthChange = () => {
      beatLengthLabel.innerText = `${beatLengthSlider.value}ms`;
      this.beatLength = beatLengthSlider.valueAsNumber;
    };
    handleBeatLengthChange();
    beatLengthSlider.addEventListener('input', handleBeatLengthChange);

    const noteLengthLabel =
      this.element.ownerDocument.querySelector<HTMLInputElement>(
        '#note-length-label',
      );
    assert(noteLengthLabel !== null);

    const noteLengthSlider =
      this.element.ownerDocument.querySelector<HTMLInputElement>(
        '#note-length-slider',
      );
    assert(noteLengthSlider !== null);
    const handleNoteLengthChange = () => {
      noteLengthLabel.innerText = `${noteLengthSlider.value}%`;
      this.relativeNoteLength = noteLengthSlider.valueAsNumber / 100;
    };
    handleNoteLengthChange();
    noteLengthSlider.addEventListener('input', handleNoteLengthChange);

    const minMidiNoteLabel =
      this.element.ownerDocument.querySelector<HTMLSpanElement>(
        '#min-midi-note-label',
      );
    assert(minMidiNoteLabel !== null);
    const minMidiNoteSlider =
      this.element.ownerDocument.querySelector<HTMLInputElement>(
        '#min-midi-note-slider',
      );
    assert(minMidiNoteSlider !== null);

    const maxMidiNoteLabel =
      this.element.ownerDocument.querySelector<HTMLSpanElement>(
        '#max-midi-note-label',
      );
    assert(maxMidiNoteLabel !== null);
    const maxMidiNoteSlider =
      this.element.ownerDocument.querySelector<HTMLInputElement>(
        '#max-midi-note-slider',
      );
    assert(maxMidiNoteSlider !== null);

    const handleMinMidiNoteChange = () => {
      const midiNote = minMidiNoteSlider.valueAsNumber;
      const noteName = Tone.Frequency(midiNote, 'midi').toNote();
      minMidiNoteLabel.innerText = `${noteName} (MIDI ${midiNote})`;
      this.minMidiNote = minMidiNoteSlider.valueAsNumber;
      if (maxMidiNoteSlider.valueAsNumber < midiNote + 2) {
        maxMidiNoteSlider.valueAsNumber = midiNote + 2;
        handleMaxMidiNoteChange();
      }
      this.allowedNotes = computeAllowedNotes(
        this.minMidiNote,
        this.maxMidiNote,
      );
    };
    handleMinMidiNoteChange();
    minMidiNoteSlider.addEventListener('input', handleMinMidiNoteChange);
    const handleMaxMidiNoteChange = () => {
      const midiNote = maxMidiNoteSlider.valueAsNumber;
      const noteName = Tone.Frequency(midiNote, 'midi').toNote();
      maxMidiNoteLabel.innerText = `${noteName} (MIDI ${midiNote})`;
      this.maxMidiNote = midiNote;
      if (minMidiNoteSlider.valueAsNumber > midiNote - 2) {
        minMidiNoteSlider.valueAsNumber = midiNote - 2;
        handleMinMidiNoteChange();
      }
      this.allowedNotes = computeAllowedNotes(
        this.minMidiNote,
        this.maxMidiNote,
      );
    };
    handleMaxMidiNoteChange();
    maxMidiNoteSlider.addEventListener('input', handleMaxMidiNoteChange);

    const resetStateCheckBox =
      this.element.ownerDocument.querySelector<HTMLInputElement>(
        '#reset-state-checkbox',
      );
    assert(resetStateCheckBox !== null);
    resetStateCheckBox.addEventListener('input', () => {
      this.resetStateOnLoop = resetStateCheckBox.checked;
    });

    const gridActiveCheckBox =
      this.element.ownerDocument.querySelector<HTMLInputElement>(
        '#grid-active-checkbox',
      );
    assert(gridActiveCheckBox !== null);
    gridActiveCheckBox.addEventListener('input', () => {
      this.showGrid = gridActiveCheckBox.checked;
      this.updateGrid();
    });

    const barVisibleCheckBox =
      this.element.ownerDocument.querySelector<HTMLInputElement>(
        '#bar-visible-checkbox',
      );
    assert(barVisibleCheckBox !== null);
    barVisibleCheckBox.addEventListener('input', () => {
      this.showBar = barVisibleCheckBox.checked;
      this.updateGrid();
    });

    const clearButton =
      this.element.ownerDocument.querySelector<HTMLInputElement>(
        '#clear-button',
      );
    assert(clearButton !== null);
    clearButton.addEventListener('click', () => {
      this.numNotes = numNotesSlider.valueAsNumber;
      this.segments.set(0, ...Array<number>(this.segments.size).fill(-1));
      this.position = 0;
      this.updateGrid();
      this.genie.resetState();
    });
  }

  static async create(
    element: Element,
    options: Partial<SynthGenieOptions> = {},
  ) {
    const synthGenie = new SynthGenie(element, options);
    synthGenie.initControls();
    await synthGenie.init();
    return synthGenie;
  }

  async init() {
    const { genie } = this;
    await genie.initialize();
    console.log('🧞‍♀️ ready!');

    const getGenieFrequency = (cell: number) => {
      const genieButton = NUM_BUTTONS - 1 - cell;
      const pitch = genie.nextFromKeyList(
        genieButton,
        this.allowedNotes,
        TEMPERATURE,
      );
      //        this.player.playNoteDown({ pitch });
      const frequency = Tone.Frequency(pitch, 'midi').toFrequency();
      return frequency;
    };

    const envelopeOptions = {
      attack: 0.01,
      attackCurve: 'exponential',
      decay: 0.01,
      decayCurve: 'exponential',
      release: 0.5,
      releaseCurve: 'exponential',
      sustain: 0.9,
    };
    const synthOptions = { envelope: envelopeOptions };

    console.log(new Tone.AMSynth(synthOptions).toDestination());

    let numSynth = 1;
    const createSynth = () => {
      numSynth += 1;
      console.log(`Synth pool size: ${synthPool.length} (created:${numSynth})`);
      return new Tone.AMSynth(synthOptions).toDestination();
    };

    const synthPool: Tone.AMSynth[] = [];
    const releaseAndFreeSynth = (synth: Tone.AMSynth, seconds: number) => {
      synth.triggerRelease(Tone.now() + seconds);
      const releaseDuration = Tone.Time(synth.envelope.release).toSeconds();
      const toneDuration = seconds + releaseDuration;
      setTimeout(() => synthPool.push(synth), toneDuration * 1000);
    };

    let synth: Tone.AMSynth | null = null;
    const nextNote = () => {
      const { segment, indexInSegment } = this.segments.getSegmentOf(
        this.position,
      );
      const cell = segment[indexInSegment];
      assert(typeof cell !== 'undefined');

      if (synth !== null && cell === -1) {
        // note still ringing, but shouldn't (grid values changed)
        releaseAndFreeSynth(synth, 0);
        synth = null;
      }

      if (cell !== -1) {
        const frequency = getGenieFrequency(cell);

        const attack = synth === null || indexInSegment === 0;
        const release = indexInSegment === segment.length - 1;

        synth = synth ?? synthPool.pop() ?? createSynth();

        if (attack) {
          // attack
          synth.triggerAttack(frequency);
        } else {
          // ramp to next note frequency
          synth.frequency.exponentialRampTo(frequency, 50 / 1000);
        }
        if (release) {
          // release note at the end of this cell
          const noteDuration =
            (this.beatLength * this.relativeNoteLength) / 1000;
          releaseAndFreeSynth(synth, noteDuration);
          synth = null;
        }
      }

      this.updateGrid();

      this.position += 1;
      if (this.position === this.segments.size) {
        this.position = 0;
        this.loopCount += 1;
        if (this.resetStateOnLoop) genie.resetState();
      }
      setTimeout(nextNote, this.beatLength);
    };
    nextNote();
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

    const { x, y, relX, relY } = getRelativePointerPosition(pe, this.pane);

    const { cellX } = this.getCellCoordinates(relX, relY);
    this.segments.split(cellX);
    this.segments.split(cellX + 1);

    this.pointers.set(pe.pointerId, { x, y, cellX });

    this.updatePointer(pe);
  }

  protected updatePointer(pe: PointerEvent) {
    if (pe.buttons === 0) return;

    const id = pe.pointerId;
    const { x, y, relX, relY } = getRelativePointerPosition(pe, this.pane);
    const pointerData = this.pointers.get(id);
    assert(typeof pointerData !== 'undefined');
    const { x: prevX, y: prevY } = pointerData;

    const { numNotes } = this;
    const { cellX, cellY } = this.getCellCoordinates(relX, relY);
    this.pointers.set(id, { x, y, cellX });
    if (cellX >= 0 && cellX < this.numNotes) {
      // TODO: all cell on the connecting line should be activated, e.g. when pointer is moved quickly
      this.segments.set(cellX, cellY >= 0 && cellY < NUM_BUTTONS ? cellY : -1);
      const { cellX: prevCellX } = pointerData;
      if (prevCellX !== cellX) {
        const { segmentIndex: prevSegmentIndex } =
          this.segments.findSegmentIndex(prevCellX);
        const { segmentIndex } = this.segments.findSegmentIndex(cellX);
        if (prevSegmentIndex !== segmentIndex) {
          this.segments.isolate(cellX);
          this.segments.join(prevCellX < cellX ? cellX : prevCellX);
        }
      }
      this.updateGrid();
    }
  }

  protected removePointer(pe: PointerEvent) {
    const id = pe.pointerId;

    this.pointers.delete(id);

    if (this.pointers.size === 0)
      this.pane.removeEventListener('pointermove', this.handlers.updatePointer);
  }

  protected updateGrid() {
    const gridLayerContext = this.gridLayer.getContext('2d');
    assert(gridLayerContext !== null);
    gridLayerContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    if (this.showBar) {
      SynthGenie.paintBar(gridLayerContext, this.position, this.numNotes);
    }
    if (this.showGrid) {
      SynthGenie.paintCells(gridLayerContext, this.segments, this.numNotes);
      SynthGenie.paintGrid(gridLayerContext, this.numNotes);
    }

    const segmentLayerContext = this.gridLayer.getContext('2d');
    assert(segmentLayerContext !== null);
    SynthGenie.paintSegments(segmentLayerContext, this.segments, this.numNotes);
  }

  protected static paintSegments(
    context: RenderingContext2D,
    segments: Segments<number>,
    numNotes: number,
  ) {
    // compute segments
    const controlPointsPerSegment: { x: number; y: number }[][] = [];
    const stepX = CANVAS_WIDTH / numNotes;
    const stepY = CANVAS_HEIGHT / CONSTANTS.NUM_BUTTONS;
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

    context.save();
    context.beginPath();
    context.strokeStyle = 'red';
    context.lineWidth = 10;
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
    context.restore();
  }

  protected static paintGrid(context: RenderingContext2D, numNotes: number) {
    context.save();
    context.beginPath();
    context.strokeStyle = 'lightblue';
    const stepX = CANVAS_WIDTH / numNotes;
    for (let i = 1; i < numNotes; i += 1) {
      const x = stepX * i;
      context.moveTo(x, 0);
      context.lineTo(x, CANVAS_HEIGHT);
    }
    const stepY = CANVAS_HEIGHT / CONSTANTS.NUM_BUTTONS;
    for (let i = 1; i < CONSTANTS.NUM_BUTTONS; i += 1) {
      const y = stepY * i;
      context.moveTo(0, y);
      context.lineTo(CANVAS_WIDTH, y);
    }
    context.stroke();
    context.closePath();
    context.restore();
  }

  protected static paintCells(
    context: RenderingContext2D,
    segments: Segments<number>,
    numNotes: number,
  ) {
    context.save();
    context.beginPath();
    context.fillStyle = '#6fbbd3';
    const stepX = CANVAS_WIDTH / numNotes;
    const stepY = CANVAS_HEIGHT / CONSTANTS.NUM_BUTTONS;
    let cellX = 0;
    for (let i = 0; i < segments.numSegments; i += 1) {
      const segment = segments.getSegment(i);
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

  protected static paintBar(
    context: RenderingContext2D,
    pos: number,
    numNotes: number,
  ) {
    context.save();
    context.fillStyle = '#add8e6';
    const stepX = CANVAS_WIDTH / numNotes;
    const x = stepX * pos;
    context.fillRect(x, 0, stepX, CANVAS_WIDTH);
    context.restore();
  }
}

export { defaultOptions };
