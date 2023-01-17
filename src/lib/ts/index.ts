import SynthGenie from './synth-genie';
import type {
  // Workaround because TypeScript currently can't re-export types via "export * from '...'"
  SynthGenieOptions as ISynthGenieOptions,
} from './synth-genie';

export * from './synth-genie';
export default SynthGenie;

export type SynthGenieOptions = ISynthGenieOptions;
