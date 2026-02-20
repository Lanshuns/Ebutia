import type { EbutiaSettings, VideoInfo } from '../../../index';
import { getVideoIdFromUrl, isVideoWatchPage } from '../../../lib/utils';
import { checkForSubtitles } from '../ui/subtitles';
import { showChatInputModal } from '../ui/chatModal';
import { showToast, showFallbackToast } from '../ui/toast';
import { safelySendMessage, saveSettingsViaMessage } from './messaging';
import { extractTranscript, formatTranscriptForPrompt } from './transcript';
import { ErrorHandler } from '../../../lib/errorHandler';
import { getLanguageInstruction } from '../../../lib/prompts';

export type ButtonAction = 'summarize' | 'chat';

export interface HandleButtonClickDeps {
  getGlobalSettings: () => EbutiaSettings;
}

export function createHandleButtonClick(deps: HandleButtonClickDeps) {
  return async function handleButtonClick(
    videoId: string,
    action: ButtonAction = 'summarize',
    event?: MouseEvent
  ) {
    try {
      const baseSettings = deps.getGlobalSettings();
      let settings = baseSettings;

      const currentPageVideoId = getVideoIdFromUrl(window.location.href);
      const isCurrentVideo = isVideoWatchPage() && currentPageVideoId === videoId;

      let shouldUseTranscript = false;

      if (isCurrentVideo) {
        const hasSubtitles = await checkForSubtitles();

        if (settings.summarySource === 'transcript') {
          if (hasSubtitles) {
            shouldUseTranscript = true;
          } else {
            if (settings.useUrlWhenNoTranscript) {
              shouldUseTranscript = false;
            } else {
              const choice = await showFallbackToast();
              if (choice === 'cancel') return;

              if (choice === 'always') {
                settings = { ...settings, useUrlWhenNoTranscript: true };
                await saveSettingsViaMessage(settings);
              }
              shouldUseTranscript = false;
            }
          }
        }
      }

      const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;

      const videoInfo: VideoInfo = {
        videoId,
        videoUrl,
        hasSubtitles: true
      };

      let promptOverride: string | undefined;

      if (action === 'summarize') {
        if (shouldUseTranscript) {
          try {
            const transcriptData = await extractTranscript();
            if (transcriptData) {
              promptOverride = formatTranscriptForPrompt(transcriptData);
            }
          } catch (error) {
            const { shouldContinue, updatedSettings } = await handleTranscriptFallback(settings);
            if (!shouldContinue) return;
            settings = updatedSettings;
          }
        }
      }

      if (action === 'chat') {
        const target = event?.currentTarget as HTMLElement | undefined;
        const userPrompt = await showChatInputModal(target);
        if (!userPrompt) return;

        const langPart = getLanguageInstruction(settings.language).trim();
        const langSuffix = langPart ? `\n\n${langPart}` : '';

        if (shouldUseTranscript) {
          try {
            const transcriptData = await extractTranscript();
            if (transcriptData) {
              const transcriptText = formatTranscriptForPrompt(transcriptData);
              promptOverride = `${userPrompt}${langSuffix}\n\n${transcriptText}`;
            } else {
              promptOverride = `${userPrompt}${langSuffix}`;
            }
          } catch (error) {
            const { shouldContinue, updatedSettings } = await handleTranscriptFallback(settings);
            if (!shouldContinue) return;
            settings = updatedSettings;
            promptOverride = `${userPrompt}${langSuffix}`;
          }
        } else if (!isCurrentVideo) {
          promptOverride = `${userPrompt}${langSuffix}\n\n${videoUrl}`;
        } else {
          promptOverride = `${userPrompt}${langSuffix}`;
        }
      }

      safelySendMessage({
        action: 'openAITab',
        videoInfo,
        prompt: promptOverride,
        promptAction: action,
        isHover: !isCurrentVideo,
        openIn: settings.openIn
      }, (response) => {
        if (response?.showIncognitoToast) {
          showToast('Ebutia is not allowed in private windows. Please enable it in extension settings.', 6000, 'error');
        }
      });
    } catch (error) {
      ErrorHandler.log(error);
      const message = ErrorHandler.getUserMessage(error);
      showToast(message, 5000, 'error');
    }
  };
};


async function handleTranscriptFallback(settings: EbutiaSettings): Promise<{ shouldContinue: boolean; updatedSettings: EbutiaSettings }> {
  if (settings.useUrlWhenNoTranscript) {
    return { shouldContinue: true, updatedSettings: settings };
  }

  const choice = await showFallbackToast();
  if (choice === 'cancel') return { shouldContinue: false, updatedSettings: settings };

  let updatedSettings = settings;
  if (choice === 'always') {
    updatedSettings = { ...settings, useUrlWhenNoTranscript: true };
    await saveSettingsViaMessage(updatedSettings);
  }
  return { shouldContinue: true, updatedSettings };
}
