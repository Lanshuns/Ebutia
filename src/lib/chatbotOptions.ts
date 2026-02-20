import type { AIChatbot } from '../index';
import chatbotsConfig from '../../config.json';

export const CHATBOT_ICONS: Record<string, string> = {
    '': '',
};

export const CHATBOT_OPTIONS: { value: AIChatbot | ''; label: string }[] = [
    { value: '', label: 'Default' },
];

Object.entries(chatbotsConfig.chatbots).forEach(([key, config]) => {
    const domain = (config as any).iconDomain || new URL(config.baseUrl).hostname;
    CHATBOT_ICONS[key] = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    CHATBOT_OPTIONS.push({
        value: key as AIChatbot,
        label: (config as any).name || key.charAt(0).toUpperCase() + key.slice(1)
    });
});
