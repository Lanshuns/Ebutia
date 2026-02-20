import { ChatbotHandler } from '../../index';
import { PerplexityHandler } from './perplexity';
import { CopilotHandler } from './copilot';
import { LumoHandler } from './lumo';

export const handlers: ChatbotHandler[] = [
  new PerplexityHandler(),
  new CopilotHandler(),
  new LumoHandler()
];

export function getHandlerForUrl(url: string): ChatbotHandler | undefined {
  return handlers.find(h => h.canHandle(url));
}
