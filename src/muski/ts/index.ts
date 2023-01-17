import { strict as assert } from 'assert';
import SynthGenie, { SynthGenieOptions, defaultOptions } from '../../lib/ts';
import {
  camelCaseToDashCase,
  dashCaseToCamelCase,
  isFulfilled,
  isRejected,
  id,
} from './util';

function migrateDataAttribute<T>(
  o: Record<string, unknown>,
  key: string,
  e: HTMLElement,
  coerce: (s: string) => T,
) {
  const attributeValue = e.dataset[key];
  if (typeof attributeValue !== 'undefined') {
    // eslint-disable-next-line no-param-reassign
    o[key] = coerce(attributeValue);
  }
}

const attrCoercionMap = new Map<string, (s: string) => unknown>();

attrCoercionMap.set('resetStateOnLoop', () => true);
attrCoercionMap.set('sustainInSegments', () => true);
attrCoercionMap.set('slideInSegments', () => true);
attrCoercionMap.set('numBeats', Number.parseInt);
attrCoercionMap.set('mute', () => true);
attrCoercionMap.set('volume', Number.parseFloat);
attrCoercionMap.set('pause', () => true);
attrCoercionMap.set('beatLength', Number.parseFloat);
attrCoercionMap.set('relativeNoteLength', Number.parseFloat);
attrCoercionMap.set('minMidiNote', Number.parseInt);
attrCoercionMap.set('maxMidiNote', Number.parseInt);
attrCoercionMap.set('showGrid', () => true);
attrCoercionMap.set('showBar', () => true);
attrCoercionMap.set('dotColor', id<string>);
attrCoercionMap.set('relativeDotSize', Number.parseFloat);
attrCoercionMap.set('lineColor', id<string>);
attrCoercionMap.set('relativeLineWidth', Number.parseFloat);

const thereminAttrNames = [...attrCoercionMap.keys()].map(
  (k) => `data-${camelCaseToDashCase(k)}`,
);
const toneAttrNames = [...attrCoercionMap.keys()].map(
  (k) => `data-${camelCaseToDashCase(k)}`,
);
const attrNames = [...thereminAttrNames, ...toneAttrNames];

function getCheckpointUrl(e: HTMLElement): URL {
  const errorMsgExt =
    'must contain URL to the PianoGenie TensorFlow model checkpoint';
  const checkpoint = e.getAttribute('data-checkpoint');
  if (checkpoint === null)
    throw new Error(`data-checkpoint attribute missing (${errorMsgExt})`);

  try {
    return new URL(checkpoint, window.location.href);
  } catch (_) {
    throw new Error(
      `data-checkpoint attribute contains invalid URL (${errorMsgExt})`,
    );
  }
}

async function initMuskiSynthGenieComponentNoCheck<T extends HTMLElement>(
  e: T,
): Promise<SynthGenie<T>> {
  const m = migrateDataAttribute;

  const checkpoint = getCheckpointUrl(e);
  const synthGenie = await SynthGenie.create(e, checkpoint, {});

  const o: Partial<SynthGenieOptions> = {};
  [...attrCoercionMap.entries()].forEach(([attr, coerce]) =>
    m(o, attr, e, coerce),
  );
  synthGenie.set(o);

  const synthGenieAttrObserver = new MutationObserver((mutations) => {
    const options: Partial<SynthGenieOptions> = {};
    mutations.forEach((mutation) => {
      if (mutation.attributeName !== null) {
        const camelCaseAttrName = dashCaseToCamelCase(
          mutation.attributeName.replace(/^data-/, ''),
        ) as keyof SynthGenieOptions;
        const newValue = e.getAttribute(mutation.attributeName);
        if (newValue !== null) {
          // attribute added or changed
          if (newValue !== mutation.oldValue) {
            const coerce = attrCoercionMap.get(camelCaseAttrName);
            assert(typeof coerce !== 'undefined');

            const partialOptions: Partial<SynthGenieOptions> = {
              [camelCaseAttrName]: coerce(newValue),
            };
            Object.assign(options, partialOptions);
          }
        } else {
          // attribute removed
          const partialOptions: Partial<SynthGenieOptions> = {
            [camelCaseAttrName]: defaultOptions[camelCaseAttrName],
          };
          Object.assign(options, partialOptions);
        }
      }
    });
    synthGenie.set(options);
  });

  synthGenieAttrObserver.observe(e, {
    attributeFilter: attrNames,
    attributes: true,
    attributeOldValue: true,
  });

  const synthGenieClearObserver = new MutationObserver(() => {
    if (e.hasAttribute('data-clear')) {
      synthGenie.clear();
      e.removeAttribute('data-clear');
    }
  });

  synthGenieClearObserver.observe(e, {
    attributeFilter: ['data-clear'],
    attributes: true,
    attributeOldValue: true,
  });

  Object.assign(e, { synthGenie });

  return synthGenie;
}

const muskiSynthGenieComponents = new Map<
  HTMLElement,
  SynthGenie<HTMLElement>
>();

async function initMuskiSynthGenieComponent<T extends HTMLElement>(
  e: T,
): Promise<SynthGenie<T>> {
  return (
    (muskiSynthGenieComponents.get(e) as SynthGenie<T>) ??
    (await initMuskiSynthGenieComponentNoCheck<T>(e))
  );
}

async function initMuskiSynthGenieComponents(): Promise<
  SynthGenie<HTMLElement>[]
> {
  const elements = [
    ...document.querySelectorAll<HTMLElement>(
      '*[data-component="muski-synth-genie"]',
    ),
  ];
  const uninitializedElements = elements.filter(
    (e) => !muskiSynthGenieComponents.has(e),
  );

  const initResults = await Promise.allSettled(
    uninitializedElements.map(initMuskiSynthGenieComponentNoCheck),
  );

  const rejected = initResults.filter(isRejected);
  // eslint-disable-next-line no-console
  rejected.forEach(({ reason }) => console.error(reason));

  const fulfilled = initResults.filter(isFulfilled);
  fulfilled.forEach(({ value }) =>
    muskiSynthGenieComponents.set(value.element, value),
  );

  return [...muskiSynthGenieComponents.values()];
}

// eslint-disable-next-line no-console
initMuskiSynthGenieComponents().catch((err) => console.error(err));

export { initMuskiSynthGenieComponent, initMuskiSynthGenieComponents };
