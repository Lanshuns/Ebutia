import SUMMARY_ICON from '../../../../public/icons/star.svg?raw';
import CHAT_ICON from '../../../../public/icons/ion--paper-plane-outline.svg?raw';
import type { EbutiaSettings } from '../../../index';

let floatingContainer: HTMLElement | null = null;

export function removeFloatingButton() {
  if (floatingContainer) {
    floatingContainer.remove();
    floatingContainer = null;
  }
}

export async function addFloatingButton(
  getSettings: () => EbutiaSettings,
  onSummarize: () => void,
  onChat: (e?: MouseEvent) => void
) {
  removeFloatingButton();

  const settings = getSettings();

  const player = document.querySelector('#movie_player') as HTMLElement | null;
  if (!player) return;

  const container = document.createElement('div');
  container.className = 'ebutia-floating-container';

  const iconUrl = chrome.runtime.getURL('public/icons/ebutia.png');

  container.classList.add('ebutia-floating-expandable');

  const mainBtn = document.createElement('div');
  mainBtn.className = 'ebutia-floating-main-btn';

  const img = document.createElement('img');
  img.src = iconUrl;
  img.alt = 'Ebutia';
  img.className = 'ebutia-floating-icon';

  mainBtn.appendChild(img);
  container.appendChild(mainBtn);

  const actionsPanel = document.createElement('div');
  actionsPanel.className = 'ebutia-floating-actions';

  const summarizeBtn = createActionButton(SUMMARY_ICON, 'Summarize', (e) => {
    e.preventDefault();
    e.stopPropagation();
    onSummarize();
  });
  actionsPanel.appendChild(summarizeBtn);

  if (settings.showAskButton) {
    const askBtn = createActionButton(CHAT_ICON, 'Ask', (e) => {
      e.preventDefault();
      e.stopPropagation();
      onChat(e);
    });
    actionsPanel.appendChild(askBtn);
  }

  container.appendChild(actionsPanel);

  player.appendChild(container);
  floatingContainer = container;
}

function createActionButton(
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
    svg.style.color = 'white';
    svg.style.fill = 'none';
    svg.style.stroke = 'currentColor';

    const g = svg.querySelector('g');
    if (g) {
      g.setAttribute('stroke-width', '2.5');
    } else {
      svg.setAttribute('stroke-width', '2.5');
    }
  }

  const labelSpan = document.createElement('span');
  labelSpan.className = 'ebutia-floating-action-label';
  labelSpan.textContent = label;

  btn.appendChild(iconWrapper);
  btn.appendChild(labelSpan);

  btn.onclick = onClick;

  return btn;
}
