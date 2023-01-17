/* eslint-disable no-param-reassign */
import { strict as assert } from 'assert';
import * as Tone from 'tone';

import SynthGenie from '../../lib/ts';
import { initMuskiSynthGenieComponent } from '../../muski/ts';

function initControls(synthGenie: SynthGenie<Element>) {
  const { element } = synthGenie;
  const document = element.ownerDocument;

  const numNotesLabel =
    document.querySelector<HTMLSpanElement>('#num-notes-label');
  assert(numNotesLabel !== null);

  const numNotesSlider =
    document.querySelector<HTMLInputElement>('#num-notes-slider');
  assert(numNotesSlider !== null);
  numNotesLabel.innerText = numNotesSlider.value;
  const handleNumNotesChange = () => {
    numNotesLabel.innerText = numNotesSlider.value;
    element.setAttribute('data-num-beats', numNotesSlider.value);
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
    element.setAttribute('data-beat-length', beatLengthSlider.value);
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
    element.setAttribute(
      'data-relative-note-length',
      `${noteLengthSlider.valueAsNumber / 100}`,
    );
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
        element.setAttribute('data-min-midi-note', minMidiNoteSlider.value);
      }
      if (e.target !== minMidiNoteSlider) {
        element.setAttribute('data-max-midi-note', maxMidiNoteSlider.value);
      }
    }

    const { minMidiNote, maxMidiNote } = synthGenie;
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
    if (resetStateCheckBox.checked)
      element.setAttribute('data-reset-state-on-loop', '');
    else element.removeAttribute('data-reset-state-on-loop');
  };
  handleResetStateChange();
  resetStateCheckBox.addEventListener('input', handleResetStateChange);

  const gridActiveCheckBox = document.querySelector<HTMLInputElement>(
    '#grid-active-checkbox',
  );
  assert(gridActiveCheckBox !== null);
  const handleGridActiveChange = () => {
    if (gridActiveCheckBox.checked) element.setAttribute('data-show-grid', '');
    else element.removeAttribute('data-show-grid');
  };
  handleGridActiveChange();
  gridActiveCheckBox.addEventListener('input', handleGridActiveChange);

  const barVisibleCheckBox = document.querySelector<HTMLInputElement>(
    '#bar-visible-checkbox',
  );
  assert(barVisibleCheckBox !== null);
  const handleBarVisibleChange = () => {
    if (barVisibleCheckBox.checked) element.setAttribute('data-show-bar', '');
    else element.removeAttribute('data-show-bar');
  };
  handleBarVisibleChange();
  barVisibleCheckBox.addEventListener('input', handleBarVisibleChange);

  const sustainInSegmentsCheckBox = document.querySelector<HTMLInputElement>(
    '#sustain-in-segments-checkbox',
  );
  assert(sustainInSegmentsCheckBox !== null);
  const handleSustainInSegmentsChange = () => {
    if (sustainInSegmentsCheckBox.checked)
      element.setAttribute('data-sustain-in-segments', '');
    else element.removeAttribute('data-sustain-in-segments');
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
    if (slideInSegmentsCheckBox.checked)
      element.setAttribute('data-slide-in-segments', '');
    else element.removeAttribute('data-slide-in-segments');
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
    if (muteCheckBox.checked) element.setAttribute('data-mute', '');
    else element.removeAttribute('data-mute');
  };
  handleMuteChange();
  muteCheckBox.addEventListener('input', handleMuteChange);

  const clearButton = document.querySelector<HTMLInputElement>('#clear-button');
  assert(clearButton !== null);
  clearButton.addEventListener('click', () => synthGenie.clear());

  const playPauseButton =
    document.querySelector<HTMLInputElement>('#play-pause-button');
  assert(playPauseButton !== null);

  const handlePlayPauseClicked = () => {
    if (element.hasAttribute('data-pause')) {
      element.removeAttribute('data-pause');
      playPauseButton.value = 'Pause';
    } else {
      element.setAttribute('data-pause', '');
      playPauseButton.value = 'Play';
    }
  };
  playPauseButton.addEventListener('click', handlePlayPauseClicked);
}

async function main() {
  const element = document.querySelector<HTMLDivElement>('#synth-genie');
  assert(element !== null);

  const synthGenie = await initMuskiSynthGenieComponent(element);
  initControls(synthGenie);
}

main().catch(() => {});
