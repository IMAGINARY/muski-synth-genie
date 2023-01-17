import { strict as assert } from 'assert';
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
    const document = this.element.ownerDocument;

    const numNotesLabel =
      document.querySelector<HTMLSpanElement>('#num-notes-label');
    assert(numNotesLabel !== null);

    const numNotesSlider =
      document.querySelector<HTMLInputElement>('#num-notes-slider');
    assert(numNotesSlider !== null);
    numNotesLabel.innerText = numNotesSlider.value;
    const handleNumNotesChange = () => {
      numNotesLabel.innerText = numNotesSlider.value;
      this.numBeats = numNotesSlider.valueAsNumber;
    };
    handleNumNotesChange();
    numNotesSlider.addEventListener('input', handleNumNotesChange);

    const beatLengthLabel =
      document.querySelector<HTMLSpanElement>('#beat-length-label');
    assert(beatLengthLabel !== null);

    const beatLengthSlider = document.querySelector<HTMLInputElement>(
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
      document.querySelector<HTMLSpanElement>('#note-length-label');
    assert(noteLengthLabel !== null);

    const noteLengthSlider = document.querySelector<HTMLInputElement>(
      '#note-length-slider',
    );
    assert(noteLengthSlider !== null);
    const handleNoteLengthChange = () => {
      noteLengthLabel.innerText = `${noteLengthSlider.value}%`;
      this.relativeNoteLength = noteLengthSlider.valueAsNumber / 100;
    };
    handleNoteLengthChange();
    noteLengthSlider.addEventListener('input', handleNoteLengthChange);

    const minMidiNoteLabel = document.querySelector<HTMLSpanElement>(
      '#min-midi-note-label',
    );
    assert(minMidiNoteLabel !== null);
    const minMidiNoteSlider = document.querySelector<HTMLInputElement>(
      '#min-midi-note-slider',
    );
    assert(minMidiNoteSlider !== null);

    const maxMidiNoteLabel = document.querySelector<HTMLSpanElement>(
      '#max-midi-note-label',
    );
    assert(maxMidiNoteLabel !== null);
    const maxMidiNoteSlider = document.querySelector<HTMLInputElement>(
      '#max-midi-note-slider',
    );
    assert(maxMidiNoteSlider !== null);

    const handleMinMaxMidiNoteChange = (e?: Event) => {
      if (typeof e !== 'undefined') {
        if (e.target !== maxMidiNoteSlider) {
          this.minMidiNote = minMidiNoteSlider.valueAsNumber;
        }
        if (e.target !== minMidiNoteSlider) {
          this.maxMidiNote = maxMidiNoteSlider.valueAsNumber;
        }
      }

      const { minMidiNote, maxMidiNote } = this;
      minMidiNoteSlider.value = `${minMidiNote}`;
      maxMidiNoteSlider.value = `${maxMidiNote}`;
      const minNoteName = Tone.Frequency(minMidiNote, 'midi').toNote();
      const maxNoteName = Tone.Frequency(maxMidiNote, 'midi').toNote();
      minMidiNoteLabel.innerText = `${minNoteName} (MIDI ${minMidiNote})`;
      maxMidiNoteLabel.innerText = `${maxNoteName} (MIDI ${maxMidiNote})`;
    };
    handleMinMaxMidiNoteChange();
    minMidiNoteSlider.addEventListener('input', handleMinMaxMidiNoteChange);
    maxMidiNoteSlider.addEventListener('input', handleMinMaxMidiNoteChange);

    const resetStateCheckBox = document.querySelector<HTMLInputElement>(
      '#reset-state-checkbox',
    );
    assert(resetStateCheckBox !== null);
    const handleResetStateChange = () => {
      this.resetStateOnLoop = resetStateCheckBox.checked;
    };
    handleResetStateChange();
    resetStateCheckBox.addEventListener('input', handleResetStateChange);

    const gridActiveCheckBox = document.querySelector<HTMLInputElement>(
      '#grid-active-checkbox',
    );
    assert(gridActiveCheckBox !== null);
    const handleGridActiveChange = () => {
      this.showGrid = gridActiveCheckBox.checked;
    };
    handleGridActiveChange();
    gridActiveCheckBox.addEventListener('input', handleGridActiveChange);

    const barVisibleCheckBox = document.querySelector<HTMLInputElement>(
      '#bar-visible-checkbox',
    );
    assert(barVisibleCheckBox !== null);
    const handleBarVisibleChange = () => {
      this.showBar = barVisibleCheckBox.checked;
    };
    handleBarVisibleChange();
    barVisibleCheckBox.addEventListener('input', handleBarVisibleChange);

    const sustainInSegmentsCheckBox = document.querySelector<HTMLInputElement>(
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

    const slideInSegmentsCheckBox = document.querySelector<HTMLInputElement>(
      '#slide-in-segments-checkbox',
    );
    assert(slideInSegmentsCheckBox !== null);
    const handleSlideInSegmentsChange = () => {
      this.slideInSegments = slideInSegmentsCheckBox.checked;
    };
    handleSlideInSegmentsChange();
    slideInSegmentsCheckBox.addEventListener(
      'input',
      handleSlideInSegmentsChange,
    );

    const muteCheckBox =
      document.querySelector<HTMLInputElement>('#mute-checkbox');
    assert(muteCheckBox !== null);
    const handleMuteChange = () => {
      this.mute = muteCheckBox.checked;
    };
    handleMuteChange();
    muteCheckBox.addEventListener('input', handleMuteChange);

    const clearButton =
      document.querySelector<HTMLInputElement>('#clear-button');
    assert(clearButton !== null);
    clearButton.addEventListener('click', () => this.clear());

    const playPauseButton =
      document.querySelector<HTMLInputElement>('#play-pause-button');
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
