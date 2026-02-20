import { EbutiaSettings, DEFAULT_SETTINGS } from '../index';
import { Logger } from './logger';

type Theme = 'light' | 'dark' | 'system';

export const storage = {
  async ensureDefaults(): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.get(['ebutiaSettings'], (result) => {
        if (chrome.runtime.lastError) {
          Logger.error('Failed to read settings:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
          return;
        }

        if (result && result.ebutiaSettings) {
          resolve();
          return;
        }

        chrome.storage.local.set({ ebutiaSettings: DEFAULT_SETTINGS }, () => {
          if (chrome.runtime.lastError) {
            Logger.error('Failed to write default settings:', chrome.runtime.lastError);
            reject(chrome.runtime.lastError);
          } else {
            resolve();
          }
        });
      });
    });
  },

  async getSettings(): Promise<EbutiaSettings> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['ebutiaSettings'], (result) => {
        if (result && result.ebutiaSettings) {
          const loadedSettings = result.ebutiaSettings as EbutiaSettings;
          const normalizedSettings: EbutiaSettings = { ...loadedSettings };

          resolve({ ...DEFAULT_SETTINGS, ...normalizedSettings });
        } else {
          resolve(DEFAULT_SETTINGS);
        }
      });
    });
  },

  async saveSettings(settings: EbutiaSettings): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ ebutiaSettings: settings }, () => {
        if (chrome.runtime.lastError) {
          Logger.error('Failed to save settings:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  },

  async getTheme(): Promise<Theme> {
    return new Promise((resolve) => {
      chrome.storage.local.get(['ebutiaTheme'], (result) => {
        resolve((result && (result.ebutiaTheme as Theme)) || 'system');
      });
    });
  },

  async saveTheme(theme: Theme): Promise<void> {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ ebutiaTheme: theme }, () => {
        if (chrome.runtime.lastError) {
          Logger.error('Failed to save theme:', chrome.runtime.lastError);
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
};
