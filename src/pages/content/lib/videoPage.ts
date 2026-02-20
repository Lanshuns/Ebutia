import type { EbutiaSettings } from '../../../index';
import { getVideoIdFromUrl } from '../../../lib/utils';
import { addEbutiaPlayerButton, removeEbutiaControls } from '../ui/playerButtons';
import { addFloatingButton, removeFloatingButton } from '../ui/floatingButton';

export interface VideoPageDeps {
  getSettings: () => Promise<EbutiaSettings>;
  getGlobalSettings: () => EbutiaSettings;
  setCurrentVideoId: (id: string | null) => void;
  getCurrentVideoId: () => string | null;
  getOverlayButton: () => HTMLElement | null;
  setOverlayButton: (el: HTMLElement | null) => void;
  onSummarize: (videoId: string) => void;
  onChat: (videoId: string, e?: MouseEvent) => void;
}

export async function handleVideoPage(deps: VideoPageDeps) {
  const videoId = getVideoIdFromUrl(window.location.href);

  if (!videoId || videoId === deps.getCurrentVideoId()) {
    return;
  }

  deps.setCurrentVideoId(videoId);

  const settings = await deps.getSettings();

  const shouldShow = settings.showPlayerButtons !== false;
  const position = settings.buttonPosition || 'floating';

  const removeControls = () => {
    removeEbutiaControls(deps.getOverlayButton, deps.setOverlayButton);
    removeFloatingButton();
  };

  if (shouldShow) {
    if (position === 'floating') {
      removeEbutiaControls(deps.getOverlayButton, deps.setOverlayButton);
      await addFloatingButton(
        deps.getGlobalSettings,
        () => deps.onSummarize(videoId),
        (e) => deps.onChat(videoId, e)
      );
    } else {
      removeFloatingButton();
      await addEbutiaPlayerButton(
        position,
        deps.getGlobalSettings,
        () => deps.onSummarize(videoId),
        (e) => deps.onChat(videoId, e),
        () => removeEbutiaControls(deps.getOverlayButton, deps.setOverlayButton)
      );
    }
  } else {
    removeControls();
  }
}
