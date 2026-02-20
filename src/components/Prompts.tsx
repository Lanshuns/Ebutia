import React from 'react';
import type { EbutiaSettings } from '..';
import { ChevronDownIcon } from './ui/Icons';

const LANGUAGES = [
    'Same as transcript',
    'Arabic',
    'Bengali',
    'Burmese',
    'Chinese (Simplified)',
    'Chinese (Traditional)',
    'Czech',
    'Danish',
    'Dutch',
    'English',
    'Finnish',
    'French',
    'German',
    'Gujarati',
    'Hausa',
    'Hebrew',
    'Hindi',
    'Hungarian',
    'Igbo',
    'Indonesian',
    'Italian',
    'Japanese',
    'Javanese',
    'Kannada',
    'Korean',
    'Latin',
    'Malay',
    'Malayalam',
    'Marathi',
    'Norwegian',
    'Odia',
    'Polish',
    'Portuguese (Brazil)',
    'Portuguese (Portugal)',
    'Punjabi',
    'Romanian',
    'Russian',
    'Sinhala',
    'Slovak',
    'Spanish',
    'Swedish',
    'Tagalog',
    'Tamil',
    'Telugu',
    'Thai',
    'Turkish',
    'Urdu',
    'Vietnamese',
    'Yoruba',
    'Zulu'
];

interface PromptsProps {
    settings: EbutiaSettings;
    updateSettings: (settings: EbutiaSettings) => void;
    isDark: boolean;
}

const Prompts: React.FC<PromptsProps> = ({ settings, updateSettings, isDark }) => {

    const handleModeChange = (mode: 'simple' | 'advanced') => {
        updateSettings({ ...settings, promptMode: mode });
    };

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        updateSettings({ ...settings, language: e.target.value });
    };

    return (
        <div className="section">
            <div className="header-row">
                <label className={`label ${isDark ? 'dark' : ''} mb-0`}>Prompt</label>
            </div>

            <div className="button-group">
                <button
                    className={`mode-button ${settings.promptMode === 'simple' ? 'active' : ''} ${isDark ? 'dark' : ''}`}
                    onClick={() => handleModeChange('simple')}
                    title="Simple prompt: Summarize this video: {SOURCE}"
                >
                    Simple (Default)
                </button>
                <button
                    className={`mode-button ${settings.promptMode === 'advanced' ? 'active' : ''} ${isDark ? 'dark' : ''}`}
                    onClick={() => handleModeChange('advanced')}
                    title="Automatically analyzes the video type and generates the perfect summary structure."
                >
                    Advanced
                </button>
            </div>

            <label className={`label ${isDark ? 'dark' : ''}`}>Summary language</label>
            <div className="custom-select-wrapper">
                <select
                    className={`text-input ${isDark ? 'dark' : ''}`}
                    value={settings.language || ''}
                    onChange={handleLanguageChange}
                >
                    <option value="" disabled>Choose a language</option>
                    {LANGUAGES.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                    ))}
                </select>
                <div className={`select-icon ${isDark ? 'dark' : ''}`}>
                    <ChevronDownIcon />
                </div>
            </div>
        </div>
    );
};

export default Prompts;
