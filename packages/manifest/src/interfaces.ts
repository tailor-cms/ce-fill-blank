import type * as common from '@tailor-cms/cek-common';

export interface ElementData extends common.ElementConfig {
  isGradable?: boolean;
  embeds: Record<string, any>;
  question: string[];
  correct?: string[][];
  hint: string;
  feedback?: common.QuestionFeedback;
}

export type DataInitializer = common.DataInitializer<ElementData>;
export type Element = common.Element<ElementData>;
export type ElementManifest = common.ElementManifest<ElementData>;
