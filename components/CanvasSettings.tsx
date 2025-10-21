

import React from 'react';
import type { WheelAction } from '../types';

interface CanvasSettingsProps {
    isOpen: boolean;
    onClose: () => void;
    canvasBackgroundColor: string;
    onCanvasBackgroundColorChange: (color: string) => void;
    language: 'en' | 'zho';
    setLanguage: (lang: 'en' | 'zho') => void;
    uiTheme: { color: string; opacity: number };
    setUiTheme: (theme: { color: string; opacity: number }) => void;
    buttonTheme: { color: string; opacity: number };
    setButtonTheme: (theme: { color: string; opacity: number }) => void;
    wheelAction: WheelAction;
    setWheelAction: (action: WheelAction) => void;
    t: (key: string) => string;
}

export const CanvasSettings: React.FC<CanvasSettingsProps> = ({
    isOpen,
    onClose,
    canvasBackgroundColor,
    onCanvasBackgroundColorChange,
    language,
    setLanguage,
    uiTheme,
    setUiTheme,
    buttonTheme,
    setButtonTheme,
    wheelAction,
    setWheelAction,
    t
}) => {
    if (!isOpen) return null;

    return (
        <div 
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/10 backdrop-blur-sm"
            onClick={onClose}
        >
            <div 
                className="relative p-6 border border-neutral-200 rounded-3xl shadow-2xl flex flex-col gap-5 w-96 bg-white"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-neutral-100 flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                            </svg>
                        </div>
                        <h3 className="text-xl font-semibold text-neutral-900">{t('settings.title')}</h3>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="w-8 h-8 rounded-lg hover:bg-neutral-100 flex items-center justify-center text-neutral-400 hover:text-neutral-700 transition-colors"
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                {/* Language Settings */}
                <div className="space-y-2.5">
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t('settings.language')}</label>
                    <div className="inline-flex w-full rounded-xl bg-neutral-100 p-1">
                        <button 
                            onClick={() => setLanguage('en')}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${language === 'en' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
                        >
                            English
                        </button>
                        <button 
                            onClick={() => setLanguage('zho')}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${language === 'zho' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
                        >
                            中文
                        </button>
                    </div>
                </div>

                {/* Canvas Background */}
                <div className="space-y-2.5">
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t('settings.canvas')}</label>
                    <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                        <span className="text-sm text-neutral-700">{t('settings.backgroundColor')}</span>
                        <input
                            type="color"
                            value={canvasBackgroundColor}
                            onChange={(e) => onCanvasBackgroundColorChange(e.target.value)}
                            className="w-10 h-10 p-0 border-2 border-white rounded-lg cursor-pointer shadow-sm"
                        />
                    </div>
                </div>

                {/* UI Theme */}
                <div className="space-y-3">
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t('settings.uiTheme')}</label>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                            <span className="text-sm text-neutral-700">{t('settings.color')}</span>
                            <input
                                type="color"
                                value={uiTheme.color}
                                onChange={(e) => setUiTheme({ ...uiTheme, color: e.target.value })}
                                className="w-10 h-10 p-0 border-2 border-white rounded-lg cursor-pointer shadow-sm"
                            />
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                            <span className="text-sm text-neutral-700 flex-shrink-0">{t('settings.opacity')}</span>
                            <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.05"
                                value={uiTheme.opacity}
                                onChange={(e) => setUiTheme({ ...uiTheme, opacity: parseFloat(e.target.value) })}
                                className="flex-1 h-1.5 bg-neutral-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neutral-900"
                            />
                            <span className="text-xs font-medium text-neutral-500 w-10 text-right">{Math.round(uiTheme.opacity * 100)}%</span>
                        </div>
                    </div>
                </div>

                {/* Button Theme */}
                <div className="space-y-3">
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t('settings.actionButtonsTheme')}</label>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-xl">
                            <span className="text-sm text-neutral-700">{t('settings.color')}</span>
                            <input
                                type="color"
                                value={buttonTheme.color}
                                onChange={(e) => setButtonTheme({ ...buttonTheme, color: e.target.value })}
                                className="w-10 h-10 p-0 border-2 border-white rounded-lg cursor-pointer shadow-sm"
                            />
                        </div>
                        <div className="flex items-center gap-3 p-3 bg-neutral-50 rounded-xl">
                            <span className="text-sm text-neutral-700 flex-shrink-0">{t('settings.opacity')}</span>
                            <input
                                type="range"
                                min="0.1"
                                max="1"
                                step="0.05"
                                value={buttonTheme.opacity}
                                onChange={(e) => setButtonTheme({ ...buttonTheme, opacity: parseFloat(e.target.value) })}
                                className="flex-1 h-1.5 bg-neutral-200 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-neutral-900"
                            />
                            <span className="text-xs font-medium text-neutral-500 w-10 text-right">{Math.round(buttonTheme.opacity * 100)}%</span>
                        </div>
                    </div>
                </div>
                
                {/* Mouse Wheel */}
                <div className="space-y-2.5">
                    <label className="text-xs font-semibold text-neutral-500 uppercase tracking-wide">{t('settings.mouseWheel')}</label>
                    <div className="inline-flex w-full rounded-xl bg-neutral-100 p-1">
                        <button 
                            onClick={() => setWheelAction('zoom')}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${wheelAction === 'zoom' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
                        >
                            {t('settings.zoom')}
                        </button>
                        <button 
                            onClick={() => setWheelAction('pan')}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${wheelAction === 'pan' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}
                        >
                            {t('settings.scroll')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
