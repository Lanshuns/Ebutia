export function showToast(msgText: string, duration = 5000, type: 'info' | 'error' | 'success' = 'info') {
  const existingToast = document.querySelector('.ebutia-toast');
  if (existingToast) existingToast.remove();

  const toast = document.createElement('div');
  toast.className = `ebutia-refresh-toast ebutia-toast ${type}`;

  if (type === 'error') {
    toast.style.backgroundColor = '#fee2e2';
    toast.style.color = '#991b1b';
    toast.style.border = '1px solid #f87171';
  } else if (type === 'success') {
    toast.style.backgroundColor = '#dcfce7';
    toast.style.color = '#166534';
    toast.style.border = '1px solid #4ade80';
  }

  const message = document.createElement('span');
  message.textContent = msgText;

  const closeBtn = document.createElement('button');
  closeBtn.className = 'ebutia-refresh-button';
  closeBtn.textContent = 'Close';
  closeBtn.style.marginLeft = '10px';
  closeBtn.onclick = () => toast.remove();

  toast.appendChild(message);
  toast.appendChild(closeBtn);

  document.body.appendChild(toast);

  if (duration > 0) {
    setTimeout(() => {
      if (toast.parentNode) {
        toast.remove();
      }
    }, duration);
  }
}

export function showRefreshToast() {
  if (document.querySelector('.ebutia-refresh-toast:not(.ebutia-toast)')) return;

  const toast = document.createElement('div');
  toast.className = 'ebutia-refresh-toast';

  const message = document.createElement('span');
  message.textContent = 'Ebutia updated. Please refresh the page.';

  const button = document.createElement('button');
  button.className = 'ebutia-refresh-button';
  button.textContent = 'Refresh';
  button.onclick = () => window.location.reload();

  toast.appendChild(message);
  toast.appendChild(button);

  document.body.appendChild(toast);

  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove();
    }
  }, 10000);
}

export function showFallbackToast(): Promise<'once' | 'always' | 'cancel'> {
  return new Promise((resolve) => {
    const existingToast = document.querySelector('.ebutia-fallback-toast');
    if (existingToast) existingToast.remove();

    const toast = document.createElement('div');
    toast.className = 'ebutia-refresh-toast ebutia-fallback-toast';
    toast.style.flexDirection = 'column';
    toast.style.alignItems = 'flex-start';
    toast.style.gap = '8px';
    toast.style.backgroundColor = '#1f2937';
    toast.style.borderColor = '#4b5563';

    const message = document.createElement('span');
    message.textContent = 'No transcript found for this video, do you want to try summary using YouTube URL?';
    message.style.marginBottom = '4px';

    const description = document.createElement('span');
    description.textContent = 'Some AI chatbots may still be able to summarize it.';
    description.style.fontSize = '12px';
    description.style.opacity = '0.9';
    description.style.marginBottom = '4px';

    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.gap = '8px';
    buttonContainer.style.width = '100%';
    buttonContainer.style.justifyContent = 'flex-end';

    const onceBtn = document.createElement('button');
    onceBtn.className = 'ebutia-refresh-button';
    onceBtn.textContent = 'Just once';
    onceBtn.style.opacity = '0.9';
    onceBtn.onclick = () => {
      resolve('once');
      toast.remove();
    };

    const alwaysBtn = document.createElement('button');
    alwaysBtn.className = 'ebutia-refresh-button';
    alwaysBtn.textContent = 'Always';
    alwaysBtn.onclick = () => {
      resolve('always');
      toast.remove();
    };

    const closeBtn = document.createElement('button');
    closeBtn.className = 'ebutia-refresh-button';
    closeBtn.innerHTML = '&times;';
    closeBtn.style.backgroundColor = 'transparent';
    closeBtn.style.padding = '0 6px';
    closeBtn.style.marginLeft = 'auto';
    closeBtn.style.position = 'absolute';
    closeBtn.style.top = '8px';
    closeBtn.style.right = '8px';
    closeBtn.onclick = () => {
      resolve('cancel');
      toast.remove();
    };

    message.style.paddingRight = '20px';

    buttonContainer.appendChild(onceBtn);
    buttonContainer.appendChild(alwaysBtn);

    toast.appendChild(closeBtn);
    toast.appendChild(message);
    toast.appendChild(description);
    toast.appendChild(buttonContainer);

    document.body.appendChild(toast);

    setTimeout(() => {
      if (toast.parentNode) {
        resolve('cancel');
        toast.remove();
      }
    }, 15000);
  });
}
