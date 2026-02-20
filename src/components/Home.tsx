import React, { useState, useEffect } from 'react';
import type { EbutiaSettings, OpenTargetType } from '..';
import { DEFAULT_SETTINGS } from '..';
import { TabIcon, WindowIcon, ChevronDownIcon, LinkIcon } from './ui/Icons';
import { CHATBOT_ICONS, CHATBOT_OPTIONS } from '../lib/chatbotOptions';
import Prompts from './Prompts';
import ChatbotPickerModal from './ChatbotPicker';
import OpenModePickerModal from './OpenModePicker';

interface HomeProps {
  settings: EbutiaSettings;
  onSettingsChange: (settings: EbutiaSettings) => void;
  isDark: boolean;
}

const Home: React.FC<HomeProps> = ({ settings, onSettingsChange, isDark }) => {
  const [localSettings, setLocalSettings] = useState<EbutiaSettings>({
    ...DEFAULT_SETTINGS,
    ...settings
  });

  const [isPickerOpen, setIsPickerOpen] = useState(false);

  const [isOpenModePickerOpen, setIsOpenModePickerOpen] = useState(false);
  const [tempSelectedOpenMode, setTempSelectedOpenMode] = useState<OpenTargetType>(settings.openIn);
  const [tempUsePrivateWindow, setTempUsePrivateWindow] = useState(settings.usePrivateWindow);

  useEffect(() => {
    setLocalSettings(prev => ({ ...prev, ...settings }));
  }, [settings]);

  const updateSettings = (newSettings: EbutiaSettings) => {
    setLocalSettings(newSettings);
    onSettingsChange(newSettings);
  };

  const effectiveUrlChatbot = localSettings.urlChatbot || localSettings.aiChatbot;
  const urlChatbotLabel = CHATBOT_OPTIONS.find(p => p.value === effectiveUrlChatbot)?.label || effectiveUrlChatbot;
  const showUrlChatbotSeparate = localSettings.urlChatbot && localSettings.urlChatbot !== localSettings.aiChatbot;

  return (
    <div className="home-container">
      <ChatbotPickerModal
        isDark={isDark}
        isOpen={isPickerOpen}
        onClose={() => setIsPickerOpen(false)}
        mainChatbot={settings.aiChatbot}
        urlChatbot={settings.urlChatbot}
        lumoGuestMode={settings.lumoGuestMode !== false}
        onSave={(main, url, lumoGuest) => {
          updateSettings({ ...localSettings, aiChatbot: main, urlChatbot: url, lumoGuestMode: lumoGuest });
          setIsPickerOpen(false);
        }}
      />

      <div className="section">
        <label className={`label ${isDark ? 'dark' : ''}`}>AI chatbot</label>
        <button
          className={`select-area-button ${isDark ? 'dark' : ''}`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0', marginBottom: showUrlChatbotSeparate ? '6px' : '20px' }}
          onClick={() => setIsPickerOpen(true)}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            {localSettings.aiChatbot && CHATBOT_ICONS[localSettings.aiChatbot] && (
              <img src={CHATBOT_ICONS[localSettings.aiChatbot]} alt="" className="chatbot-icon" />
            )}
            <span style={{ fontWeight: 500 }}>
              {CHATBOT_OPTIONS.find(p => p.value === localSettings.aiChatbot)?.label || localSettings.aiChatbot}
            </span>
          </div>
          <div style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
            <ChevronDownIcon />
          </div>
        </button>
        {showUrlChatbotSeparate && (
          <div
            className={`picker-url-label ${isDark ? 'dark' : ''}`}
            style={{ marginBottom: '20px', cursor: 'pointer' }}
            onClick={() => setIsPickerOpen(true)}
          >
            <LinkIcon size={12} />
            <span>URL summary: <strong>{urlChatbotLabel}</strong></span>
          </div>
        )}
      </div>

      <OpenModePickerModal
        isDark={isDark}
        isOpen={isOpenModePickerOpen}
        onClose={() => setIsOpenModePickerOpen(false)}
        selectedMode={settings.openIn}
        tempSelectedMode={tempSelectedOpenMode}
        setTempSelectedMode={setTempSelectedOpenMode}
        usePrivateWindow={settings.usePrivateWindow}
        tempUsePrivateWindow={tempUsePrivateWindow}
        setTempUsePrivateWindow={setTempUsePrivateWindow}
        onSave={() => {
          updateSettings({ ...localSettings, openIn: tempSelectedOpenMode, usePrivateWindow: tempUsePrivateWindow });
          setIsOpenModePickerOpen(false);
        }}
      />

      <div className="section">
        <label className={`label ${isDark ? 'dark' : ''}`}>Open mode</label>
        <button
          className={`select-area-button ${isDark ? 'dark' : ''}`}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0', marginBottom: '16px' }}
          onClick={() => {
            setTempSelectedOpenMode(localSettings.openIn);
            setTempUsePrivateWindow(localSettings.usePrivateWindow);
            setIsOpenModePickerOpen(true);
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div className="chatbot-icon" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>
              {localSettings.openIn === 'tab' && <TabIcon />}
              {localSettings.openIn === 'popup' && <WindowIcon />}
            </div>
            <span style={{ fontWeight: 500, marginLeft: '8px' }}>
              {localSettings.openIn === 'tab' && 'New tab'}
              {localSettings.openIn === 'popup' && (localSettings.usePrivateWindow ? 'New window (Private)' : 'New window')}
            </span>
          </div>
          <div style={{ color: isDark ? '#9ca3af' : '#6b7280' }}>
            <ChevronDownIcon />
          </div>
        </button>
      </div>

      <Prompts
        settings={localSettings}
        updateSettings={updateSettings}
        isDark={isDark}
      />


    </div>
  );
};

export default Home;
