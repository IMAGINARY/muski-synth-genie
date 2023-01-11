import { tf, PianoGenie, Player, SoundFontPlayer } from '@magenta/music';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as Tone from 'tone';
import { strict as assert } from 'assert';

import classes from '../scss/canvas.module.scss';
import { getRelativePointerPosition, setPosition } from './util';

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
  GENIE_CHECKPOINT:
    'https://storage.googleapis.com/magentadata/js/checkpoints/piano_genie/model/epiano/stp_iq_auto_contour_dt_166006',
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

  protected pointers: Map<number, { x: number; y: number }>;

  protected layers: HTMLDivElement;

  protected gridLayer: HTMLCanvasElement;

  protected paintLayer: HTMLCanvasElement;

  protected activatedCells: number[];

  protected numNotes: number;

  protected position: number;

  protected loopCount: number;

  protected genie: PianoGenie;

  protected player: SoundFontPlayer;

  protected synth: Tone.AMSynth;

  protected resetStateOnLoop: boolean;

  protected showGrid: boolean;

  protected showBar: boolean;

  protected constructor(
    element: Element,
    options: Partial<SynthGenieOptions> = {},
  ) {
    this._options = { ...defaultOptions, ...options };

    this.numNotes = NUM_NOTES;
    this.activatedCells = new Array<number>(this.numNotes).fill(-1);
    this.position = 0;
    this.loopCount = 0;
    this.resetStateOnLoop = true;
    this.showGrid = true;
    this.showBar = true;

    const gridLayer = document.createElement('canvas');
    gridLayer.width = CANVAS_WIDTH;
    gridLayer.height = CANVAS_HEIGHT;

    const paintLayer = document.createElement('canvas');
    paintLayer.width = CANVAS_WIDTH;
    paintLayer.height = CANVAS_HEIGHT;

    const layers = document.createElement('div');
    layers.classList.add(classes.layers);
    layers.appendChild(gridLayer);
    layers.appendChild(paintLayer);

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
    this.paintLayer = paintLayer;

    this.pointers = new Map();

    this.genie = new PianoGenie(CONSTANTS.GENIE_CHECKPOINT);
    this.player = new SoundFontPlayer(
      'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus',
    );
    this.synth = new Tone.AMSynth().toDestination();

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
      this.activatedCells.length = this.numNotes;
      this.activatedCells.fill(-1);
      this.position = 0;
      this.clearPaintLayer();
      this.updateGrid();
      this.genie.resetState();
    });

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
      this.activatedCells.length = this.numNotes;
      this.activatedCells.fill(-1);
      this.position = 0;
      this.clearPaintLayer();
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
    await this.player.loadSamples({
      notes: keyWhitelist.map((pitch) => ({ pitch })),
    });

    const { genie } = this;
    await genie.initialize();
    console.log('🧞‍♀️ ready!');

    genie.overrideDeltaTime(NOTE_DURATION_MS);

    setInterval(() => {
      const cell = this.activatedCells[this.position];
      if (cell !== -1) {
        const pitch = genie.nextFromKeyList(cell, keyWhitelist, TEMPERATURE);
        //        this.player.playNoteDown({ pitch });
        const frequency = Tone.Frequency(pitch, 'midi').toFrequency();
        this.synth.triggerAttackRelease(
          frequency,
          (0.75 * NOTE_DURATION_MS) / 1000,
        );
      }

      this.updateGrid();

      this.position += 1;
      if (this.position === this.activatedCells.length) {
        this.position = 0;
        this.loopCount += 1;
        if (this.resetStateOnLoop) genie.resetState();
        console.log('loop');
      }
    }, NOTE_DURATION_MS);
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

  protected addPointer(pe: PointerEvent) {
    this.removePointer(pe);
    this.pane.addEventListener('pointermove', this.handlers.updatePointer);

    this.pane.setPointerCapture(pe.pointerId);

    const { x, y } = getRelativePointerPosition(pe, this.pane);

    this.pointers.set(pe.pointerId, { x, y });

    this.updatePointer(pe);
  }

  protected updatePointer(pe: PointerEvent) {
    if (pe.buttons === 0) return;

    const id = pe.pointerId;
    const { x, y, relX, relY } = getRelativePointerPosition(pe, this.pane);
    const pos = this.pointers.get(id);
    assert(typeof pos !== 'undefined');
    const { x: prevX, y: prevY } = pos;

    const context = this.paintLayer.getContext('2d');
    assert(context !== null);
    context.save();
    context.beginPath();
    context.moveTo(prevX, prevY);
    context.lineTo(x, y);
    context.stroke();
    context.closePath();
    context.restore();

    this.pointers.set(id, { x, y });

    const { numNotes } = this;
    const cellX = Math.floor(relX * numNotes);
    const cellY = Math.floor(relY * NUM_BUTTONS);
    if (cellX >= 0 && cellX < this.numNotes) {
      this.activatedCells[cellX] =
        cellY >= 0 && cellY < NUM_BUTTONS ? cellY : -1;
      this.updateGrid();
    }
  }

  protected removePointer(pe: PointerEvent) {
    const id = pe.pointerId;

    this.pointers.delete(id);

    if (this.pointers.size === 0)
      this.pane.removeEventListener('pointermove', this.handlers.updatePointer);
  }

  protected clearPaintLayer() {
    const paintLayerContext = this.paintLayer.getContext('2d');
    assert(paintLayerContext !== null);
    paintLayerContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  }

  protected updateGrid() {
    const gridLayerContext = this.gridLayer.getContext('2d');
    assert(gridLayerContext !== null);
    gridLayerContext.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    if (this.showBar) {
      SynthGenie.paintBar(gridLayerContext, this.position, this.numNotes);
    }
    if (this.showGrid) {
      SynthGenie.paintCells(
        gridLayerContext,
        this.activatedCells,
        this.numNotes,
      );
      SynthGenie.paintGrid(gridLayerContext, this.numNotes);
    }
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
    cells: number[],
    numNotes: number,
  ) {
    context.save();
    context.beginPath();
    context.fillStyle = '#6fbbd3';
    const stepX = CANVAS_WIDTH / numNotes;
    const stepY = CANVAS_HEIGHT / CONSTANTS.NUM_BUTTONS;
    for (let i = 0; i < cells.length; i += 1) {
      if (cells[i] >= 0) {
        const x = stepX * i;
        const y = stepY * cells[i];
        context.rect(x, y, stepX, stepY);
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
