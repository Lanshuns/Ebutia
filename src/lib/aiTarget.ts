import type { EbutiaSettings, OpenTargetType, PendingPromptPayload } from '../index';
import { getPendingPromptKey } from '../index';
import { generateFinalPrompt } from './prompts';

export interface AITargetBuildResult {
  prompt: string;
  targetUrl: string;
  urlPatterns: string[];
  useQueryParam: boolean;
}

import config from '../../config.json';

function getChatbotConfig(settings: EbutiaSettings, chatbotOverride?: string): {
  baseUrl: string;
  urlPatterns: string[];
  useQueryParam: boolean;
  hasWebSearch: boolean;
} {
  const chatbotKey = (chatbotOverride || settings.aiChatbot) as keyof typeof config.chatbots;
  const chatbot = config.chatbots[chatbotKey] || config.chatbots.perplexity;
  const hasWebSearch = 'webSearchButton' in chatbot && Array.isArray((chatbot as any).webSearchButton) && (chatbot as any).webSearchButton.length > 0;

  const useQueryParam = (chatbot as any).capabilities?.query ?? false;

  return {
    baseUrl: chatbot.baseUrl,
    urlPatterns: chatbot.urlPatterns,
    useQueryParam,
    hasWebSearch
  };
}


export function buildAITarget(
  videoUrl: string,
  settings: EbutiaSettings,
  customPromptOverride?: string,
  action?: 'summarize' | 'chat',
  isHover?: boolean
): AITargetBuildResult {
  let chatbotOverride: string | undefined;

  const useUrlChatbot = !chatbotOverride && settings.urlChatbot &&
    (settings.summarySource === 'url' || (action === 'chat' && isHover) || (settings.summarySource === 'transcript' && !customPromptOverride));
  if (useUrlChatbot) {
    chatbotOverride = settings.urlChatbot;
  }

  const prompt = generateFinalPrompt(videoUrl, settings, customPromptOverride, action, isHover);
  const chatbot = getChatbotConfig(settings, chatbotOverride);

  let useQueryParam = chatbot.useQueryParam;
  if (settings.summarySource === 'transcript' && !useUrlChatbot) {
    useQueryParam = false;
  }

  const encodedPromptLength = encodeURIComponent(prompt).length;
  const SAFE_URL_PARAM_MAX = 1500;

  if (encodedPromptLength > SAFE_URL_PARAM_MAX) {
    useQueryParam = false;
  }


  const urlObj = new URL(chatbot.baseUrl);

  const effectiveChatbot = chatbotOverride || settings.aiChatbot;
  if (effectiveChatbot === 'lumo' && settings.lumoGuestMode !== false) {
    urlObj.pathname = '/guest';
  }

  if (useQueryParam) {
    urlObj.searchParams.set('q', prompt);
  }

  return {
    prompt,
    targetUrl: urlObj.toString(),
    urlPatterns: chatbot.urlPatterns,
    useQueryParam
  };
}

export function storePendingPrompt(prompt: string, type?: OpenTargetType, targetUrl?: string, tabId?: number) {
  const payload: PendingPromptPayload = {
    prompt,
    timestamp: Date.now()
  };

  if (type) {
    payload.type = type;
  }

  if (targetUrl) {
    payload.targetUrl = targetUrl;
  }

  const key = getPendingPromptKey(tabId);

  const storageData: Record<string, PendingPromptPayload> = { [key]: payload };
  if (tabId) {
    const globalKey = getPendingPromptKey(undefined);
    storageData[globalKey] = payload;
  }

  return chrome.storage.local.set(storageData);
}
