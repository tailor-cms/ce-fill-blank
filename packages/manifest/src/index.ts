import { OpenAISchema } from '@tailor-cms/cek-common';
import { v4 as uuid } from 'uuid';

import type {
  DataInitializer,
  ElementData,
  ElementManifest,
} from './interfaces';

// Element unique id within the target system (e.g. Tailor)
export const type = 'FILL_BLANK';

// Display name (e.g. shown to the author)
export const name = 'Fill In The Blank';

// Function which inits element state (data property on the Content Element
// entity)
export const initState: DataInitializer = (): ElementData => ({
  embeds: {},
  question: [],
  correct: [],
  hint: '',
});

// Can be loaded from package.json
export const version = '1.0';

// UI configuration for Tailor CMS
const ui = {
  // Display icon, https://pictogrammers.com/library/mdi/
  icon: 'mdi-form-textbox',
  // Does element support only full width or can be used within layouts
  // (e.g. 50/50 layout)
  forceFullWidth: true,
};

export const ai = {
  Schema: {
    type: 'json_schema',
    name: 'ce_fill_blank',
    schema: {
      type: 'object',
      properties: {
        question: { type: 'string' },
        correct: {
          type: 'array',
          items: {
            type: 'array',
            items: {
              type: 'string',
            },
          },
        },
        hint: { type: 'string' },
      },
      required: ['question', 'correct', 'hint'],
      additionalProperties: false,
    },
  } as OpenAISchema,
  getPrompt: () => `
    Generate a fill-in-the-blank question as an object with the following
    properties:
    {
      "question": "",
      "correct": [],
      "hint": "",
    }
    where:
      - 'question' is the question prompt with @blank placeholders
        for the answers. The question can contain multiple blanks.
      - 'correct' is an array of correct answers, where each answer is an array
        of strings representing the correct answers for each blank. Each blank
        can have multiple correct answers, which are different variants
        of the same answer.
      - 'hint' is an optional hint for the correct solution. Do not reveal the
        correct answer in the hint, but provide a clue that helps the user to
        find the answer.
  `,
  processResponse: ({ correct, hint, question }: any = {}) => {
    const id = uuid();
    return {
      isGradable: true,
      question: [id],
      correct,
      hint,
      embeds: {
        [id]: {
          id,
          data: { content: question },
          embedded: true,
          position: 1,
          type: 'TIPTAP_HTML',
        },
      },
    };
  },
};

const manifest: ElementManifest = {
  type,
  version: '1.0',
  name,
  ssr: false,
  isComposite: true,
  isQuestion: true,
  initState,
  ui,
  ai,
};

export default manifest;
export * from './interfaces';
