import React, { useState, useEffect } from 'react';
import { EbutiaSettings, DEFAULT_SETTINGS } from '..';
import { storage } from '../lib/storage';
import Settings from './Settings';
import Header from './Header';
import Home from './Home';
import Account from './Account';
import Changelog from './Changelog';
import About from './About';
import { Logger } from '../lib/logger';


type Theme = 'light' | 'dark' | 'system';
type Page = 'home' | 'settings' | 'account' | 'changelog' | 'about';

const APP_VERSION = chrome.runtime.getManifest().version;

const isDev = import.meta.env?.DEV ?? false;

const App: React.FC = () => {
  const [settings, setSettings] = useState<EbutiaSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [currentPage, setCurrentPage] = useState<Page>('home');

  useEffect(() => {
    loadSettings();
    loadTheme();
    checkForUpdates();
  }, []);

  const checkForUpdates = async () => {
    try {
      const result = await chrome.storage.local.get(['ebutiaLastVersion']);
      const lastVersion = result.ebutiaLastVersion;

      if (!lastVersion || lastVersion !== APP_VERSION) {
        setCurrentPage('changelog');
        await chrome.storage.local.set({ ebutiaLastVersion: APP_VERSION });
      }
    } catch (error) {
      if (isDev) Logger.error('Failed to check version:', error);
    }
  };

  useEffect(() => {
    applyTheme();
  }, [theme]);

  const loadSettings = async () => {
    try {
      const loadedSettings = await storage.getSettings();
      setSettings(loadedSettings);
    } catch (error) {
      if (isDev) Logger.error('Failed to load settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTheme = async () => {
    try {
      const loadedTheme = await storage.getTheme();
      setTheme(loadedTheme);
    } catch (error) {
      if (isDev) Logger.error('Failed to load theme:', error);
    }
  };

  const applyTheme = () => {
    let shouldBeDark = false;

    if (theme === 'system') {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    } else {
      shouldBeDark = theme === 'dark';
    }

    setIsDark(shouldBeDark);
    document.body.className = shouldBeDark ? 'dark' : '';
  };

  const handleThemeChange = async (newTheme: Theme) => {
    setTheme(newTheme);
    try {
      await storage.saveTheme(newTheme);
    } catch (error) {
      if (isDev) Logger.error('Failed to save theme:', error);
    }
  };

  const handleSettingsChange = async (newSettings: EbutiaSettings) => {
    try {
      setSettings(newSettings);

      const changed =
        settings.buttonPosition !== newSettings.buttonPosition ||
        settings.showPlayerButtons !== newSettings.showPlayerButtons ||
        settings.showHoverIconOnHome !== newSettings.showHoverIconOnHome ||
        settings.summarySource !== newSettings.summarySource ||
        settings.useUrlWhenNoTranscript !== newSettings.useUrlWhenNoTranscript ||
        settings.showAskButton !== newSettings.showAskButton ||
        settings.showContextMenu !== newSettings.showContextMenu;

      if (changed) {
        Logger.log('Main settings changed, triggering refresh banner', {
          old: settings,
          new: newSettings
        });
        setNeedsRefresh(true);
      }

      await storage.saveSettings(newSettings);
    } catch (error) {
      if (isDev) Logger.error('Failed to save settings:', error);
    }
  };

  const handleRefresh = async () => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    if (activeTab?.id && activeTab.url && activeTab.url.includes('youtube.com')) {
      chrome.tabs.reload(activeTab.id);
      setNeedsRefresh(false);
    }
  };

  if (loading) {
    return (
      <div className={`app-container ${isDark ? 'dark' : ''}`}>
        <Header
          isDark={isDark}
          theme={theme}
          onThemeChange={handleThemeChange}
          onNavigate={setCurrentPage}
          currentPage={currentPage}
        />
        <div className={`settings-footer ${isDark ? 'text-gray-dark' : 'text-gray-light'}`}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <div className={`app-container ${isDark ? 'dark' : ''}`}>
      <Header
        isDark={isDark}
        theme={theme}
        onThemeChange={handleThemeChange}
        onNavigate={setCurrentPage}
        currentPage={currentPage}
      />

      <div className="content-container">
        {needsRefresh && (
          <div className={`refresh-banner ${isDark ? 'dark' : ''}`}>
            <span>Settings changed. Refresh to apply?</span>
            <button onClick={handleRefresh}>Refresh</button>
          </div>
        )}

        {currentPage === 'home' && (
          <Home
            settings={settings}
            onSettingsChange={handleSettingsChange}
            isDark={isDark}
          />
        )}

        {currentPage === 'settings' && (
          <Settings
            settings={settings}
            onSettingsChange={handleSettingsChange}
            isDark={isDark}
          />
        )}

        {currentPage === 'account' && (
          <Account isDark={isDark} />
        )}

        {currentPage === 'changelog' && (
          <Changelog
            isDark={isDark}
          />
        )}

        {currentPage === 'about' && (
          <About isDark={isDark} />
        )}
      </div>


    </div>
  );
};

export default App;
