import { BaseHandler } from './BaseHandler';

import config from '../../../config.json';

export class LumoHandler extends BaseHandler {
  name = 'lumo';
  protected chatbotKey: keyof typeof config.chatbots = 'lumo';

  protected get config() {
    return super.config as typeof config.chatbots.lumo;
  }

  private webSearchClicked = false;

  private isWebSearchActive(button: HTMLElement): boolean {
    if (button.getAttribute('aria-pressed') === 'true') return true;
    if (button.getAttribute('aria-checked') === 'true') return true;
    if (button.dataset.state === 'active' || button.dataset.state === 'on') return true;
    if (button.classList.contains('active') || button.classList.contains('is-active')) return true;
    return false;
  }

  async fillPrompt(prompt: string): Promise<boolean> {
    const inputElement = this.findElement(this.config.input);
    if (!inputElement) return false;

    if (!this.webSearchClicked && this.config.webSearchButton) {
      const webSearchButton = this.findElement(this.config.webSearchButton);
      if (webSearchButton) {
        if (!this.isWebSearchActive(webSearchButton)) {
          webSearchButton.click();
          await this.delay(500);
        }
        this.webSearchClicked = true;
      }
    }

    this.fillInput(inputElement, prompt);

    await this.delay(800);

    this.clickSubmit(document);

    return true;
  }
}


