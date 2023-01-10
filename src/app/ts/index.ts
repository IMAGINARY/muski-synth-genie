import { tf, PianoGenie, Player, SoundFontPlayer } from '@magenta/music';

import HelloWorld from '../../lib/ts/index';

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

const composition = Array(16)
  .fill(0)
  .map(() => Math.floor(Math.random() * 9));

const TEMPERATURE = 0.25;

async function main() {
  const player = new SoundFontPlayer(
    'https://storage.googleapis.com/magentadata/js/soundfonts/sgm_plus',
  );

  await player.loadSamples({ notes: keyWhitelist.map((pitch) => ({ pitch })) });

  const genie = new PianoGenie(CONSTANTS.GENIE_CHECKPOINT);

  await genie.initialize();
  console.log('🧞‍♀️ ready!');

  const note = genie.nextFromKeyList(0, keyWhitelist, TEMPERATURE);
  genie.resetState();

  let pos = 0;
  let button = 3;
  window.stopPlaying = false;
  const nextNote = () => {
    if (window.stopPlaying) return;
    setTimeout(nextNote, 250 * (1 + (Math.random() * 0.4 - 0.2)));
    //    if (Math.random() * 4 < 1) return;

    //    button = (8 + button + (Math.random() >= 0.5 ? 1 : -1)) % 8;
    pos += 1;
    if (pos === composition.length) {
      pos = 0;
      console.log('loop');
    }
    button = composition[pos];
    if (button === 8) return;
    const pitch = genie.nextFromKeyList(button, keyWhitelist, TEMPERATURE);
    console.log(button, pitch);
    player.playNoteDown({ pitch });
    //    setTimeout(() => player.playNoteUp({ pitch }), 200);
  };
  setTimeout(nextNote, 250);
  window.nextNote = nextNote;
}

main().catch(() => {});
