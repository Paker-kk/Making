import React from 'react';
import { QuickPrompts } from './QuickPrompts';
import type { UserEffect, GenerationMode } from '../types';

interface PromptBarProps {
    t: (key: string, ...args: any[]) => string;
    prompt: string;
    setPrompt: (prompt: string) => void;
    onGenerate: () => void;
    isLoading: boolean;
    isSelectionActive: boolean;
    selectedElementCount: number;
    userEffects: UserEffect[];
    onAddUserEffect: (effect: UserEffect) => void;
    onDeleteUserEffect: (id: string) => void;
    generationMode: GenerationMode;
    setGenerationMode: (mode: GenerationMode) => void;
    videoAspectRatio: '16:9' | '9:16';
    setVideoAspectRatio: (ratio: '16:9' | '9:16') => void;
}

export const PromptBar: React.FC<PromptBarProps> = ({
    t,
    prompt,
    setPrompt,
    onGenerate,
    isLoading,
    isSelectionActive,
    selectedElementCount,
    userEffects,
    onAddUserEffect,
    onDeleteUserEffect,
    generationMode,
    setGenerationMode,
    videoAspectRatio,
    setVideoAspectRatio,
}) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto'; // Reset height
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
        }
    }, [prompt]);
    
    const getPlaceholderText = () => {
        if (!isSelectionActive) {
            return generationMode === 'video' ? t('promptBar.placeholderDefaultVideo') : t('promptBar.placeholderDefault');
        }
        if (selectedElementCount === 1) {
            return t('promptBar.placeholderSingle');
        }
        return t('promptBar.placeholderMultiple', selectedElementCount);
    };
    
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!isLoading && prompt.trim()) {
                onGenerate();
            }
        }
    };
    
    const handleSaveEffect = () => {
        const name = window.prompt(t('myEffects.saveEffectPrompt'), t('myEffects.defaultName'));
        if (name && prompt.trim()) {
            onAddUserEffect({ id: `user_${Date.now()}`, name, value: prompt });
        }
    };

    const containerStyle: React.CSSProperties = {
        backgroundColor: `var(--ui-bg-color)`,
    };

    return (
        <div className="w-full max-w-3xl mx-auto px-4">
            <div 
                style={containerStyle}
                className="flex items-center gap-2 p-2 border border-neutral-200 rounded-full shadow-xl bg-white"
            >
                <div className="flex-shrink-0 flex items-center bg-neutral-100 rounded-full p-0.5">
                    <button onClick={() => setGenerationMode('image')} className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${generationMode === 'image' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}>{t('promptBar.imageMode')}</button>
                    <button onClick={() => setGenerationMode('video')} className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${generationMode === 'video' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-600 hover:text-neutral-900'}`}>{t('promptBar.videoMode')}</button>
                </div>
                
                {generationMode === 'video' && (
                    <div className="flex-shrink-0 flex items-center bg-neutral-100 rounded-full p-0.5">
                        <button onClick={() => setVideoAspectRatio('16:9')} title={t('promptBar.aspectRatioHorizontal')} className={`p-1 rounded-full transition-colors ${videoAspectRatio === '16:9' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}>
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="10" rx="2" ry="2"></rect></svg>
                        </button>
                        <button onClick={() => setVideoAspectRatio('9:16')} title={t('promptBar.aspectRatioVertical')} className={`p-1 rounded-full transition-colors ${videoAspectRatio === '9:16' ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-900'}`}>
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2" width="10" height="20" rx="2" ry="2"></rect></svg>
                        </button>
                    </div>
                )}
                <QuickPrompts 
                    t={t}
                    setPrompt={setPrompt}
                    disabled={!isSelectionActive || isLoading}
                    userEffects={userEffects}
                    onDeleteUserEffect={onDeleteUserEffect}
                />
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={getPlaceholderText()}
                    className="flex-grow bg-transparent text-neutral-900 placeholder-neutral-400 focus:outline-none px-2 resize-none overflow-hidden max-h-24 text-sm"
                    disabled={isLoading}
                />
                {prompt.trim() && !isLoading && (
                    <button
                        onClick={handleSaveEffect}
                        title={t('myEffects.saveEffectTooltip')}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-neutral-500 rounded-full hover:bg-neutral-100 transition-colors duration-200 disabled:text-neutral-300 disabled:cursor-not-allowed"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                    </button>
                )}
                <button
                    onClick={onGenerate}
                    disabled={isLoading || !prompt.trim()}
                    aria-label={t('promptBar.generate')}
                    title={t('promptBar.generate')}
                    className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all duration-200"
                    style={{ backgroundColor: 'var(--button-bg-color)' }}
                >
                    {isLoading ? (
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                       generationMode === 'image' 
                        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2" ry="2"/></svg>
                    )}
                </button>
            </div>
        </div>
    );
};
