import { isVideoWatchPage } from '../../../lib/utils';

export function observeNavigation(onWatchPage: () => void) {
    let lastUrl = window.location.href;
    let scheduled = false;

    const schedule = () => {
        if (scheduled) return;
        scheduled = true;
        setTimeout(() => {
            scheduled = false;
            const currentUrl = window.location.href;
            if (currentUrl === lastUrl) return;
            lastUrl = currentUrl;
            if (isVideoWatchPage()) {
                onWatchPage();
            }
        }, 250);
    };

    window.addEventListener('yt-navigate-finish', schedule as EventListener);
    window.addEventListener('popstate', schedule);
    window.addEventListener('hashchange', schedule);

    const observer = new MutationObserver(schedule);
    observer.observe(document.body, { childList: true, subtree: true });
}
