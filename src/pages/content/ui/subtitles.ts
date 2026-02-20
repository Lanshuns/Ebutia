import config from '../../../../config.json';
const { button } = config.youtube.subtitles;

export async function checkForSubtitles(): Promise<boolean> {
  const captionButton = document.querySelector(button);

  if (!captionButton) {
    return false;
  }

  const ariaDisabled = captionButton.getAttribute('aria-disabled');
  return ariaDisabled !== 'true';
}
