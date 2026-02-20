import React, { useState } from 'react';
import config from '../../config.json';
import type { OpenTargetType } from '../index';
import { CloseIcon, TabIcon, WindowIcon } from './ui/Icons';

interface OpenModePickerModalProps {
    isDark: boolean;
    isOpen: boolean;
    onClose: () => void;
    selectedMode: OpenTargetType;
    tempSelectedMode: OpenTargetType;
    setTempSelectedMode: (mode: OpenTargetType) => void;
    usePrivateWindow: boolean;
    tempUsePrivateWindow: boolean;
    setTempUsePrivateWindow: (value: boolean) => void;
    onSave: () => void;
}

const isFirefox = typeof navigator !== 'undefined' && navigator.userAgent.includes('Firefox');

interface OpenModeConfig {
    id: OpenTargetType;
    label: string;
    description: string;
    firefoxDescription?: string;
    icon: React.FC;
    unsupported?: boolean;
    disabledReason?: string;
    preview?: boolean;
    firefoxBadge?: string;
    infoOnly?: boolean;
}

const OpenModePickerModal: React.FC<OpenModePickerModalProps> = ({
    isDark,
    isOpen,
    onClose,
    selectedMode,
    tempSelectedMode,
    setTempSelectedMode,
    usePrivateWindow: _usePrivateWindow,
    tempUsePrivateWindow,
    setTempUsePrivateWindow,
    onSave,
}) => {
    const [infoExpanded, setInfoExpanded] = useState<string | null>(null);

    if (!isOpen) return null;

    const OPEN_MODES: OpenModeConfig[] = [
        {
            id: 'tab',
            label: config.openModes.tab.label,
            description: config.openModes.tab.description,
            icon: TabIcon
        },
        {
            id: 'popup',
            label: config.openModes.popup.label,
            description: config.openModes.popup.description,
            icon: WindowIcon
        }
    ];

    return (
        <div className="modal-overlay" style={{ alignItems: 'flex-start', paddingTop: '30px' }}>
            <div className={`modal-content ${isDark ? 'dark' : ''}`} style={{ width: '90%', maxWidth: '340px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                    <h3 className={`modal-title ${isDark ? 'dark' : ''}`} style={{ marginBottom: 0 }}>Open mode</h3>
                    <button
                        className={`icon-btn-small ${isDark ? 'dark' : ''}`}
                        onClick={onClose}
                    >
                        <CloseIcon />
                    </button>
                </div>

                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingRight: '4px' }}>
                    {OPEN_MODES.map((mode) => {
                        const isSelected = tempSelectedMode === mode.id;
                        const isCurrent = selectedMode === mode.id;
                        const isInfoExpanded = mode.infoOnly && infoExpanded === mode.id;
                        const isExpanded = isSelected || isInfoExpanded;

                        const isDisabled = mode.unsupported;

                        const displayedDisabledReason = mode.disabledReason;

                        const handleClick = () => {
                            if (isDisabled) return;
                            if (mode.infoOnly) {
                                setInfoExpanded(prev => prev === mode.id ? null : mode.id);
                            } else {
                                setTempSelectedMode(mode.id);
                            }
                        };

                        return (
                            <div
                                key={mode.id}
                                className={`model-card ${isExpanded && !mode.infoOnly ? 'expanded' : ''} ${isDark ? 'dark' : ''} ${mode.unsupported ? 'disabled' : ''}`}
                                onClick={handleClick}
                                title={isDisabled && displayedDisabledReason ? displayedDisabledReason : undefined}
                                style={{
                                    cursor: isDisabled ? 'not-allowed' : 'pointer',
                                    opacity: mode.unsupported ? 0.6 : 1,
                                    padding: '12px'
                                }}
                            >
                                <div className="model-card-header" style={{ marginBottom: isExpanded ? '8px' : '0' }}>
                                    <div style={{
                                        width: '24px',
                                        height: '24px',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: isDark ? '#e5e7eb' : '#374151'
                                    }}>
                                        <mode.icon />
                                    </div>
                                    <span className={`model-name ${isDark ? 'dark' : ''}`} style={{ flex: 1, marginLeft: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                                        {mode.label}
                                        {mode.preview && !mode.unsupported && (
                                            <span className="preview-badge" style={{ fontSize: '10px', padding: '2px 6px' }}>Preview</span>
                                        )}
                                        {mode.firefoxBadge && (
                                            <span className="preview-badge" style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', borderColor: 'rgba(59, 130, 246, 0.2)' }}>{mode.firefoxBadge}</span>
                                        )}
                                        {mode.unsupported && (
                                            <span className="preview-badge" style={{ fontSize: '10px', padding: '2px 6px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderColor: 'rgba(239, 68, 68, 0.2)' }}>Unsupported</span>
                                        )}
                                    </span>
                                    {isCurrent && <span className="current-badge">Current</span>}
                                </div>

                                {isExpanded && !isDisabled && (
                                    <div className={`model-capabilities ${isDark ? 'dark' : ''}`} style={{ marginTop: '8px' }}>
                                        <div className="capability-item" style={{ alignItems: 'flex-start' }}>
                                            <span style={{ fontSize: '13px', lineHeight: '1.5', color: isDark ? '#d1d5db' : '#1f2937' }}>{isFirefox && mode.firefoxDescription ? mode.firefoxDescription : mode.description}</span>
                                        </div>
                                        {mode.id === 'popup' && (
                                            <div className="flex-center mt-12" style={{ marginTop: '12px' }} onClick={(e) => e.stopPropagation()}>
                                                <label className="switch-label">
                                                    <input
                                                        className="switch-input"
                                                        type="checkbox"
                                                        checked={tempUsePrivateWindow}
                                                        onChange={(e) => setTempUsePrivateWindow(e.target.checked)}
                                                    />
                                                    <span className={`switch-slider ${isDark ? 'dark' : ''}`} />
                                                </label>
                                                <div className={`text-small ${isDark ? 'text-gray-dark' : 'text-gray-light'}`} style={{ marginLeft: '8px' }}>Open in private/incognito window</div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                <div className="modal-actions" style={{ marginTop: '16px', borderTop: isDark ? '1px solid #374151' : '1px solid #e5e7eb', paddingTop: '16px' }}>
                    <button
                        className={`action-button primary ${isDark ? 'dark' : ''}`}
                        onClick={onSave}
                        style={{ flex: 1 }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OpenModePickerModal;
