import { EbutiaSettings } from '../index';

export interface PromptTemplate {
  id: string;
  name: string;
  template: string;
}

export const ADVANCED_PROMPT = `
You are an expert video summarizer. 
Please summarize this video using precise and concise language. 
Use headers and bulleted lists in the summary, to make it scannable. 
Maintain the meaning and factual accuracy.`;

export function getLanguageInstruction(language: string): string {
  if (language === 'Same as transcript') {
    return '\n\nDetect and use the same transcript or title language.';
  }
  if (language) {
    return `\n\nPlease provide the entire response in ${language}.`;
  }
  return '';
}

export function generateAdvancedPrompt(videoUrl: string, language: string): string {
  const languageInstruction = getLanguageInstruction(language);

  return `Video URL: ${videoUrl}
${ADVANCED_PROMPT}${languageInstruction}`;
}

export function generateFinalPrompt(
  videoUrl: string,
  settings: EbutiaSettings,
  customPromptOverride?: string,
  action?: 'summarize' | 'chat',
  _isHover?: boolean
): string {
  if (action === 'chat') {
    return (customPromptOverride ?? '').trim();
  }

  if (customPromptOverride) {
    const languageInstruction = getLanguageInstruction(settings.language);

    let promptContent = ADVANCED_PROMPT;

    if (settings.promptMode === 'simple') {
      promptContent = 'Summarize this video:';
    }

    promptContent += languageInstruction;

    if (promptContent.includes('{SOURCE}')) {
      return promptContent.replace(/{SOURCE}/g, customPromptOverride);
    }

    return `${promptContent}\n\n${customPromptOverride}`;
  }

  if (settings.promptMode === 'simple') {
    const languageInstruction = getLanguageInstruction(settings.language);

    return `Summarize this video: ${videoUrl}${languageInstruction}`;
  }

  if (settings.promptMode === 'advanced' || !settings.promptMode) {
    return generateAdvancedPrompt(videoUrl, settings.language);
  }

  return generateAdvancedPrompt(videoUrl, settings.language);
}

export default {
  ADVANCED_PROMPT,
  generateAdvancedPrompt
};
