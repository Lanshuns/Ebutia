export function getVideoIdFromUrl(url: string): string | null {
  let urlObj: URL;
  try {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://www.youtube.com';
    urlObj = new URL(url, baseUrl);
  } catch {
    return null;
  }

  if (urlObj.pathname === '/watch') {
    return urlObj.searchParams.get('v');
  }

  if (urlObj.hostname === 'youtu.be') {
    return urlObj.pathname.slice(1);
  }

  const embedMatch = urlObj.pathname.match(/\/embed\/([^/?]+)/);
  if (embedMatch) {
    return embedMatch[1];
  }

  return null;
}

export function isVideoWatchPage(): boolean {
  return window.location.pathname === '/watch' && window.location.search.includes('v=');
}

export function waitForElement(selector: string, timeout = 10000): Promise<Element | null> {
  return new Promise((resolve) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearTimeout(timeoutId);
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    const timeoutId = setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

export function setNativeValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  const valueSetter = Object.getOwnPropertyDescriptor(element, 'value')?.set;
  const prototype = Object.getPrototypeOf(element);
  const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value')?.set;

  if (prototypeValueSetter && valueSetter !== prototypeValueSetter) {
    prototypeValueSetter.call(element, value);
  } else if (valueSetter) {
    valueSetter.call(element, value);
  } else {
    element.value = value;
  }
}

export function fireInputEvents(element: HTMLElement) {
  const events = [
    new Event('input', { bubbles: true }),
    new Event('change', { bubbles: true })
  ];
  events.forEach(event => element.dispatchEvent(event));
}
