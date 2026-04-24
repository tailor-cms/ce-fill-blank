import { elementClient, pom } from '@tailor-cms/cek-e2e';
import { expect, test } from '@playwright/test';

import { Display } from '../pom';

const ELEMENT_ID = 'test-fill-blank-display';

const SEED = {
  isGradable: true,
  embeds: {
    prompt: {
      id: 'prompt',
      type: 'TIPTAP_HTML',
      position: 1,
      embedded: true,
      data: { content: 'The capital of @blank is @blank.' },
    },
  },
  question: ['prompt'],
  correct: [['France'], ['Paris']],
  hint: '',
};

test.beforeEach(async ({ page }) => {
  await elementClient.reset(ELEMENT_ID);
  await elementClient.resetState(ELEMENT_ID);
  await page.goto(`/?id=${ELEMENT_ID}`);
  await page.waitForLoadState('networkidle');
});

test.describe('With @blank markers in question', () => {
  test.beforeEach(async ({ page }) => {
    await elementClient.update(ELEMENT_ID, SEED);
    await page.reload({ waitUntil: 'networkidle' });
  });

  test('Renders one input per detected blank', async ({ page }) => {
    const display = new Display(page);
    await expect(display.inputs).toHaveCount(2);
  });

  test('Typing and submitting locks inputs', async ({ page }) => {
    const display = new Display(page);
    const form = new pom.DisplayQuestionForm(display.el);
    await expect(display.inputs.nth(0)).not.toHaveAttribute('readonly');
    await display.inputs.nth(0).fill('France');
    await display.inputs.nth(1).fill('Paris');
    await form.submit();
    await expect(display.inputs.nth(0)).toHaveAttribute('readonly');
  });

  test('Submitting correct answers shows success icons', async ({ page }) => {
    const display = new Display(page);
    const form = new pom.DisplayQuestionForm(display.el);
    await display.inputs.nth(0).fill('France');
    await display.inputs.nth(1).fill('Paris');
    await form.submit();
    await expect(display.root.locator('.mdi-check-circle')).toHaveCount(2);
  });

  test('Submitting a wrong answer shows an error icon', async ({ page }) => {
    const display = new Display(page);
    const form = new pom.DisplayQuestionForm(display.el);
    await display.inputs.nth(0).fill('Spain');
    await display.inputs.nth(1).fill('Paris');
    await form.submit();
    await expect(
      display.root.locator('.mdi-close-circle').first(),
    ).toBeVisible();
  });

  test('Submitting correct answers marks feedback as success', async ({
    page,
  }) => {
    const display = new Display(page);
    const form = new pom.DisplayQuestionForm(display.el);
    await display.inputs.nth(0).fill('France');
    await display.inputs.nth(1).fill('Paris');
    await form.submit();
    await expect(form.feedback).toHaveClass(/success/);
  });

  test('Submitting wrong answers marks feedback as error', async ({ page }) => {
    const display = new Display(page);
    const form = new pom.DisplayQuestionForm(display.el);
    await display.inputs.nth(0).fill('Spain');
    await display.inputs.nth(1).fill('Paris');
    await form.submit();
    await expect(form.feedback).toHaveClass(/error/);
  });
});

test.describe('Non-gradable mode', () => {
  test.beforeEach(async ({ page }) => {
    await elementClient.update(ELEMENT_ID, {
      ...SEED,
      isGradable: false,
      correct: undefined,
    });
    await page.reload({ waitUntil: 'networkidle' });
  });

  test('Feedback is not flagged as success or error', async ({ page }) => {
    const display = new Display(page);
    const form = new pom.DisplayQuestionForm(display.el);
    await display.inputs.nth(0).fill('anything');
    await display.inputs.nth(1).fill('anything');
    await form.submit();
    await expect(form.feedback).not.toHaveClass(/success/);
    await expect(form.feedback).not.toHaveClass(/error/);
  });
});
