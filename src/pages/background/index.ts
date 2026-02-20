import { EbutiaSettings, MessageRequest, MessageResponse, VideoInfo } from '../../index';
import { buildAITarget, storePendingPrompt } from '../../lib/aiTarget';
import { storage } from '../../lib/storage';
import { getVideoIdFromUrl } from '../../lib/utils';
import { Logger } from '../../lib/logger';

let ebutiaPopupId: number | null = null;
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
let positionPollInterval: ReturnType<typeof setInterval> | null = null;

const queuePositionSave = (window: chrome.windows.Window) => {
  if (!ebutiaPopupId || window.id !== ebutiaPopupId) return;

  if (saveTimeout) clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    storage
      .getSettings()
      .then((settings) => {
        if (
          window.left === undefined ||
          window.top === undefined ||
          window.width === undefined ||
          window.height === undefined
        ) {
          return;
        }

        if (
          settings.windowPosition &&
          settings.windowPosition.left === window.left &&
          settings.windowPosition.top === window.top &&
          settings.windowPosition.width === window.width &&
          settings.windowPosition.height === window.height
        ) {
          return;
        }

        const newSettings: EbutiaSettings = {
          ...settings,
          windowPosition: {
            left: window.left,
            top: window.top,
            width: window.width,
            height: window.height
          }
        };
        return storage.saveSettings(newSettings);
      })
      .catch((err) => {
        Logger.warn('Failed to save window position', err);
      });
  }, 500);
};

const startPositionPolling = (windowId: number) => {
  if (positionPollInterval) clearInterval(positionPollInterval);
  positionPollInterval = setInterval(() => {
    chrome.windows.get(windowId, { populate: false }, (win) => {
      if (chrome.runtime.lastError || !win) {
        if (positionPollInterval) clearInterval(positionPollInterval);
        return;
      }
      queuePositionSave(win);
    });
  }, 1000);
};

if (chrome.windows && (chrome.windows as any)['onBoundsChanged']) {
  (chrome.windows as any)['onBoundsChanged'].addListener(queuePositionSave);
}

chrome.windows.onRemoved.addListener((windowId) => {
  if (windowId === ebutiaPopupId) {
    ebutiaPopupId = null;
    if (positionPollInterval) {
      clearInterval(positionPollInterval);
      positionPollInterval = null;
    }
  }
});

chrome.runtime.onInstalled.addListener(() => {
  storage.ensureDefaults().catch((err) => Logger.error('Failed to ensure defaults', err));
  setupContextMenus();
});

chrome.tabs.onUpdated.addListener(async (_tabId, _changeInfo, _tab) => {
});

chrome.tabs.onRemoved.addListener((_tabId) => {
});

chrome.storage.onChanged.addListener((changes, area) => {
  if (changes.ebutiaSettings) {
    if (area === 'sync' || area === 'local') {
      setupContextMenus();
    }
  }
});

async function setupContextMenus() {
  try {
    await chrome.contextMenus.removeAll();

    const settings = await storage.getSettings();

    if (!settings.showContextMenu) {
      return;
    }

    chrome.contextMenus.create({
      id: 'ebutia-parent',
      title: 'Ebutia',
      contexts: ['link'],
      targetUrlPatterns: [
        '*://www.youtube.com/watch?v=*',
        '*://youtube.com/watch?v=*',
        '*://m.youtube.com/watch?v=*',
        '*://youtu.be/*'
      ]
    });

    chrome.contextMenus.create({
      id: 'ebutia-summarize',
      parentId: 'ebutia-parent',
      title: 'Summarize',
      contexts: ['link']
    });

    chrome.contextMenus.create({
      id: 'ebutia-chat',
      parentId: 'ebutia-parent',
      title: 'Ask',
      contexts: ['link']
    });
  } catch (e) {
    Logger.error('Failed to setup context menus', e);
  }
}

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!info.linkUrl) return;

  const videoId = getVideoIdFromUrl(info.linkUrl);
  if (!videoId) return;

  const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const videoInfo: VideoInfo = {
    videoId,
    videoUrl,
    hasSubtitles: true
  };

  if (tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      action: 'handleContextMenu',
      videoInfo,
      menuAction: info.menuItemId === 'ebutia-summarize' ? 'summarize' : 'chat'
    } as MessageRequest);
  }
});


chrome.runtime.onMessage.addListener((
  request: MessageRequest,
  sender,
  sendResponse: (response: MessageResponse) => void
) => {
  if (request.action === 'getSettings') {
    storage
      .getSettings()
      .then((settings) => sendResponse({ success: true, settings }))
      .catch((e) => sendResponse({ success: false, error: String(e) }));
    return true;
  }

  if (request.action === 'saveSettings' && (request as any).settings) {
    storage
      .saveSettings((request as any).settings)
      .then(() => sendResponse({ success: true }))
      .catch((e) => sendResponse({ success: false, error: String(e) }));
    return true;
  }

  if (request.action === 'openAITab' && request.videoInfo) {
    const videoInfo = request.videoInfo;

    handleOpenAITab(videoInfo, sendResponse, request.prompt, request.promptAction, sender.tab?.id, request.isHover);
    return true;
  }

  if (request.action === 'getTranscript') {
    (async () => {
      try {
        let tabId = request.targetTabId;
        if (!tabId) {
          const tabs = await chrome.tabs.query({ active: true, lastFocusedWindow: true });
          if (tabs[0]?.id) tabId = tabs[0].id;
        }

        if (!tabId) {
          sendResponse({ success: false, error: 'No tab found' });
          return;
        }

        const response = await chrome.tabs.sendMessage(tabId, { action: 'getTranscript' });
        sendResponse(response);
      } catch (e) {
        sendResponse({ success: false, error: String(e) });
      }
    })();
    return true;
  }

  return false;
});

async function handleOpenAITab(
  videoInfo: VideoInfo,
  sendResponse: (response: MessageResponse) => void,
  customPromptOverride?: string,
  action?: 'summarize' | 'chat',
  _tabId?: number,
  isHover?: boolean
) {
  try {
    const settings = await storage.getSettings();

    const { prompt, targetUrl, useQueryParam } = buildAITarget(
      videoInfo.videoUrl,
      settings,
      customPromptOverride,
      action,
      isHover
    );

    const needsScriptAction = settings.aiChatbot === 'lumo';
    const needsPendingPrompt = !useQueryParam || needsScriptAction;

    if (settings.openIn === 'popup') {
      if (needsPendingPrompt) {
        await storePendingPrompt(prompt, settings.openIn as any, targetUrl);
      }

      let width = 500;
      let height = 800;
      let left: number | undefined;
      let top: number | undefined;

      if (settings.windowPosition) {
        width = settings.windowPosition.width;
        height = settings.windowPosition.height;
        left = settings.windowPosition.left;
        top = settings.windowPosition.top;
      } else {
        try {
          const currentWindow = await chrome.windows.getCurrent();
          if (currentWindow && currentWindow.left !== undefined && currentWindow.width !== undefined) {
            left = currentWindow.left + currentWindow.width - width;
            top = currentWindow.top || 0;
          }
        } catch (e) {
          Logger.log('Failed to get current window for positioning', e);
        }
      }

      try {
        const createData: chrome.windows.CreateData & { alwaysOnTop?: boolean } = {
          url: targetUrl,
          type: 'popup',
          width: width,
          height: height,
          left: left,
          top: top
        };

        if (settings.usePrivateWindow) {
          const isAllowed = await chrome.extension.isAllowedIncognitoAccess();
          if (!isAllowed) {
            sendResponse({ success: false, showIncognitoToast: true });
            return;
          }
          createData.incognito = true;
        }

        if (settings.alwaysOnTop && navigator.userAgent.includes('Firefox')) {
          createData.alwaysOnTop = true;
        }

        const win = await chrome.windows.create(createData);
        if (win?.id) {
          ebutiaPopupId = win.id;
          if (chrome.windows && (chrome.windows as any)['onBoundsChanged']) {
            startPositionPolling(win.id);
          } else {
            startPositionPolling(win.id);
          }
        }
      } catch (e) {
        const fallbackData: chrome.windows.CreateData = {
          url: targetUrl,
          type: 'popup',
          width: width,
          height: height
        };
        if (settings.usePrivateWindow) {
          fallbackData.incognito = true;
        }

        const win = await chrome.windows.create(fallbackData);
        if (win?.id) {
          ebutiaPopupId = win.id;
          if (chrome.windows && (chrome.windows as any)['onBoundsChanged']) {
            startPositionPolling(win.id);
          } else {
            startPositionPolling(win.id);
          }
        }
      }
    } else {
      if (needsPendingPrompt) {
        await storePendingPrompt(prompt, settings.openIn as any, targetUrl);
      }
      await chrome.tabs.create({ url: targetUrl, active: true });
    }

    sendResponse({ success: true });
  } catch (error) {
    sendResponse({ success: false, error: String(error) });
  }
}

export { };
