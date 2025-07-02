import { every, omit } from 'lodash-es';
import type { HookServices, ServerRuntime } from '@tailor-cms/cek-common';
import { initState, type } from '@tailor-cms/ce-fill-blank-manifest';
import type { Element } from '@tailor-cms/ce-fill-blank-manifest';

// Detect if hooks are running in CEK (used for mocking end-system runtime)
const IS_CEK = process.env.CEK_RUNTIME;
// Don't use in production, use only when IS_CEK=true
const USER_STATE: any = {};

export function beforeSave(element: Element, _services: HookServices) {
  return element;
}

export function afterSave(element: Element, _services: HookServices) {
  return element;
}

export function afterLoaded(
  element: Element,
  _services: HookServices,
  runtime: ServerRuntime,
) {
  if (runtime === 'delivery') {
    const data = omit(element.data, ['correct']);
    return Object.assign(element, { data });
  }
  return element;
}

export function afterRetrieve(
  element: Element,
  _services: HookServices,
  _runtime: ServerRuntime,
) {
  return element;
}

export function beforeDisplay(element: Element, context: any) {
  if (IS_CEK) USER_STATE.correct = element.data.correct;
  return { ...context, ...USER_STATE };
}

export function onUserInteraction(
  element: Element,
  context: any,
  payload: any,
): any {
  const isGradable = element.data.isGradable;
  const isCorrect = every(element.data.correct, (it, i) => {
    const correct = it.map((it: string) => it.toLowerCase());
    return correct.includes(payload.response[i].toLowerCase());
  });
  // Simulate user state update within CEK
  if (IS_CEK) {
    // Can be reset to initial / mocked state via UI
    context.response = payload.response;
    if (isGradable) context.isCorrect = isCorrect;
    context.isSubmitted = true;
  }
  // Can have arbitrary return value (interpreted by target system)
  // FE is updated if updateDisplayState is true
  return { isCorrect, updateDisplayState: true };
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
};

export { type, initState };
