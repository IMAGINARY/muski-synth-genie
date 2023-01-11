import { strict as assert } from 'assert';
import SynthGenie from '../../lib/ts/synth-genie';

async function main() {
  const outer = document.getElementById('synth-genie');
  assert(outer !== null);
  const synthGenie = await SynthGenie.create(outer);
}

main().catch(() => {});
