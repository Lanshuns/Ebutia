import contentStyles from '../../../styles/content.css?inline';
import SUMMARY_ICON from '../../../../public/icons/star.svg?raw';
import CHAT_ICON from '../../../../public/icons/ion--paper-plane-outline.svg?raw';
import { getVideoIdFromUrl } from '../../../lib/utils';
import { showRefreshToast } from './toast';
import config from '../../../../config.json';

const { videoSelectors, thumbnailSelectors, thumbnailLinkSelectors, overlaySelectors, endpointSelector } = config.youtube.hover;

export interface HoverButtonDeps {
  isEnabled: () => boolean;
  onClickSummarize: (videoId: string) => Promise<void>;
  onClickChat?: (videoId: string, e?: MouseEvent) => Promise<void>;
}

const EBUTIA_OVERLAY_ATTR = 'data-ebutia-overlay';

export function initializeHoverButton(deps: HoverButtonDeps) {
  const parser = new DOMParser();

  let currentContainer: Element | null = null;
  let hideTimeout: ReturnType<typeof setTimeout> | null = null;
  let activeOverlay: { host: HTMLElement; container: Element } | null = null;

  const createOverlayElements = (videoId: string) => {
    if (!chrome.runtime?.id) {
      showRefreshToast();
      return null;
    }

    const host = document.createElement('div');
    host.setAttribute(EBUTIA_OVERLAY_ATTR, '');
    host.style.position = 'absolute';
    host.style.top = '0';
    host.style.left = '0';
    host.style.width = '100%';
    host.style.height = '100%';
    host.style.pointerEvents = 'none';
    host.style.zIndex = '800';

    const shadow = host.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = contentStyles;
    shadow.appendChild(style);

    const iconUrl = chrome.runtime.getURL('public/icons/ebutia.png');

    const uiContainer = document.createElement('div');
    uiContainer.className = 'ebutia-thumbnail-container';

    uiContainer.classList.add('ebutia-thumbnail-expandable');

    const mainBtn = document.createElement('div');
    mainBtn.className = 'ebutia-thumbnail-main-btn';

    const img = document.createElement('img');
    img.src = iconUrl;
    img.alt = 'Ebutia';
    img.className = 'ebutia-thumbnail-main-icon';

    mainBtn.appendChild(img);
    uiContainer.appendChild(mainBtn);

    const actionsPanel = document.createElement('div');
    actionsPanel.className = 'ebutia-thumbnail-actions';

    const summarizeButton = createThumbnailActionButton(parser, SUMMARY_ICON, 'Summarize');
    summarizeButton.addEventListener('click', handleClick('summarize'));
    actionsPanel.appendChild(summarizeButton);

    const askButton = createThumbnailActionButton(parser, CHAT_ICON, 'Ask');
    askButton.addEventListener('click', handleClick('chat'));
    actionsPanel.appendChild(askButton);

    uiContainer.appendChild(actionsPanel);

    uiContainer.addEventListener('mouseenter', clearHideTimer);
    uiContainer.addEventListener('mouseleave', startHideTimer);

    shadow.appendChild(uiContainer);

    function handleClick(action: 'summarize' | 'chat') {
      return (e: Event) => {
        e.preventDefault();
        e.stopPropagation();

        if (!chrome.runtime?.id) {
          showRefreshToast();
          return;
        }

        const handler = action === 'summarize' ? deps.onClickSummarize : deps.onClickChat;
        if (!handler) return;

        handler(videoId, e as MouseEvent).catch(() => {
          if (!chrome.runtime?.id) {
            showRefreshToast();
          }
        });
      };
    }

    return { host, uiContainer };
  };

  const removeActiveOverlay = () => {
    if (activeOverlay) {
      activeOverlay.host.remove();
      activeOverlay = null;
    }
    currentContainer = null;
  };

  const startHideTimer = () => {
    if (hideTimeout) clearTimeout(hideTimeout);
    hideTimeout = setTimeout(() => {
      removeActiveOverlay();
      hideTimeout = null;
    }, 300);
  };

  const clearHideTimer = () => {
    if (hideTimeout) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
  };

  const showOverlay = (container: Element, thumbnailElement: Element, videoId: string) => {
    if (currentContainer === container && activeOverlay) {
      clearHideTimer();
      return;
    }

    removeActiveOverlay();

    const result = createOverlayElements(videoId);
    if (!result) return;
    const { host } = result;

    const thumbnailEl = thumbnailElement as HTMLElement;
    const computedPos = window.getComputedStyle(thumbnailEl).position;
    if (computedPos === 'static' || computedPos === '') {
      thumbnailEl.classList.add('ebutia-relative-position');
    }

    thumbnailEl.appendChild(host);

    activeOverlay = { host, container };
    currentContainer = container;
  };

  document.addEventListener('mouseover', (e) => {
    if (!deps.isEnabled()) {
      removeActiveOverlay();
      return;
    }

    const target = e.target as HTMLElement;

    const path = e.composedPath();
    for (const el of path) {
      if (el instanceof HTMLElement && el.hasAttribute(EBUTIA_OVERLAY_ATTR)) {
        clearHideTimer();
        return;
      }
    }

    if (currentContainer && currentContainer.contains(target)) {
      clearHideTimer();
      return;
    }

    if (target.closest(overlaySelectors)) {
      if (currentContainer) {
        clearHideTimer();
        return;
      }
    }

    const container = target.closest(videoSelectors);

    if (container) {
      if (currentContainer === container) {
        clearHideTimer();
        return;
      }

      const thumbnailElement = container.querySelector(thumbnailSelectors);
      if (!thumbnailElement) return;

      let thumbnailLink = container.querySelector(thumbnailLinkSelectors);
      let url = thumbnailLink?.getAttribute('href');

      if (!url) {
        const endpoint = container.querySelector(endpointSelector);
        if (endpoint) url = endpoint.getAttribute('href');
      }

      if (!url) return;

      const videoId = getVideoIdFromUrl('https://www.youtube.com' + url);
      if (!videoId) return;

      clearHideTimer();
      showOverlay(container, thumbnailElement, videoId);
    } else {
      startHideTimer();
    }
  });

  window.addEventListener(
    'scroll',
    () => {
      removeActiveOverlay();
    },
    { passive: true }
  );
}

function createThumbnailActionButton(
  parser: DOMParser,
  svgRaw: string,
  label: string
): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.className = 'ebutia-thumbnail-action-btn';
  btn.title = label;

  const iconWrapper = document.createElement('div');
  iconWrapper.className = 'ebutia-thumbnail-action-icon';
  const doc = parser.parseFromString(svgRaw, 'image/svg+xml');
  iconWrapper.appendChild(doc.documentElement);

  const svg = iconWrapper.querySelector('svg');
  if (svg) {
    svg.setAttribute('width', '16');
    svg.setAttribute('height', '16');
    svg.style.color = 'white';
    svg.style.fill = 'none';
    svg.style.stroke = 'currentColor';

    const g = svg.querySelector('g');
    if (g) g.setAttribute('stroke-width', '2.5');
    else svg.setAttribute('stroke-width', '2.5');
  }

  const labelSpan = document.createElement('span');
  labelSpan.className = 'ebutia-thumbnail-action-label';
  labelSpan.textContent = label;

  btn.appendChild(iconWrapper);
  btn.appendChild(labelSpan);

  return btn;
}
