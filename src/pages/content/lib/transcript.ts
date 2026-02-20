import { Logger } from '../../../lib/logger';

export interface TranscriptSegment {
  timestamp: string;
  text: string;
}

export interface TranscriptData {
  title: string;
  transcript: TranscriptSegment[];
  chapters?: string[];
}

import config from '../../../../config.json';
import { transcriptCache } from '../../../lib/cache';
import { getVideoIdFromUrl } from '../../../lib/utils';
import { createAppError, ErrorType } from '../../../lib/errorHandler';
const { title, openButton, panel, chapters, segments, segmentTimestamp, segmentText, closeButton } = config.youtube.transcript;

function waitForElement(selector: string, timeout = 5000): Promise<Element | null> {
  return new Promise((resolve) => {
    const existing = document.querySelector(selector);
    if (existing) {
      resolve(existing);
      return;
    }

    const observer = new MutationObserver(() => {
      const element = document.querySelector(selector);
      if (element) {
        observer.disconnect();
        resolve(element);
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(() => {
      observer.disconnect();
      resolve(null);
    }, timeout);
  });
}

function getVideoTitle(): string {
  const titleElement = document.querySelector(title);
  return titleElement?.textContent?.trim() || '';
}

async function openTranscriptPanel(): Promise<boolean> {
  const selectors = Array.isArray(openButton) ? openButton : [openButton];
  let transcriptButton: HTMLElement | null = null;

  for (const selector of selectors) {
    transcriptButton = document.querySelector(selector) as HTMLElement;
    if (transcriptButton) break;
  }

  if (!transcriptButton) {
    const expandButton = document.querySelector('#expand');
    if (expandButton && expandButton.getAttribute('hidden') === null) {
      (expandButton as HTMLElement).click();
      await new Promise(resolve => setTimeout(resolve, 300));

      for (const selector of selectors) {
        transcriptButton = document.querySelector(selector) as HTMLElement;
        if (transcriptButton) break;
      }
    }
  }

  if (!transcriptButton) {
    return false;
  }

  transcriptButton.click();

  const panelEl = await waitForElement(panel);

  return panelEl !== null;
}

function extractChapters(): string[] {
  const chaptersList: string[] = [];
  const chapterElements = document.querySelectorAll(
    chapters
  );

  chapterElements.forEach((el) => {
    const chapterText = el.textContent?.trim();
    if (chapterText) {
      chaptersList.push(chapterText);
    }
  });

  return chaptersList;
}

function extractTranscriptSegments(): TranscriptSegment[] {
  const segmentsList: TranscriptSegment[] = [];
  const segmentElements = document.querySelectorAll(segments);

  segmentElements.forEach((el) => {
    const timestampEl = el.querySelector(segmentTimestamp);
    const textEl = el.querySelector(segmentText);

    if (timestampEl && textEl) {
      const timestamp = timestampEl.textContent?.trim() || '';
      const text = textEl.textContent?.trim() || '';

      if (timestamp && text) {
        segmentsList.push({ timestamp, text });
      }
    }
  });

  return segmentsList;
}

function closeTranscriptPanel(): void {
  const selector = closeButton;

  const closeBtn = document.querySelector(selector) as HTMLButtonElement;
  if (closeBtn) {
    closeBtn.click();
    return;
  }
}

export async function extractTranscript(): Promise<TranscriptData | null> {
  try {
    const videoId = getVideoIdFromUrl(window.location.href);
    if (videoId) {
      const cached = await transcriptCache.get(videoId);
      if (cached) {
        return cached;
      }
    }

    const title = getVideoTitle();
    const opened = await openTranscriptPanel();
    if (!opened) {
      throw createAppError(ErrorType.TRANSCRIPT_NOT_FOUND, 'Could not open transcript panel');
    }

    await new Promise(resolve => setTimeout(resolve, 1000));

    const chapters = extractChapters();
    const transcript = extractTranscriptSegments();

    closeTranscriptPanel();

    if (transcript.length === 0) {
      throw createAppError(ErrorType.PARSING, 'Transcript content is empty');
    }

    const data = {
      title,
      transcript,
      chapters: chapters.length > 0 ? chapters : undefined
    };

    if (videoId) {
      await transcriptCache.set(videoId, data);
    }

    return data;
  } catch (error: any) {
    if (error.type) throw error;
    Logger.error('Failed to extract transcript:', error);
    throw createAppError(ErrorType.UNKNOWN, 'Failed to extract transcript', error);
  }
}

export function formatTranscriptForPrompt(data: TranscriptData): string {
  let formatted = '';

  if (data.title) {
    formatted += `Title: ${data.title}\n\n`;
  }
  if (data.chapters && data.chapters.length > 0) {
    formatted += `Chapters:\n${data.chapters.map((ch, i) => `${i + 1}. ${ch}`).join('\n')}\n\n`;
  }

  formatted += 'Transcript:\n';
  data.transcript.forEach((segment) => {
    formatted += `[${segment.timestamp}] ${segment.text}\n`;
  });

  return formatted.trim();
}
