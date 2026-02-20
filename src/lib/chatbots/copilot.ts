import { BaseHandler } from './BaseHandler';

import config from '../../../config.json';

export class CopilotHandler extends BaseHandler {
  name = 'copilot';
  protected chatbotKey: keyof typeof config.chatbots = 'copilot';

  protected get config() {
    return super.config as typeof config.chatbots.copilot;
  }


  protected getRoot(): ShadowRoot | Document {
    if (!this.config.shadowHost) return document;
    const host = this.findElement(this.config.shadowHost);
    return host?.shadowRoot || document;
  }
}

