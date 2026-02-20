import { getHandlerForUrl } from '../../lib/chatbots/index';
import type { PendingPromptPayload } from '../../index';
import { PENDING_PROMPT_STORAGE_KEY, PENDING_PROMPT_TTL_MS, getPendingPromptKey } from '../../index';
import { Logger } from '../../lib/logger';

function isPendingPromptPayload(value: unknown): value is PendingPromptPayload {
  if (!value || typeof value !== 'object') return false;
  const v = value as Record<string, unknown>;
  return typeof v.prompt === 'string' && typeof v.timestamp === 'number';
}

async function initialize() {
  let promptText: string | null = null;
  let usedStorageKey: string | null = null;

  if (!promptText) {
    const urlParams = new URLSearchParams(window.location.search);

    const tabIdParam = urlParams.get('ebutia_tab_id');
    if (tabIdParam) {
      const tabId = parseInt(tabIdParam, 10);
      if (!isNaN(tabId)) {
        const tabKey = getPendingPromptKey(tabId);

        try {
          const tabResult = await chrome.storage.local.get([tabKey]);
          const tabData: unknown = (tabResult as Record<string, unknown>)[tabKey];
          if (isPendingPromptPayload(tabData) && Date.now() - tabData.timestamp < PENDING_PROMPT_TTL_MS) {
            promptText = tabData.prompt;
            usedStorageKey = tabKey;
          }
        } catch (e) {
          Logger.warn('Failed to read tab prompt', e);
        }
      }
    }

    if (!promptText) {
      const result = await chrome.storage.local.get([PENDING_PROMPT_STORAGE_KEY]);
      const data: unknown = (result as Record<string, unknown>)[PENDING_PROMPT_STORAGE_KEY];
      if (isPendingPromptPayload(data) && Date.now() - data.timestamp < PENDING_PROMPT_TTL_MS) {
        promptText = data.prompt;
        usedStorageKey = PENDING_PROMPT_STORAGE_KEY;
      }
    }
  }

  if (promptText) {
    const urlParams = new URLSearchParams(window.location.search);
    const urlQ = urlParams.get('q');

    if (urlQ && !promptText.includes('{transcript}') && (urlQ === promptText || urlQ.trim() === promptText.trim())) {
      if (usedStorageKey) {
        chrome.storage.local.remove([usedStorageKey]);
      }
      return;
    }

    if (promptText.includes('{transcript}')) {
      try {
        const tabIdParam = urlParams.get('ebutia_tab_id');
        const targetTabId = tabIdParam ? parseInt(tabIdParam, 10) : undefined;

        const response = await new Promise<any>((resolve) => {
          chrome.runtime.sendMessage({ action: 'getTranscript', targetTabId }, resolve);
        });

        if (response && response.success && response.message) {
          promptText = promptText.split('{transcript}').join(response.message);
        }
      } catch (e) {
        Logger.error('Failed to get transcript for prompt', e);
      }
    }

    const handler = getHandlerForUrl(window.location.href);
    if (handler) {
      let attempts = 0;
      const maxAttempts = 20;

      const tryFill = async () => {
        attempts++;
        const success = await handler.fillPrompt(promptText!);
        if (success && usedStorageKey) {
          chrome.storage.local.remove([usedStorageKey]);
        } else if (attempts < maxAttempts) {
          setTimeout(tryFill, 1000);
        }
      };

      if (document.readyState === 'complete') {
        tryFill();
      } else {
        window.addEventListener('load', tryFill);
      }
    }
  }
}

initialize();
