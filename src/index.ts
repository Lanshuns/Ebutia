export type AIChatbot = 'perplexity' | 'copilot' | 'lumo';
export type PromptMode = 'simple' | 'advanced';

export interface UserTemplate {
  id: string;
  name: string;
  template: string;
  chatbot?: AIChatbot;
}

export interface EbutiaSettings {
  aiChatbot: AIChatbot;
  customPrompt: string;
  openIn: OpenTargetType;
  promptMode: PromptMode;
  language: string;
  selectedTemplateId: string;
  userTemplates: UserTemplate[];
  buttonPosition: 'metadata' | 'floating';
  showPlayerButtons?: boolean;
  showHoverIconOnHome: boolean;
  showAskButton: boolean;
  showContextMenu: boolean;
  alwaysOnTop: boolean;
  usePrivateWindow: boolean;
  summarySource: 'url' | 'transcript';
  urlChatbot?: AIChatbot;
  useUrlWhenNoTranscript: boolean;
  lumoGuestMode: boolean;
  windowPosition?: {
    left: number;
    top: number;
    width: number;
    height: number;
  };
}

export const DEFAULT_SETTINGS: EbutiaSettings = {
  aiChatbot: 'perplexity',
  customPrompt: '',
  openIn: 'popup',
  promptMode: 'simple',
  language: '',
  selectedTemplateId: '',
  userTemplates: [],
  buttonPosition: 'floating',
  showHoverIconOnHome: true,
  showAskButton: true,
  showContextMenu: true,
  alwaysOnTop: false,
  usePrivateWindow: false,
  summarySource: 'transcript',
  urlChatbot: 'copilot',
  useUrlWhenNoTranscript: false,
  lumoGuestMode: true,
};

export interface VideoInfo {
  videoId: string;
  videoUrl: string;
  hasSubtitles: boolean;
}

export interface MessageRequest {
  action: 'getSettings' | 'saveSettings' | 'openAITab' | 'showToast' | 'getVideoInfo' | 'handleContextMenu' | 'getTranscript';
  videoInfo?: VideoInfo;
  prompt?: string;
  message?: string;
  duration?: number;
  menuAction?: 'summarize' | 'chat';
  promptAction?: 'summarize' | 'chat';
  isHover?: boolean;
  openIn?: OpenTargetType;
  targetTabId?: number;
}

export interface MessageResponse {
  success: boolean;
  settings?: EbutiaSettings;
  videoInfo?: VideoInfo | null;
  error?: string;
  showIncognitoToast?: boolean;
}

export interface ChatbotHandler {
  name: string;
  canHandle(url: string): boolean;
  fillPrompt(prompt: string): Promise<boolean>;
}

export type OpenTargetType = 'tab' | 'popup';

export interface PendingPromptPayload {
  prompt: string;
  timestamp: number;
  type?: OpenTargetType;
  targetUrl?: string;
}

export const PENDING_PROMPT_STORAGE_KEY = 'ebutia_pending_prompt' as const;
export const PENDING_PROMPT_TTL_MS = 60_000 as const;

export function getPendingPromptKey(tabId?: number): string {
  return tabId ? `${PENDING_PROMPT_STORAGE_KEY}_${tabId}` : PENDING_PROMPT_STORAGE_KEY;
}
