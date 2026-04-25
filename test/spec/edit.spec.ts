import { expect, test } from '@playwright/test';
import { elementClient } from '@tailor-cms/cek-e2e';

import { Edit } from '../pom';

const ELEMENT_ID = 'test-fill-blank-edit';

const seedTwoBlanks = () => ({
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
});

test.beforeEach(async ({ page }) => {
  await elementClient.reset(ELEMENT_ID, { isGradable: true });
  await page.goto(`/?id=${ELEMENT_ID}`);
  await page.waitForLoadState('networkidle');
});

test.describe('Initial render', () => {
  test('Shows no answer groups when no blanks are in the question', async ({
    page,
  }) => {
    const edit = new Edit(page);
    await expect(edit.answerInputs).toHaveCount(0);
  });
});

test.describe('With @blank markers in question', () => {
  test.beforeEach(async () => {
    await elementClient.update(ELEMENT_ID, seedTwoBlanks());
  });

  test('Renders one answer group per blank', async ({ page }) => {
    await page.reload({ waitUntil: 'networkidle' });
    const edit = new Edit(page);
    await expect(edit.answerInputs).toHaveCount(2);
    await expect(edit.answerInputs.nth(0)).toHaveValue('France');
    await expect(edit.answerInputs.nth(1)).toHaveValue('Paris');
  });

  test('Persists edited answer', async ({ page }) => {
    await page.reload({ waitUntil: 'networkidle' });
    const edit = new Edit(page);
    await edit.answerInputs.nth(1).fill('Lyon');
    await edit.form.saveBtn.click();
    await page.reload({ waitUntil: 'networkidle' });
    await expect(edit.answerInputs.nth(1)).toHaveValue('Lyon');
  });
});

test.describe('Non-gradable mode', () => {
  test.beforeEach(async ({ page }) => {
    await elementClient.update(ELEMENT_ID, {
      ...seedTwoBlanks(),
      isGradable: false,
      correct: undefined,
    });
    await page.reload({ waitUntil: 'networkidle' });
  });

  test('Hides answer-group editor when non-gradable', async ({ page }) => {
    const edit = new Edit(page);
    await expect(edit.answerInputs).toHaveCount(0);
  });
});

test.describe('Readonly mode', () => {
  test.beforeEach(async ({ page }) => {
    await elementClient.update(ELEMENT_ID, seedTwoBlanks());
    await page.reload({ waitUntil: 'networkidle' });
  });

  test('Answer inputs are readonly', async ({ page }) => {
    const edit = new Edit(page);
    await edit.setReadonly();
    await expect(edit.answerInputs.first()).toHaveAttribute('readonly');
  });
});
