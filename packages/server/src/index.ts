import type {
  BeforeDisplayHook,
  ElementHook,
  HookMap,
  OnUserInteractionHook,
  ServerModule,
} from '@tailor-cms/cek-common';
import { every, omit } from 'lodash-es';
import type { Element } from '@tailor-cms/ce-fill-blank-manifest';
import manifest from '@tailor-cms/ce-fill-blank-manifest';

// Detect if hooks are running in CEK (used for mocking end-system runtime)
const IS_CEK = process.env.CEK_RUNTIME;
// Don't use in production, use only when IS_CEK=true
const USER_STATE: any = {};

export const afterLoaded: ElementHook<Element> = (
  element,
  _services,
  runtime,
) => {
  if (runtime === 'delivery') {
    const data = omit(element.data, ['correct']) as Element['data'];
    return Object.assign(element, { data });
  }
  return element;
};

export const beforeDisplay: BeforeDisplayHook<Element> = (element, context) => {
  if (IS_CEK) USER_STATE.correct = element.data.correct;
  return { ...context, ...USER_STATE };
};

export const onUserInteraction: OnUserInteractionHook<Element> = (
  element,
  context,
  payload,
) => {
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
  return { isCorrect, updateDisplayState: true };
};

export const hookMap: HookMap<Element> = new Map(
  Object.entries({
    afterLoaded,
    beforeDisplay,
    onUserInteraction,
  }),
);

const serverModule: ServerModule<Element> = {
  ...manifest,
  hookMap,
  afterLoaded,
  beforeDisplay,
  onUserInteraction,
};

export default serverModule;
