import type { EbutiaSettings, MessageRequest, MessageResponse, VideoInfo } from '../../../index';
import { showRefreshToast, showToast } from '../ui/toast';
import { ErrorHandler, createAppError, ErrorType } from '../../../lib/errorHandler';

export function safelySendMessage(
  message: MessageRequest,
  callback?: (response: MessageResponse | undefined) => void
) {
  try {
    if (!chrome.runtime?.id) {
      showRefreshToast();
      callback?.(undefined);
      return;
    }

    chrome.runtime.sendMessage(message, (response: MessageResponse) => {
      const lastError = chrome.runtime.lastError;
      if (lastError) {
        if (lastError.message?.includes('Extension context invalidated')) {
          showRefreshToast();
          callback?.(undefined);
          return;
        }

        ErrorHandler.log(createAppError(ErrorType.NETWORK, 'Message failed', lastError));
        callback?.(undefined);
        return;
      }

      callback?.(response);
    });
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('Extension context invalidated')) {
      showRefreshToast();
    }
    callback?.(undefined);
  }
}

export function getSettingsViaMessage(fallback: EbutiaSettings): Promise<EbutiaSettings> {
  return new Promise((resolve) => {
    safelySendMessage({ action: 'getSettings' }, (response) => {
      if (response && response.success && response.settings) {
        resolve(response.settings);
      } else {
        resolve(fallback);
      }
    });
  });
}

export function saveSettingsViaMessage(settings: EbutiaSettings): Promise<boolean> {
  return new Promise((resolve) => {
    safelySendMessage({ action: 'saveSettings', settings } as any, (response) => {
      resolve(response?.success ?? false);
    });
  });
}

export function registerContentRuntimeListeners(
  getVideoInfo: () => Promise<VideoInfo | null>,
  handleContextMenuAction?: (videoId: string, action: 'summarize' | 'chat') => void,
  getTranscript?: () => Promise<string | null>
) {
  chrome.runtime.onMessage.addListener((request: MessageRequest, _sender, sendResponse) => {
    if (request.action === 'getVideoInfo') {
      getVideoInfo().then((videoInfo) => {
        sendResponse({ success: true, videoInfo });
      });
      return true;
    }

    if (request.action === 'getTranscript' && getTranscript) {
      getTranscript().then((transcript) => {
        sendResponse({ success: true, message: transcript || undefined });
      });
      return true;
    }

    if (request.action === 'showToast' && request.message) {
      showToast(request.message, request.duration);
      return true;
    }

    if (request.action === 'handleContextMenu' && request.videoInfo && request.menuAction && handleContextMenuAction) {
      handleContextMenuAction(request.videoInfo.videoId, request.menuAction);
      sendResponse({ success: true });
      return true;
    }

    return false;
  });
}
