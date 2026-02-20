import { BaseHandler } from './BaseHandler';
import config from '../../../config.json';

export class PerplexityHandler extends BaseHandler {
  name = 'perplexity';
  protected chatbotKey: keyof typeof config.chatbots = 'perplexity';
}


