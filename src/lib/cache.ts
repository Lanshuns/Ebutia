import { Logger } from './logger';

export interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

export interface TranscriptData {
    title: string;
    transcript: { timestamp: string; text: string; }[];
    chapters?: string[];
}

const CACHE_PREFIX = 'transcript_';
const EXPIRATION_MS = 24 * 60 * 60 * 1000;

export const transcriptCache = {
    async get(videoId: string): Promise<TranscriptData | null> {
        try {
            if (!chrome.runtime?.id) {
                return null;
            }
            const key = CACHE_PREFIX + videoId;
            const result = await chrome.storage.local.get(key);
            const entry = result[key] as CacheEntry<TranscriptData>;

            if (entry && Date.now() - entry.timestamp < EXPIRATION_MS) {
                return entry.data;
            }
            return null;
        } catch (e) {
            Logger.error("Error getting cache entry:", e);
            return null;
        }
    },

    async set(videoId: string, data: TranscriptData): Promise<void> {
        try {
            if (!chrome.runtime?.id) {
                return;
            }
            const key = CACHE_PREFIX + videoId;
            const entry: CacheEntry<TranscriptData> = {
                data,
                timestamp: Date.now()
            };

            await chrome.storage.local.set({ [key]: entry });

            if (Math.random() < 0.1) {
                const allData = await chrome.storage.local.get(null);
                const keysToRemove: string[] = [];
                const now = Date.now();

                Object.keys(allData).forEach(k => {
                    if (k.startsWith(CACHE_PREFIX)) {
                        const item = allData[k] as CacheEntry<TranscriptData>;
                        if (now - item.timestamp > EXPIRATION_MS) {
                            keysToRemove.push(k);
                        }
                    }
                });

                if (keysToRemove.length > 0) {
                    await chrome.storage.local.remove(keysToRemove);
                }
            }
        } catch (e) {
            Logger.error("Error setting cache entry:", e);
        }
    }
};
