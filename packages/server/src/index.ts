import type { HookServices, ServerRuntime } from '@tailor-cms/cek-common';
import { initState, mocks, type } from '@tailor-cms/ce-fill-blank-manifest';
import type { Element } from '@tailor-cms/ce-fill-blank-manifest';
import every from 'lodash/every.js';
import omit from 'lodash/omit.js';

// Detect if hooks are running in CEK (used for mocking end-system runtime)
const IS_CEK = process.env.CEK_RUNTIME;
// Don't use in production, use only when IS_CEK=true
const USER_STATE: any = {};

/* eslint-disable @typescript-eslint/no-unused-vars */
export function beforeSave(element: Element, services: HookServices) {
  console.log('Before save hook');
  return element;
}

export function afterSave(element: Element, services: HookServices) {
  console.log('After save hook');
  return element;
}

export function afterLoaded(
  element: Element,
  services: HookServices,
  runtime: ServerRuntime,
) {
  console.log('After loaded hook');
  if (runtime === 'delivery') {
    const data = omit(element.data, ['correct']);
    return Object.assign(element, { data });
  }
  return element;
}

export function afterRetrieve(
  element: Element,
  services: HookServices,
  runtime: ServerRuntime,
) {
  console.log('After retrieve hook');
  return element;
}

export function beforeDisplay(element: Element, context: any) {
  console.log('beforeDisplay hook');
  console.log('beforeDisplay context', context);
  return { ...context, ...USER_STATE, correct: element.data.correct };
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function onUserInteraction(
  element: Element,
  context: any,
  payload: any,
): any {
  console.log('onUserInteraction', context, payload);
  const isCorrect = every(element.data.correct, (it, i) => {
    const correct = it.map((it: string) => it.toLowerCase());
    console.log('correct', correct, payload.response[i].toLowerCase());
    return correct.includes(payload.response[i].toLowerCase());
  });
  // Simulate user state update within CEK
  if (IS_CEK) {
    // Can be reset to initial / mocked state via UI
    Object.assign(context, { response: payload.response, isCorrect });
  }
  // Can have arbitrary return value (interpreted by target system)
  // FE is updated if updateDisplayState is true
  return { updateDisplayState: true };
}

export const hookMap = new Map(
  Object.entries({
    beforeSave,
    afterSave,
    afterLoaded,
    afterRetrieve,
    onUserInteraction,
    beforeDisplay,
  }),
);

export default {
  type,
  hookMap,
  initState,
  beforeSave,
  afterSave,
  afterLoaded,
  afterRetrieve,
  onUserInteraction,
  beforeDisplay,
  mocks,
};

export { type, initState, mocks };
