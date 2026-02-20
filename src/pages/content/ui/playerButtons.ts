import SUMMARY_ICON from '../../../../public/icons/star.svg?raw';
import CHAT_ICON from '../../../../public/icons/ion--paper-plane-outline.svg?raw';
import { waitForElement } from '../../../lib/utils';
import type { EbutiaSettings } from '../../../index';
import config from '../../../../config.json';

const { metadataMenu, topLevelButtons, ebutiaControls } = config.youtube.player;

export function removeEbutiaControls(getOverlayButton: () => HTMLElement | null, setOverlayButton: (el: HTMLElement | null) => void) {
  const overlay = getOverlayButton();
  if (overlay) {
    overlay.remove();
    setOverlayButton(null);
  }
  const existingControls = document.querySelector(ebutiaControls);
  if (existingControls) {
    existingControls.remove();
  }
  const metadataFloating = document.querySelector('.ebutia-metadata-floating');
  if (metadataFloating) {
    metadataFloating.remove();
  }
}

export async function addEbutiaPlayerButton(
  _position: 'metadata',
  getSettings: () => EbutiaSettings,
  onSummarize: () => void,
  onChat: (e?: MouseEvent) => void,
  removeControls: () => void
) {
  removeControls();
  await addMetadataFloatingButton(getSettings, onSummarize, onChat);
}

async function addMetadataFloatingButton(
  getSettings: () => EbutiaSettings,
  onSummarize: () => void,
  onChat: (e?: MouseEvent) => void
) {
  const menuRenderer = await waitForElement(metadataMenu);
  if (!menuRenderer) return;

  const topLevelButtonsEl = menuRenderer.querySelector(topLevelButtons);
  const targetContainer = topLevelButtonsEl || menuRenderer;
  const insertBeforeNode = targetContainer.firstChild;

  const settings = getSettings();
  const iconUrl = chrome.runtime.getURL('public/icons/ebutia.png');

  const wrapper = document.createElement('div');
  wrapper.className = 'ebutia-metadata-floating';

  wrapper.classList.add('ebutia-metadata-floating-expandable');

  const mainBtn = document.createElement('div');
  mainBtn.className = 'ebutia-metadata-floating-btn';

  const img = document.createElement('img');
  img.src = iconUrl;
  img.alt = 'Ebutia';
  img.className = 'ebutia-floating-icon';

  mainBtn.appendChild(img);
  wrapper.appendChild(mainBtn);

  const actionsPanel = document.createElement('div');
  actionsPanel.className = 'ebutia-metadata-floating-actions';

  const summarizeBtn = createFloatingActionButton(SUMMARY_ICON, 'Summarize', (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSummarize();
  });
  actionsPanel.appendChild(summarizeBtn);

  if (settings.showAskButton) {
    const askBtn = createFloatingActionButton(CHAT_ICON, 'Ask', (e) => {
      e.preventDefault();
      e.stopPropagation();
      onChat(e);
    });
    actionsPanel.appendChild(askBtn);
  }

  wrapper.appendChild(actionsPanel);

  if (insertBeforeNode) {
    targetContainer.insertBefore(wrapper, insertBeforeNode);
  } else {
    targetContainer.appendChild(wrapper);
  }
}

function createFloatingActionButton(
  svgRaw: string,
  label: string,
  onClick: (e: MouseEvent) => void
): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.className = 'ebutia-floating-action-btn';
  btn.title = label;
  btn.setAttribute('aria-label', label);

  const iconWrapper = document.createElement('div');
  iconWrapper.className = 'ebutia-floating-action-icon';

  const parser = new DOMParser();
  const doc = parser.parseFromString(svgRaw, 'image/svg+xml');
  const svgElement = doc.documentElement;
  iconWrapper.appendChild(svgElement);

  const svg = iconWrapper.querySelector('svg');
  if (svg) {
    svg.setAttribute('width', '18');
    svg.setAttribute('height', '18');
    svg.style.fill = 'none';
    svg.style.stroke = 'currentColor';

    const g = svg.querySelector('g');
    if (g) g.setAttribute('stroke-width', '2.5');
    else svg.setAttribute('stroke-width', '2.5');
  }

  const labelSpan = document.createElement('span');
  labelSpan.className = 'ebutia-floating-action-label';
  labelSpan.textContent = label;

  btn.appendChild(iconWrapper);
  btn.appendChild(labelSpan);
  btn.onclick = onClick;

  return btn;
}
