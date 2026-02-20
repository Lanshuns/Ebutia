import React from 'react';
import { EbutiaSettings } from '..';

interface SettingsProps {
  settings: EbutiaSettings;
  onSettingsChange: (settings: EbutiaSettings) => void;
  isDark: boolean;
}

const Settings: React.FC<SettingsProps> = ({ settings, onSettingsChange, isDark }) => {

  const handleButtonPositionChange = (position: 'metadata' | 'floating') => {
    onSettingsChange({
      ...settings,
      showPlayerButtons: true,
      buttonPosition: position
    });
  };

  return (
    <div className="settings-container">
      <div className="section">
        <label className={`label ${isDark ? 'dark' : ''}`}>Buttons layout</label>
        <div className="flex-center mt-12">
          <label className="switch-label">
            <input
              className="switch-input"
              type="checkbox"
              checked={settings.showPlayerButtons !== false}
              onChange={(e) => {
                if (e.target.checked) {
                  onSettingsChange({ ...settings, showPlayerButtons: true });
                } else {
                  onSettingsChange({ ...settings, showPlayerButtons: false });
                }
              }}
            />
            <span className={`switch-slider ${isDark ? 'dark' : ''}`} />
          </label>
          <div className={`text-small ${isDark ? 'text-gray-dark' : 'text-gray-light'}`}>Show Ebutia icon</div>
        </div>

        {settings.showPlayerButtons !== false && (
          <>
            <div className="mt-12">
              <div className="radio-group" style={{ flexWrap: 'nowrap' }}>
                <label className={`radio-option ${settings.buttonPosition === 'floating' ? 'checked' : ''} ${isDark ? 'dark' : ''}`} style={{ minWidth: 'unset', flex: 1, fontSize: '12px' }}>
                  <input
                    className="radio-input"
                    type="radio"
                    name="buttonPosition"
                    value="floating"
                    checked={settings.buttonPosition === 'floating'}
                    onChange={() => handleButtonPositionChange('floating')}
                  />
                  Floating
                </label>
                <label className={`radio-option ${settings.buttonPosition === 'metadata' ? 'checked' : ''} ${isDark ? 'dark' : ''}`} style={{ minWidth: 'unset', flex: 1, fontSize: '12px' }}>
                  <input
                    className="radio-input"
                    type="radio"
                    name="buttonPosition"
                    value="metadata"
                    checked={settings.buttonPosition === 'metadata'}
                    onChange={() => handleButtonPositionChange('metadata')}
                  />
                  Under video
                </label>
              </div>
            </div>
          </>
        )}

        <div className="flex-center mt-12">
          <label className="switch-label">
            <input
              className="switch-input"
              type="checkbox"
              checked={settings.showHoverIconOnHome}
              onChange={(e) => onSettingsChange({ ...settings, showHoverIconOnHome: e.target.checked })}
            />
            <span className={`switch-slider ${isDark ? 'dark' : ''}`} />
          </label>
          <div className={`text-small ${isDark ? 'text-gray-dark' : 'text-gray-light'}`}>Show Ebutia icon on video hover</div>
        </div>

        <div className="flex-center mt-12">
          <label className="switch-label">
            <input
              className="switch-input"
              type="checkbox"
              checked={settings.showContextMenu}
              onChange={(e) => onSettingsChange({ ...settings, showContextMenu: e.target.checked })}
            />
            <span className={`switch-slider ${isDark ? 'dark' : ''}`} />
          </label>
          <div className={`text-small ${isDark ? 'text-gray-dark' : 'text-gray-light'}`}>Show Ebutia icon in context menu</div>
        </div>
      </div>

      <div className="section">
        <label className={`label ${isDark ? 'dark' : ''}`}>Summary source</label>

        <div className="radio-group">
          <label className={`radio-option ${settings.summarySource === 'transcript' ? 'checked' : ''} ${isDark ? 'dark' : ''}`}>
            <input
              className="radio-input"
              type="radio"
              name="summarySource"
              value="transcript"
              checked={settings.summarySource === 'transcript'}
              onChange={() => onSettingsChange({ ...settings, summarySource: 'transcript' })}
            />
            YouTube Transcript
          </label>

          <label className={`radio-option ${settings.summarySource === 'url' ? 'checked' : ''} ${isDark ? 'dark' : ''}`}>
            <input
              className="radio-input"
              type="radio"
              name="summarySource"
              value="url"
              checked={settings.summarySource === 'url'}
              onChange={() => onSettingsChange({ ...settings, summarySource: 'url' })}
            />
            YouTube URL
          </label>
        </div>

        <div className="flex-center mt-12">
          <label className="switch-label">
            <input
              className="switch-input"
              type="checkbox"
              checked={settings.useUrlWhenNoTranscript}
              onChange={(e) => onSettingsChange({ ...settings, useUrlWhenNoTranscript: e.target.checked })}
            />
            <span className={`switch-slider ${isDark ? 'dark' : ''}`} />
          </label>
          <div className={`text-small ${isDark ? 'text-gray-dark' : 'text-gray-light'}`}>Always use Video URL when no transcript found</div>
        </div>
      </div>


    </div>
  );
};

export default Settings;
