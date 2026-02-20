import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeftIcon, UserIcon, SettingsIcon, HeartIcon, MenuIcon, ChangelogIcon, InfoIcon, SunIcon, MoonIcon, MonitorIcon } from './ui/Icons';

type Page = 'home' | 'settings' | 'account' | 'changelog' | 'about';
type Theme = 'light' | 'dark' | 'system';

interface HeaderProps {
  isDark: boolean;
  theme: Theme;
  onThemeChange: (theme: Theme) => void;
  onNavigate: (page: Page) => void;
  currentPage: Page;
}

const defaultLogo = chrome.runtime.getURL('public/icons/ebutia.png');
const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.includes('Firefox');

const Header: React.FC<HeaderProps> = ({ isDark, theme, onThemeChange, onNavigate, currentPage }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleMenuItemClick = (page: Page) => {
    onNavigate(page);
    setIsMenuOpen(false);
  };

  return (
    <header className={`header-container ${isDark ? 'dark' : ''}`}>
      <div className="title-section" onClick={() => onNavigate('home')} style={{ cursor: 'pointer' }}>
        {currentPage !== 'home' && (
          <button className={`back-button ${isDark ? 'dark' : ''}`} onClick={(e) => { e.stopPropagation(); onNavigate('home'); }}>
            <ArrowLeftIcon size={18} />
          </button>
        )}
        <div className="logo">
          <img src={defaultLogo} alt="Ebutia Logo" />
        </div>
        <h1 className={`title ${isDark ? 'dark' : ''}`}>Ebutia</h1>
      </div>

      <div className="header-actions">
        <button
          className={`icon-button ${isDark ? 'dark' : ''}`}
          onClick={() => window.open(isFirefox ? 'https://addons.mozilla.org/en-US/firefox/addon/Ebutia/reviews/' : 'https://chromewebstore.google.com/detail/hkddfhfjnkcjmonhgalhnklgldhlhabm/reviews', '_blank')}
          title="Leave a review"
        >
          <HeartIcon size={18} />
        </button>

        <button
          className={`icon-button ${currentPage === 'account' ? 'active' : ''} ${isDark ? 'dark' : ''}`}
          onClick={() => onNavigate('account')}
          title="Account"
        >
          <UserIcon size={18} />
        </button>

        <div className="header-menu-container" ref={menuRef}>
          <button
            className={`icon-button ${isMenuOpen ? 'active' : ''} ${isDark ? 'dark' : ''}`}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            title="Menu"
          >
            <MenuIcon size={18} />
          </button>

          {isMenuOpen && (
            <div className={`header-dropdown ${isDark ? 'dark' : ''}`}>
              <button
                className={`dropdown-item ${currentPage === 'settings' ? 'active' : ''} ${isDark ? 'dark' : ''}`}
                onClick={() => handleMenuItemClick('settings')}
              >
                <SettingsIcon size={16} />
                Settings
              </button>

              <button
                className={`dropdown-item ${currentPage === 'changelog' ? 'active' : ''} ${isDark ? 'dark' : ''}`}
                onClick={() => handleMenuItemClick('changelog')}
              >
                <ChangelogIcon size={16} />
                Changelog
              </button>

              <button
                className={`dropdown-item ${currentPage === 'about' ? 'active' : ''} ${isDark ? 'dark' : ''}`}
                onClick={() => handleMenuItemClick('about')}
              >
                <InfoIcon size={16} />
                About
              </button>

              <div className={`dropdown-divider ${isDark ? 'dark' : ''}`} />

              <div className="theme-submenu">
                <div className={`theme-submenu-label ${isDark ? 'dark' : ''}`}></div>
                <div className={`theme-options ${isDark ? 'dark' : ''}`}>
                  <button
                    className={`theme-option-btn ${theme === 'light' ? 'active' : ''} ${isDark ? 'dark' : ''}`}
                    onClick={() => onThemeChange('light')}
                    title="Light"
                  >
                    <SunIcon size={14} />
                  </button>
                  <button
                    className={`theme-option-btn ${theme === 'dark' ? 'active' : ''} ${isDark ? 'dark' : ''}`}
                    onClick={() => onThemeChange('dark')}
                    title="Dark"
                  >
                    <MoonIcon size={14} />
                  </button>
                  <button
                    className={`theme-option-btn ${theme === 'system' ? 'active' : ''} ${isDark ? 'dark' : ''}`}
                    onClick={() => onThemeChange('system')}
                    title="System"
                  >
                    <MonitorIcon size={14} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;