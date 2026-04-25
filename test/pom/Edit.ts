import type { Locator, Page } from '@playwright/test';
import { pom } from '@tailor-cms/cek-e2e';

export class Edit extends pom.EditPanel {
  readonly form: pom.EditQuestionForm;
  readonly root: Locator;
  readonly groups: Locator;
  readonly answerInputs: Locator;

  constructor(page: Page) {
    super(page);
    this.form = new pom.EditQuestionForm(this.el);
    this.root = this.form.el.locator('.tce-fill-blank');
    this.groups = this.root.locator('.d-flex.flex-column > div');
    this.answerInputs = this.root.getByPlaceholder('Answer...');
  }
}
