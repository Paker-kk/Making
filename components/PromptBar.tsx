/**
 * ============================================
 * AI提示词输入栏组件 (Prompt Bar)
 * ============================================
 * 
 * 【组件职责】
 * 提供AI生成和编辑的提示词输入界面，是与AI交互的核心入口
 * 
 * 【核心功能】
 * 1. 提示词输入：多行文本输入框，支持自动高度调整
 * 2. 模式切换：图片生成模式 / 视频生成模式
 * 3. 宽高比选择：视频模式下选择 16:9 或 9:16
 * 4. 快捷提示词：常用效果的快速应用（通过 QuickPrompts 组件）
 * 5. 保存效果：将当前提示词保存为自定义效果
 * 6. 生成触发：点击按钮或按 Enter 键触发生成
 * 7. 加载状态：显示加载动画
 * 8. 智能提示：根据选中元素数量显示不同的占位符文本
 * 
 * 【设计模式】
 * - 受控组件：提示词状态由父组件管理
 * - 响应式高度：输入框根据内容自动调整高度
 * - 键盘快捷键：Enter 提交，Shift+Enter 换行
 * 
 * 【交互逻辑】
 * - 无选中元素：生成新图片/视频
 * - 选中1个元素：编辑该元素
 * - 选中多个元素：批量编辑
 * - 视频模式：显示宽高比选择器
 * - 有提示词：显示保存按钮
 */

import React from 'react';
import { QuickPrompts } from './QuickPrompts';
import type { UserEffect, GenerationMode } from '../types';

/**
 * 【Props 接口定义】
 */
interface PromptBarProps {
    t: (key: string, ...args: any[]) => string;  // 国际化翻译函数
    prompt: string;                               // 当前提示词内容
    setPrompt: (prompt: string) => void;          // 设置提示词的回调
    onGenerate: () => void;                       // 触发生成的回调
    isLoading: boolean;                           // 是否正在生成中
    isSelectionActive: boolean;                   // 是否有选中的元素
    selectedElementCount: number;                 // 选中元素的数量
    userEffects: UserEffect[];                    // 用户自定义效果列表
    onAddUserEffect: (effect: UserEffect) => void;      // 添加自定义效果的回调
    onDeleteUserEffect: (id: string) => void;            // 删除自定义效果的回调
    generationMode: GenerationMode;                      // 生成模式（图片/视频）
    setGenerationMode: (mode: GenerationMode) => void;   // 设置生成模式的回调
    videoAspectRatio: '16:9' | '9:16';                  // 视频宽高比
    setVideoAspectRatio: (ratio: '16:9' | '9:16') => void;  // 设置宽高比的回调
}

/**
 * 【主组件】AI提示词输入栏
 */
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
    // ============ 引用 ============
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);  // 输入框引用

    // ============ 副作用 ============
    
    /**
     * 【Effect】自动调整输入框高度
     * 
     * 当提示词内容变化时，根据内容自动调整输入框高度
     * 最大高度限制在 max-h-24（约6rem）
     * 
     * 【实现逻辑】
     * 1. 先重置高度为 auto
     * 2. 然后根据 scrollHeight 设置实际高度
     * 3. 实现自动扩展效果
     */
    React.useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';  // 重置高度
            textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;  // 设置为内容高度
        }
    }, [prompt]);
    
    // ============ 工具函数 ============
    
    /**
     * 【方法】获取占位符文本
     * 
     * 根据当前状态显示不同的提示文本
     * 
     * @returns {string} 占位符文本
     * 
     * 【逻辑】
     * - 无选中 + 图片模式：提示生成新图片
     * - 无选中 + 视频模式：提示生成新视频
     * - 选中1个元素：提示编辑该元素
     * - 选中多个元素：提示批量编辑N个元素
     */
    const getPlaceholderText = () => {
        if (!isSelectionActive) {
            return generationMode === 'video' ? t('promptBar.placeholderDefaultVideo') : t('promptBar.placeholderDefault');
        }
        if (selectedElementCount === 1) {
            return t('promptBar.placeholderSingle');
        }
        return t('promptBar.placeholderMultiple', selectedElementCount);
    };
    
    // ============ 事件处理 ============
    
    /**
     * 【方法】键盘事件处理
     * 
     * Enter: 触发生成（不加载中且有内容）
     * Shift+Enter: 换行
     * 
     * @param {React.KeyboardEvent} e - 键盘事件
     */
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();  // 阻止默认的换行行为
            if (!isLoading && prompt.trim()) {
                onGenerate();
            }
        }
    };
    
    /**
     * 【方法】保存自定义效果
     * 
     * 将当前提示词保存为用户自定义效果，方便复用
     * 
     * 【流程】
     * 1. 弹窗让用户输入效果名称
     * 2. 如果用户确认且有提示词内容
     * 3. 创建新的 UserEffect 对象并保存
     * 4. 使用时间戳作为唯一ID
     */
    const handleSaveEffect = () => {
        const name = window.prompt(t('myEffects.saveEffectPrompt'), t('myEffects.defaultName'));
        if (name && prompt.trim()) {
            onAddUserEffect({ 
                id: `user_${Date.now()}`,  // 使用时间戳生成唯一ID
                name, 
                value: prompt 
            });
        }
    };

    // ============ 样式 ============
    
    /**
     * 容器样式：使用CSS变量实现主题色
     */
    const containerStyle: React.CSSProperties = {
        backgroundColor: `var(--ui-bg-color)`,
    };

    // ============ 渲染 ============
    
    /**
     * 【渲染】提示词输入栏
     * 
     * 组件布局（从左到右）：
     * 1. 模式切换器：图片/视频
     * 2. 宽高比选择器：16:9 / 9:16（仅视频模式）
     * 3. 快捷提示词按钮：QuickPrompts 组件
     * 4. 提示词输入框：多行文本框，自动高度
     * 5. 保存按钮：保存为自定义效果（有内容时显示）
     * 6. 生成按钮：触发AI生成
     */
    return (
        <div className="w-full max-w-3xl mx-auto px-4">
            <div 
                style={containerStyle}
                className="flex items-center gap-2 p-2 border border-neutral-200 rounded-full shadow-xl bg-white"
            >
                {/* 1. 模式切换器：图片 vs 视频 */}
                <div className="flex-shrink-0 flex items-center bg-neutral-100 rounded-full p-0.5">
                    <button 
                        onClick={() => setGenerationMode('image')} 
                        className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                            generationMode === 'image' 
                                ? 'bg-white text-neutral-900 shadow-sm'  // 选中状态
                                : 'text-neutral-600 hover:text-neutral-900'  // 未选中状态
                        }`}
                    >
                        {t('promptBar.imageMode')}
                    </button>
                    <button 
                        onClick={() => setGenerationMode('video')} 
                        className={`px-2.5 py-1 text-xs font-medium rounded-full transition-colors ${
                            generationMode === 'video' 
                                ? 'bg-white text-neutral-900 shadow-sm' 
                                : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                    >
                        {t('promptBar.videoMode')}
                    </button>
                </div>
                
                {/* 2. 宽高比选择器（仅视频模式显示） */}
                {generationMode === 'video' && (
                    <div className="flex-shrink-0 flex items-center bg-neutral-100 rounded-full p-0.5">
                        {/* 16:9 横屏 */}
                        <button 
                            onClick={() => setVideoAspectRatio('16:9')} 
                            title={t('promptBar.aspectRatioHorizontal')} 
                            className={`p-1 rounded-full transition-colors ${
                                videoAspectRatio === '16:9' 
                                    ? 'bg-white text-neutral-900 shadow-sm' 
                                    : 'text-neutral-500 hover:text-neutral-900'
                            }`}
                        >
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="10" rx="2" ry="2"></rect></svg>
                        </button>
                        {/* 9:16 竖屏 */}
                        <button 
                            onClick={() => setVideoAspectRatio('9:16')} 
                            title={t('promptBar.aspectRatioVertical')} 
                            className={`p-1 rounded-full transition-colors ${
                                videoAspectRatio === '9:16' 
                                    ? 'bg-white text-neutral-900 shadow-sm' 
                                    : 'text-neutral-500 hover:text-neutral-900'
                            }`}
                        >
                             <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="7" y="2" width="10" height="20" rx="2" ry="2"></rect></svg>
                        </button>
                    </div>
                )}
                
                {/* 3. 快捷提示词组件 */}
                <QuickPrompts 
                    t={t}
                    setPrompt={setPrompt}
                    disabled={!isSelectionActive || isLoading}  // 无选中或加载中时禁用
                    userEffects={userEffects}
                    onDeleteUserEffect={onDeleteUserEffect}
                />
                
                {/* 4. 提示词输入框 */}
                <textarea
                    ref={textareaRef}
                    rows={1}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={getPlaceholderText()}  // 智能占位符
                    className="flex-grow bg-transparent text-neutral-900 placeholder-neutral-400 focus:outline-none px-2 resize-none overflow-hidden max-h-24 text-sm"
                    disabled={isLoading}
                />
                
                {/* 5. 保存效果按钮（有内容时显示） */}
                {prompt.trim() && !isLoading && (
                    <button
                        onClick={handleSaveEffect}
                        title={t('myEffects.saveEffectTooltip')}
                        className="flex-shrink-0 w-8 h-8 flex items-center justify-center text-neutral-500 rounded-full hover:bg-neutral-100 transition-colors duration-200 disabled:text-neutral-300 disabled:cursor-not-allowed"
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/></svg>
                    </button>
                )}
                
                {/* 6. 生成按钮 */}
                <button
                    onClick={onGenerate}
                    disabled={isLoading || !prompt.trim()}
                    aria-label={t('promptBar.generate')}
                    title={t('promptBar.generate')}
                    className="flex-shrink-0 w-9 h-9 flex items-center justify-center text-white rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:brightness-110 transition-all duration-200"
                    style={{ backgroundColor: 'var(--button-bg-color)' }}
                >
                    {isLoading ? (
                        // 加载中：显示旋转动画
                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    ) : (
                       // 根据模式显示不同图标
                       generationMode === 'image' 
                        ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>  // 箭头图标（图片）
                        : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 8-6 4 6 4V8Z"/><rect x="2" y="6" width="14" height="12" rx="2" ry="2"/></svg>  // 视频图标（视频）
                    )}
                </button>
            </div>
        </div>
    );
};
