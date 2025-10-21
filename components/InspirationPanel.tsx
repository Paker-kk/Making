import React, { useRef, useState, useEffect } from 'react';
import type { AssetLibrary, AssetCategory, AssetItem } from '../types';

interface InspirationPanelProps {
    isMinimized: boolean;
    onToggleMinimize: () => void;
    library: AssetLibrary;
    onRemove: (category: AssetCategory, id: string) => void;
    onRename: (category: AssetCategory, id: string, name: string) => void;
    onGenerate: (prompt: string) => void;
}

const CategoryTabs: React.FC<{ value: AssetCategory; onChange: (c: AssetCategory) => void }> = ({ value, onChange }) => (
    <div className="grid grid-cols-3 rounded-xl overflow-hidden border border-neutral-200 bg-white">
        {(['character', 'scene', 'prop'] as AssetCategory[]).map(cat => (
            <button
                key={cat}
                onClick={() => onChange(cat)}
                className={`px-2 py-1 text-xs transition-colors ${value === cat ? 'bg-neutral-900 text-white' : 'bg-white hover:bg-neutral-50 text-neutral-700'} border-r border-neutral-200 last:border-r-0`}
            >
                {cat === 'character' ? '角色' : cat === 'scene' ? '场景' : '道具'}
            </button>
        ))}
    </div>
);

export const InspirationPanel: React.FC<InspirationPanelProps> = ({
    isMinimized,
    onToggleMinimize,
    library,
    onRemove,
    onRename,
    onGenerate
}) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const [category, setCategory] = useState<AssetCategory>('character');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editingName, setEditingName] = useState<string>('');
    const [prompt, setPrompt] = useState<string>('');
    const editInputRef = useRef<HTMLInputElement>(null);
    const promptInputRef = useRef<HTMLInputElement>(null);

    // Resize state
    const [panelWidth, setPanelWidth] = useState(() => {
        const saved = localStorage.getItem('inspirationPanelWidth');
        return saved ? parseInt(saved, 10) : 420;
    });
    const [isResizing, setIsResizing] = useState(false);
    const [resizeStartX, setResizeStartX] = useState(0);
    const [resizeStartWidth, setResizeStartWidth] = useState(420);

    useEffect(() => {
        localStorage.setItem('inspirationPanelWidth', panelWidth.toString());
    }, [panelWidth]);

    useEffect(() => {
        if (!isResizing) return;

        const handlePointerMove = (e: PointerEvent) => {
            const dx = resizeStartX - e.clientX; // dragging from left edge (reversed)
            const minW = 320;
            const maxW = Math.min(800, window.innerWidth - 160);
            const nextW = Math.min(maxW, Math.max(minW, resizeStartWidth + dx));
            setPanelWidth(nextW);
        };

        const handlePointerUp = () => {
            setIsResizing(false);
        };

        window.addEventListener('pointermove', handlePointerMove);
        window.addEventListener('pointerup', handlePointerUp);
        return () => {
            window.removeEventListener('pointermove', handlePointerMove);
            window.removeEventListener('pointerup', handlePointerUp);
        };
    }, [isResizing, resizeStartX, resizeStartWidth]);

    useEffect(() => {
        if (editingId && editInputRef.current) {
            editInputRef.current.focus();
            editInputRef.current.select();
        }
    }, [editingId]);

    const handleResizePointerDown = (e: React.PointerEvent) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        setIsResizing(true);
        setResizeStartX(e.clientX);
        setResizeStartWidth(panelWidth);
        e.stopPropagation();
        e.preventDefault();
    };

    const handleDragStart = (e: React.DragEvent, item: AssetItem) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ __makingAsset: true, item }));
        e.dataTransfer.effectAllowed = 'copy';
    };

    const handleDoubleClick = (item: AssetItem) => {
        setEditingId(item.id);
        setEditingName(item.name || '');
    };

    const handleSaveEdit = (itemId: string) => {
        if (editingId === itemId && editingName.trim()) {
            onRename(category, itemId, editingName.trim());
        }
        setEditingId(null);
        setEditingName('');
    };

    const handleKeyDown = (e: React.KeyboardEvent, itemId: string) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSaveEdit(itemId);
        } else if (e.key === 'Escape') {
            setEditingId(null);
            setEditingName('');
        }
    };

    const handleGenerate = () => {
        if (prompt.trim()) {
            onGenerate(prompt.trim());
            setPrompt('');
        }
    };

    const items = library[category];

    // Minimized button
    if (isMinimized) {
        return (
            <button
                onClick={onToggleMinimize}
                className="fixed top-4 right-4 z-20 w-12 h-12 rounded-xl bg-white border border-neutral-200 shadow-lg hover:shadow-xl transition-shadow flex items-center justify-center text-neutral-700 hover:text-neutral-900"
                title="打开灵感库"
            >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2" />
                    <path d="M9 3v18" />
                </svg>
            </button>
        );
    }

    // Expanded panel
    return (
        <div
            ref={panelRef}
            className="fixed top-4 bottom-4 right-4 z-20 bg-white border border-neutral-200 rounded-2xl shadow-xl overflow-hidden flex flex-col"
            style={{ width: `${panelWidth}px` }}
        >
            {/* Resize handle (left edge) */}
            <div
                className="absolute left-0 top-0 bottom-0 w-2 cursor-ew-resize hover:bg-neutral-200/50 transition-colors z-10 group"
                onPointerDown={handleResizePointerDown}
            >
                <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-12 bg-neutral-300 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>

            {/* Header */}
            <div className="flex-shrink-0 flex items-center justify-between gap-3 px-4 py-3 border-b border-neutral-200">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <strong className="text-sm shrink-0">灵感库</strong>
                    <CategoryTabs value={category} onChange={setCategory} />
                </div>
                <button
                    onClick={onToggleMinimize}
                    className="shrink-0 text-neutral-400 hover:text-neutral-900 p-1 rounded-lg hover:bg-neutral-100 transition-colors"
                    title="最小化"
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M19 12H5" />
                    </svg>
                </button>
            </div>

            {/* Generate input */}
            <div className="flex-shrink-0 p-3 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                    <input
                        ref={promptInputRef}
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleGenerate();
                        }}
                        placeholder="描述你想要生成的图片..."
                        className="flex-1 px-3 py-2 text-sm rounded-lg border border-neutral-200 bg-neutral-50 focus:bg-white outline-none focus:border-neutral-400 transition-colors"
                    />
                    <button
                        onClick={handleGenerate}
                        disabled={!prompt.trim()}
                        className="shrink-0 px-4 py-2 text-sm rounded-lg bg-neutral-900 text-white hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        生成
                    </button>
                </div>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto p-3">
                {items.length === 0 ? (
                    <div className="text-center text-neutral-500 text-sm py-10">
                        该分类暂无素材<br />选中图片后使用"加入灵感库"按钮添加
                    </div>
                ) : (
                    <div className="columns-2 gap-3">
                        {items.map(item => (
                            <div
                                key={item.id}
                                className="group inline-block w-full mb-3 break-inside-avoid rounded-xl border border-neutral-200 overflow-hidden hover:shadow-md cursor-grab active:cursor-grabbing relative bg-neutral-50 transition-shadow"
                                draggable
                                onDragStart={(e) => handleDragStart(e, item)}
                            >
                                <img src={item.dataUrl} alt={item.name || ''} className="w-full h-auto object-contain bg-neutral-50" />

                                {/* Hover overlay */}
                                {editingId === item.id ? (
                                    <div className="absolute inset-x-2 bottom-2 flex items-center gap-2">
                                        <input
                                            ref={editInputRef}
                                            type="text"
                                            value={editingName}
                                            onChange={(e) => setEditingName(e.target.value)}
                                            onBlur={() => handleSaveEdit(item.id)}
                                            onKeyDown={(e) => handleKeyDown(e, item.id)}
                                            className="text-xs px-2 py-1 border border-blue-400 rounded-lg outline-none bg-white/95 backdrop-blur min-w-0 flex-1 shadow-lg"
                                            placeholder="输入素材名称"
                                            aria-label="素材名称"
                                        />
                                    </div>
                                ) : (
                                    <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
                                        <div className="absolute bottom-2 left-2 right-2 text-white flex items-end justify-between gap-2">
                                            <div className="min-w-0 pointer-events-auto cursor-text" onDoubleClick={() => handleDoubleClick(item)}>
                                                <div className="text-[13px] font-medium truncate">{item.name || '未命名'}</div>
                                                <div className="text-[11px] opacity-80">{item.width}×{item.height}</div>
                                            </div>
                                            <button
                                                className="pointer-events-auto p-1.5 rounded-lg bg-white/10 hover:bg-white/20 backdrop-blur transition-colors"
                                                title="删除"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onRemove(category, item.id);
                                                }}
                                            >
                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="text-white">
                                                    <polyline points="3 6 5 6 21 6" />
                                                    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                    <path d="M10 11v6" />
                                                    <path d="M14 11v6" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

