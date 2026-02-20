import React, { useState, useMemo } from 'react';
import type { AIChatbot } from '..';
import chatbotsConfig from '../../config.json';
import { CHATBOT_ICONS } from '../lib/chatbotOptions';
import { CloseIcon, CheckIcon, LinkIcon, TabIcon, WindowIcon } from './ui/Icons';

type FilterMode = 'all' | 'tab' | 'popup' | 'url';

type SelectionTarget = 'main' | 'url';

interface ChatbotPickerModalProps {
    isDark: boolean;
    isOpen: boolean;
    onClose: () => void;
    mainChatbot: AIChatbot;
    urlChatbot: AIChatbot | undefined;
    lumoGuestMode: boolean;
    onSave: (main: AIChatbot, url: AIChatbot | undefined, lumoGuestMode: boolean) => void;
}

const MODE_LABEL_MAP: Record<string, string> = {
    'New tab': 'tab',
    'New window': 'popup',
};



const ALL_FILTERS: { id: FilterMode; label: string; icon: React.FC }[] = [
    { id: 'all', label: 'All', icon: () => null },
    { id: 'tab', label: 'Tab', icon: TabIcon },
    { id: 'popup', label: 'Window', icon: WindowIcon },
    { id: 'url', label: 'URL', icon: LinkIcon },
];

const URL_FILTERS: { id: FilterMode; label: string; icon: React.FC }[] = [
    { id: 'all', label: 'All', icon: () => null },
    { id: 'url', label: 'URL', icon: LinkIcon },
];

function getModeIds(bestMode: string[]): string[] {
    return bestMode.map(m => MODE_LABEL_MAP[m]).filter(Boolean);
}

const ChatbotPickerModal: React.FC<ChatbotPickerModalProps> = ({
    isDark,
    isOpen,
    onClose,
    mainChatbot,
    urlChatbot,
    lumoGuestMode,
    onSave,
}) => {
    const [tempMain, setTempMain] = useState<AIChatbot>(mainChatbot);
    const [tempUrl, setTempUrl] = useState<AIChatbot | undefined>(urlChatbot);
    const [filter, setFilter] = useState<FilterMode>('all');
    const [selectionTarget, setSelectionTarget] = useState<SelectionTarget>('main');
    const [tempLumoGuest, setTempLumoGuest] = useState<boolean>(lumoGuestMode);

    React.useEffect(() => {
        if (isOpen) {
            setTempMain(mainChatbot);
            setTempUrl(urlChatbot);
            setFilter('all');
            setSelectionTarget('main');
            setTempLumoGuest(lumoGuestMode);
        }
    }, [isOpen, mainChatbot, urlChatbot, lumoGuestMode]);

    const chatbots = useMemo(() => {
        return Object.entries(chatbotsConfig.chatbots).map(([key, config]) => ({
            key,
            name: (config as any).name || key,
            capabilities: (config as any).capabilities || {},
            bestMode: (config as any).capabilities?.bestMode || [],
            urlSummary: (config as any).capabilities?.urlSummary || false,
            modeIds: getModeIds((config as any).capabilities?.bestMode || []),
        }));
    }, []);

    const filtered = useMemo(() => {
        if (filter === 'all') return chatbots;
        if (filter === 'url') return chatbots.filter(b => b.urlSummary);
        return chatbots.filter(b => b.modeIds.includes(filter));
    }, [chatbots, filter]);

    if (!isOpen) return null;

    const handleBotClick = (key: string) => {
        if (selectionTarget === 'main') {
            setTempMain(key as AIChatbot);
        } else {
            setTempUrl(key as AIChatbot);
        }
    };

    const handleTabSwitch = (target: SelectionTarget) => {
        setSelectionTarget(target);
        if (target === 'url') {
            setFilter('url');
        } else {
            setFilter('all');
        }
    };

    const selectedKey = selectionTarget === 'main' ? tempMain : tempUrl;
    const activeFilters = selectionTarget === 'url' ? URL_FILTERS : ALL_FILTERS;

    return (
        <div className="modal-overlay" style={{ alignItems: 'flex-start', paddingTop: '30px' }}>
            <div className={`modal-content picker-modal ${isDark ? 'dark' : ''}`}>
                <div className="picker-tabs-row">
                    <div className={`picker-tabs ${isDark ? 'dark' : ''}`}>
                        <button
                            className={`picker-tab ${selectionTarget === 'main' ? 'active' : ''} ${isDark ? 'dark' : ''}`}
                            onClick={() => handleTabSwitch('main')}
                        >
                            Transcript
                        </button>
                        <button
                            className={`picker-tab ${selectionTarget === 'url' ? 'active' : ''} ${isDark ? 'dark' : ''}`}
                            onClick={() => handleTabSwitch('url')}
                        >
                            URL
                        </button>
                    </div>
                    <button
                        className={`icon-btn-small ${isDark ? 'dark' : ''}`}
                        onClick={onClose}
                    >
                        <CloseIcon />
                    </button>
                </div>

                {selectionTarget === 'url' && (
                    <div className={`picker-hint ${isDark ? 'dark' : ''}`}>
                        Choose a chatbot for URL-based summaries only. Which is used to summarize the videos from the home page and when no transcript is available.
                    </div>
                )}

                {selectionTarget === 'main' && (
                    <div className={`picker-hint ${isDark ? 'dark' : ''}`}>
                        Use the filters to find the best chatbot for your preferred open mode.
                    </div>
                )}

                <div className="picker-filters">
                    {activeFilters.map(opt => (
                        <button
                            key={opt.id}
                            className={`picker-filter ${filter === opt.id ? 'active' : ''} ${isDark ? 'dark' : ''}`}
                            onClick={() => setFilter(filter === opt.id ? 'all' : opt.id)}
                        >
                            {opt.id !== 'all' && <opt.icon />}
                            {opt.label}
                        </button>
                    ))}
                </div>

                <div className="modal-body" style={{ gap: '6px' }}>
                    <div className="picker-grid">
                        {filtered.map(bot => {
                            const isSelected = selectedKey === bot.key;

                            return (
                                <div
                                    key={bot.key}
                                    className={`picker-grid-item ${isSelected ? 'selected' : ''} ${isDark ? 'dark' : ''}`}
                                    onClick={() => handleBotClick(bot.key)}
                                >
                                    {CHATBOT_ICONS[bot.key] ? (
                                        <img
                                            src={CHATBOT_ICONS[bot.key]}
                                            alt=""
                                            className="picker-grid-icon"
                                        />
                                    ) : (
                                        <div className={`picker-grid-icon-placeholder ${isDark ? 'dark' : ''}`} />
                                    )}
                                    <span className={`picker-grid-name ${isDark ? 'dark' : ''}`}>{bot.name}</span>
                                    {isSelected && <div className="picker-check"><CheckIcon /></div>}
                                </div>
                            );
                        })}
                    </div>

                    {filtered.length === 0 && (
                        <div className={`picker-empty ${isDark ? 'dark' : ''}`}>
                            No chatbots match this filter.
                        </div>
                    )}

                    {((selectionTarget === 'main' && tempMain === 'lumo') || (selectionTarget === 'url' && tempUrl === 'lumo')) && (
                        <div className="flex-center" style={{ marginTop: '8px' }} onClick={(e) => e.stopPropagation()}>
                            <label className="switch-label">
                                <input
                                    className="switch-input"
                                    type="checkbox"
                                    checked={tempLumoGuest}
                                    onChange={(e) => setTempLumoGuest(e.target.checked)}
                                />
                                <span className={`switch-slider ${isDark ? 'dark' : ''}`} />
                            </label>
                            <div className={`text-small ${isDark ? 'text-gray-dark' : 'text-gray-light'}`}>Use guest mode</div>
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button
                        className={`action-button primary ${isDark ? 'dark' : ''}`}
                        onClick={() => onSave(tempMain, tempUrl, tempLumoGuest)}
                        style={{ flex: 1 }}
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatbotPickerModal;
