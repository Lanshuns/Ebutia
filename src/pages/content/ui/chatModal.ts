import chatStyles from '../../../styles/chat.css?inline';

export function showChatInputModal(targetButton?: HTMLElement): Promise<string | null> {
  return new Promise((resolve) => {
    const host = document.createElement('div');
    host.style.position = 'absolute';
    host.style.top = '0';
    host.style.left = '0';
    host.style.zIndex = '2147483647';

    const shadow = host.attachShadow({ mode: 'closed' });

    const style = document.createElement('style');
    style.textContent = chatStyles;
    shadow.appendChild(style);

    const modal = document.createElement('div');
    modal.className = 'ebutia-chat-popup';
    const content = document.createElement('div');
    content.className = 'ebutia-chat-content';

    const textarea = document.createElement('textarea');
    textarea.placeholder = 'Ask about this video...';
    content.appendChild(textarea);

    const buttons = document.createElement('div');
    buttons.className = 'ebutia-chat-buttons';

    const submitBtn = document.createElement('button');
    submitBtn.className = 'ebutia-submit-btn';

    const svgNs = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(svgNs, 'svg');
    svg.setAttribute('width', '24');
    svg.setAttribute('height', '24');
    svg.setAttribute('viewBox', '0 0 512 512');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('stroke-width', '32');

    const path = document.createElementNS(svgNs, 'path');
    path.setAttribute('d', 'm53.12 199.94l400-151.39a8 8 0 0 1 10.33 10.33l-151.39 400a8 8 0 0 1-15-.34l-67.4-166.09a16 16 0 0 0-10.11-10.11L53.46 215a8 8 0 0 1-.34-15.06M460 52L227 285');

    svg.appendChild(path);
    submitBtn.appendChild(svg);
    buttons.appendChild(submitBtn);
    content.appendChild(buttons);

    modal.appendChild(content);

    shadow.appendChild(modal);
    document.body.appendChild(host);

    host.addEventListener('mousedown', (e) => e.stopPropagation());

    if (targetButton) {
      const rect = targetButton.getBoundingClientRect();
      const scrollY = window.scrollY;
      const scrollX = window.scrollX;

      let top = rect.top + scrollY - modal.offsetHeight - 10;
      let left = rect.left + scrollX - (320 / 2) + (rect.width / 2);

      if (left < 10) left = 10;
      if (left + 320 > window.innerWidth - 10) left = window.innerWidth - 330;

      if (rect.top < 150) {
        top = rect.bottom + scrollY + 10;
      }

      modal.style.top = `${top}px`;
      modal.style.left = `${left}px`;
    } else {
      modal.style.position = 'fixed';
      modal.style.top = '50%';
      modal.style.left = '50%';
      modal.style.transform = 'translate(-50%, -50%)';
    }

    requestAnimationFrame(() => {
      modal.classList.add('visible');
      if (targetButton) {
        const rect = targetButton.getBoundingClientRect();
        const scrollY = window.scrollY;
        let top = rect.top + scrollY - modal.offsetHeight - 12;

        if (rect.top < modal.offsetHeight + 20) {
          top = rect.bottom + scrollY + 12;
        }
        modal.style.top = `${top}px`;
      }
    });



    textarea.focus();

    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    });

    const close = (val: string | null) => {
      modal.classList.remove('visible');
      setTimeout(() => host.remove(), 200);
      resolve(val);
      document.removeEventListener('mousedown', handleOutsideClick);
    };

    const handleOutsideClick = (e: MouseEvent) => {
      if (e.target !== targetButton && !targetButton?.contains(e.target as Node)) {
        close(null);
      }
    };

    setTimeout(() => {
      document.addEventListener('mousedown', handleOutsideClick);
    }, 100);

    submitBtn.onclick = () => {
      if (textarea.value.trim()) close(textarea.value);
    };

    textarea.onkeydown = (e) => {
      e.stopPropagation();
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (textarea.value.trim()) close(textarea.value);
      }
      if (e.key === 'Escape') {
        close(null);
      }
    };

    textarea.addEventListener('keyup', (e) => e.stopPropagation());
    textarea.addEventListener('keypress', (e) => e.stopPropagation());
  });
}
