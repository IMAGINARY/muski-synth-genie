import { strict as assert } from 'assert';

import SynthGenieWithControls from './synth-genie-with-controls';

async function main() {
  const outer = document.getElementById('synth-genie');
  assert(outer !== null);
  await SynthGenieWithControls.create(outer);
}

main().catch(() => {});
