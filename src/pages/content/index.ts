import { DEFAULT_SETTINGS, type EbutiaSettings } from '../../index';
import { getVideoIdFromUrl, isVideoWatchPage } from '../../lib/utils';
import { createHandleButtonClick } from './lib/actions';
import { initializeHoverButton } from './ui/hoverButton';
import { handleVideoPage } from './lib/videoPage';
import { checkForSubtitles } from './ui/subtitles';
import { getSettingsViaMessage, registerContentRuntimeListeners } from './lib/messaging';
import { extractTranscript, formatTranscriptForPrompt } from './lib/transcript';
import { Logger } from '../../lib/logger';


import { observeNavigation } from './lib/navigation';

let currentVideoId: string | null = null;
let ebutiaOverlayButton: HTMLElement | null = null;
let globalSettings: EbutiaSettings = DEFAULT_SETTINGS;

void initialize().catch(Logger.error);

async function initialize() {
	const getGlobalSettings = () => globalSettings;
	const getSettings = async () => {
		const settings = await getSettingsViaMessage(DEFAULT_SETTINGS);
		return { ...DEFAULT_SETTINGS, ...settings };
	};

	try {
		globalSettings = await getSettings();
	} catch {
	}

	const handleButtonClick = createHandleButtonClick({
		getGlobalSettings
	});

	const handleVideoPageFn = () =>
		handleVideoPage({
			getSettings,
			getGlobalSettings,
			getCurrentVideoId: () => currentVideoId,
			setCurrentVideoId: (id) => {
				currentVideoId = id;
			},
			getOverlayButton: () => ebutiaOverlayButton,
			setOverlayButton: (el) => {
				ebutiaOverlayButton = el;
			},
			onSummarize: (videoId) => {
				void handleButtonClick(videoId, 'summarize');
			},
			onChat: (videoId, e) => {
				void handleButtonClick(videoId, 'chat', e);
			}
		});

	chrome.storage.onChanged.addListener((changes, area) => {
		if (area !== 'local') return;

		const settingsChange = (changes as Record<string, chrome.storage.StorageChange>).ebutiaSettings;
		if (!settingsChange || settingsChange.newValue == null) return;

		const oldSettingsRaw = settingsChange.oldValue as EbutiaSettings | undefined;
		const newSettingsRaw = settingsChange.newValue as EbutiaSettings;
		const oldSettings = oldSettingsRaw ? { ...DEFAULT_SETTINGS, ...oldSettingsRaw } : undefined;
		const newSettings = { ...DEFAULT_SETTINGS, ...newSettingsRaw };
		globalSettings = newSettings;

		if (currentVideoId) {
			const oldPos = oldSettings?.buttonPosition;
			const newPos = newSettings?.buttonPosition;
			if (oldPos !== newPos) {
				handleVideoPageFn();
			}
		}
	});

	if (isVideoWatchPage()) {
		handleVideoPageFn();
	}

	observeNavigation(handleVideoPageFn);

	initializeHoverButton({
		isEnabled: () => getGlobalSettings().showHoverIconOnHome,
		onClickSummarize: (videoId) => handleButtonClick(videoId, 'summarize'),
		onClickChat: (videoId, e) => handleButtonClick(videoId, 'chat', e)
	});

	registerContentRuntimeListeners(async () => {
		const videoId = getVideoIdFromUrl(window.location.href);
		if (videoId && isVideoWatchPage()) {
			const hasSubtitles = await checkForSubtitles();
			return {
				videoId,
				videoUrl: window.location.href,
				hasSubtitles
			};
		}
		return null;
	}, (videoId, action) => {
		void handleButtonClick(videoId, action);
	}, async () => {
		if (isVideoWatchPage()) {
			try {
				const transcriptData = await extractTranscript();
				return transcriptData ? formatTranscriptForPrompt(transcriptData) : null;
			} catch (e) {
				return null;
			}
		}
		return null;
	});
}



export { };
