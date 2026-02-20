import React from 'react';

interface AboutProps {
    isDark: boolean;
}

const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.includes('Firefox');

const About: React.FC<AboutProps> = ({ isDark }) => {
    const version = chrome.runtime.getManifest().version;

    return (
        <div className="settings-container">
            <div className="section">
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                    <img
                        src={chrome.runtime.getURL('public/icons/ebutia.png')}
                        alt="Ebutia Logo"
                        style={{ width: '64px', height: '64px', marginBottom: '16px' }}
                    />
                    <h2 className={`modal-title ${isDark ? 'dark' : ''}`} style={{ marginBottom: '8px' }}>Ebutia</h2>
                    <p className={`text-small ${isDark ? 'text-gray-dark' : 'text-gray-light'}`}>
                        v{version}
                    </p>
                </div>
            </div>

            <div className="section">
                <label className={`label ${isDark ? 'dark' : ''}`}>Links</label>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                    <a
                        href="https://github.com/Lanshuns/Ebutia"
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`select-area-button ${isDark ? 'dark' : ''}`}
                        style={{ textDecoration: 'none', display: 'block' }}
                    >
                        GitHub Repository
                    </a>
                    <a
                        href={isFirefox ? 'https://addons.mozilla.org/en-US/firefox/addon/Ebutia/' : 'https://chromewebstore.google.com/detail/hkddfhfjnkcjmonhgalhnklgldhlhabm'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`select-area-button ${isDark ? 'dark' : ''}`}
                        style={{ textDecoration: 'none', display: 'block' }}
                    >
                        {isFirefox ? 'Firefox Add-ons' : 'Chrome Web Store'}
                    </a>
                </div>
            </div>
        </div>
    );
};

export default About;
