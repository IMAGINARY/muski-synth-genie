import { strict as assert } from 'assert';
// eslint-disable-next-line import/no-extraneous-dependencies
import * as Tone from 'tone';

import SynthGenie, { SynthGenieOptions } from '../../lib/ts';

export default class SynthGenieWithControls extends SynthGenie {
  constructor(element: Element, options: Partial<SynthGenieOptions> = {}) {
    super(element, options);
    this.initControls();
  }

  static async create(
    element: Element,
    options: Partial<SynthGenieOptions> = {},
  ) {
    const synthGenie = new SynthGenieWithControls(element, options);
    await synthGenie.init();
    return synthGenie;
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
    const handleNumNotesChange = () => {
      numNotesLabel.innerText = numNotesSlider.value;
      this.numNotes = numNotesSlider.valueAsNumber;
      this.segments.resize(this.numNotes);
      this.position = 0;
      this.updateGrid();
      this.genie.resetState();
    };
    handleNumNotesChange();
    numNotesSlider.addEventListener('input', handleNumNotesChange);

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
      const wasPlaying = this.isPlaying();
      this.pause();
      if (wasPlaying) this.play();
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

    const { handleMinMidiNoteChange, handleMaxMidiNoteChange } = (() => ({
      handleMinMidiNoteChange: () => {
        const midiNote = minMidiNoteSlider.valueAsNumber;
        const noteName = Tone.Frequency(midiNote, 'midi').toNote();
        minMidiNoteLabel.innerText = `${noteName} (MIDI ${midiNote})`;
        this.minMidiNote = minMidiNoteSlider.valueAsNumber;
        if (maxMidiNoteSlider.valueAsNumber < midiNote + 2) {
          maxMidiNoteSlider.valueAsNumber = midiNote + 2;
          handleMaxMidiNoteChange();
        }
        this.updateAllowedPianoKeys();
      },
      handleMaxMidiNoteChange: () => {
        const midiNote = maxMidiNoteSlider.valueAsNumber;
        const noteName = Tone.Frequency(midiNote, 'midi').toNote();
        maxMidiNoteLabel.innerText = `${noteName} (MIDI ${midiNote})`;
        this.maxMidiNote = midiNote;
        if (minMidiNoteSlider.valueAsNumber > midiNote - 2) {
          minMidiNoteSlider.valueAsNumber = midiNote - 2;
          handleMinMidiNoteChange();
        }
        this.updateAllowedPianoKeys();
      },
    }))();
    handleMinMidiNoteChange();
    handleMaxMidiNoteChange();
    minMidiNoteSlider.addEventListener('input', handleMinMidiNoteChange);
    maxMidiNoteSlider.addEventListener('input', handleMaxMidiNoteChange);

    const resetStateCheckBox =
      this.element.ownerDocument.querySelector<HTMLInputElement>(
        '#reset-state-checkbox',
      );
    assert(resetStateCheckBox !== null);
    const handleResetStateChange = () => {
      this.resetStateOnLoop = resetStateCheckBox.checked;
    };
    handleResetStateChange();
    resetStateCheckBox.addEventListener('input', handleResetStateChange);

    const gridActiveCheckBox =
      this.element.ownerDocument.querySelector<HTMLInputElement>(
        '#grid-active-checkbox',
      );
    assert(gridActiveCheckBox !== null);
    const handleGridActiveChange = () => {
      this.showGrid = gridActiveCheckBox.checked;
      this.updateGrid();
    };
    handleGridActiveChange();
    gridActiveCheckBox.addEventListener('input', handleGridActiveChange);

    const barVisibleCheckBox =
      this.element.ownerDocument.querySelector<HTMLInputElement>(
        '#bar-visible-checkbox',
      );
    assert(barVisibleCheckBox !== null);
    const handleBarVisibleChange = () => {
      this.showBar = barVisibleCheckBox.checked;
      this.updateGrid();
    };
    handleBarVisibleChange();
    barVisibleCheckBox.addEventListener('input', handleBarVisibleChange);

    const sustainInSegmentsCheckBox =
      this.element.ownerDocument.querySelector<HTMLInputElement>(
        '#sustain-in-segments-checkbox',
      );
    assert(sustainInSegmentsCheckBox !== null);
    const handleSustainInSegmentsChange = () => {
      this.sustainInSegments = sustainInSegmentsCheckBox.checked;
    };
    handleSustainInSegmentsChange();
    sustainInSegmentsCheckBox.addEventListener(
      'input',
      handleSustainInSegmentsChange,
    );

    const slideInSegmentsCheckBox =
      this.element.ownerDocument.querySelector<HTMLInputElement>(
        '#slide-in-segments-checkbox',
      );
    assert(slideInSegmentsCheckBox !== null);
    const handleSlideInSegmentsChange = () => {
      this.slideInSegments = slideInSegmentsCheckBox.checked;
      const wasPlaying = this.isPlaying();
      this.pause();
      if (wasPlaying) this.play();
    };
    handleSlideInSegmentsChange();
    slideInSegmentsCheckBox.addEventListener(
      'input',
      handleSlideInSegmentsChange,
    );

    const muteCheckBox =
      this.element.ownerDocument.querySelector<HTMLInputElement>(
        '#mute-checkbox',
      );
    assert(muteCheckBox !== null);
    const handleMuteChange = () => {
      const mute = muteCheckBox.checked;
      this.gain.gain.linearRampTo(mute ? 0 : 1, 0.1);
    };
    handleMuteChange();
    muteCheckBox.addEventListener('input', handleMuteChange);

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

    const playPauseButton =
      this.element.ownerDocument.querySelector<HTMLInputElement>(
        '#play-pause-button',
      );
    assert(playPauseButton !== null);

    const handlePlayPauseClicked = () => {
      if (this.isPlaying()) {
        this.pause();
        playPauseButton.value = 'Play';
      } else {
        this.play();
        playPauseButton.value = 'Pause';
      }
    };
    playPauseButton.addEventListener('click', handlePlayPauseClicked);
  }
}
