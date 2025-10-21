import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Element } from '../types';

interface LayerPanelMinimizableProps {
    isMinimized: boolean;
    onToggleMinimize: () => void;
    elements: Element[];
    selectedElementIds: string[];
    onSelectElement: (id: string | null) => void;
    onToggleVisibility: (id: string) => void;
    onToggleLock: (id: string) => void;
    onRenameElement: (id: string, name: string) => void;
    onReorder: (draggedId: string, targetId: string, position: 'before' | 'after') => void;
}

const getElementIcon = (element: Element): React.ReactNode => {
    const commonProps = {
        width: "16",
        height: "16",
        viewBox: "0 0 24 24",
        fill: "none",
        stroke: "currentColor",
        strokeWidth: "2",
        strokeLinecap: "round" as const,
        strokeLinejoin: "round" as const,
    };

    switch (element.type) {
        case 'image':
            return <svg {...commonProps}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>;
        case 'video':
            return <svg {...commonProps}><path d="m22 8-6 4 6 4V8Z" /><rect x="2" y="6" width="14" height="12" rx="2" ry="2" /></svg>;
        case 'text':
            return <svg {...commonProps}><polyline points="4 7 4 4 20 4 20 7"></polyline><line x1="9" y1="20" x2="15" y2="20"></line><line x1="12" y1="4" x2="12" y2="20"></line></svg>;
        case 'shape':
            switch (element.shapeType) {
                case 'rectangle': return <svg {...commonProps}><rect x="3" y="3" width="18" height="18" rx="2" ry="2" /></svg>;
                case 'circle': return <svg {...commonProps}><circle cx="12" cy="12" r="10" /></svg>;
                case 'triangle': return <svg {...commonProps}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /></svg>;
            }
            break;
        case 'group':
            return <svg {...commonProps}><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path></svg>;
        case 'path':
            return <svg {...commonProps}><path d="M12 20h9"></path><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path></svg>;
        case 'arrow':
            return <svg {...commonProps}><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>;
        case 'line':
            return <svg {...commonProps}><line x1="5" y1="19" x2="19" y2="5"></line></svg>;
        default:
            return <svg {...commonProps}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>;
    }
    return <svg {...commonProps}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>;
};

const LayerItem: React.FC<{
    element: Element;
    level: number;
    isSelected: boolean;
    onSelect: () => void;
    onToggleVisibility: () => void;
    onToggleLock: () => void;
    onRename: (name: string) => void;
    onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
    onDragLeave: (e: React.DragEvent<HTMLDivElement>) => void;
}> = ({ element, level, isSelected, onSelect, onToggleVisibility, onToggleLock, onRename, ...dragProps }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(element.name || element.type);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setName(element.name || element.type);
    }, [element.name, element.type]);

    useEffect(() => {
        if (isEditing && inputRef.current) {
            inputRef.current.focus();
            inputRef.current.select();
        }
    }, [isEditing]);

    const handleBlur = () => {
        setIsEditing(false);
        if (name.trim() === '') {
            setName(element.name || element.type);
        } else {
            onRename(name);
        }
    };

    const iconProps = {
        width: 16, height: 16, viewBox: "0 0 24 24", fill: "none",
        stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round" as const, strokeLinejoin: "round" as const
    };

    return (
        <div
            draggable
            {...dragProps}
            onClick={onSelect}
            onDoubleClick={() => setIsEditing(true)}
            className={`flex items-center space-x-2 p-1.5 rounded-md cursor-pointer text-sm transition-colors group ${isSelected ? 'bg-neutral-900/10' : 'hover:bg-neutral-100'
                } ${element.isVisible === false ? 'opacity-50' : ''}`}
            style={{ paddingLeft: `${10 + level * 20}px` }}
        >
            <span className="flex-shrink-0 w-4 h-4 flex items-center justify-center text-gray-400">{getElementIcon(element)}</span>
            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
                    className="flex-grow bg-transparent border-b border-neutral-400 outline-none text-neutral-900"
                    onClick={e => e.stopPropagation()}
                    placeholder="图层名称"
                    aria-label="图层名称"
                />
            ) : (
                <span className="flex-grow truncate text-xs">{name}</span>
            )}
            <div className="flex-shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleLock(); }}
                    className={`p-1 rounded-full hover:bg-neutral-100 ${element.isLocked ? 'text-neutral-900' : 'text-neutral-400'}`}
                    title={element.isLocked ? "Unlock" : "Lock"}
                >
                    {element.isLocked ?
                        <svg {...iconProps}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg> :
                        <svg {...iconProps}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 9.9-1"></path></svg>
                    }
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
                    className="p-1 rounded-full hover:bg-neutral-100 text-neutral-400"
                    title={element.isVisible === false ? "Show" : "Hide"}
                >
                    {element.isVisible === false ?
                        <svg {...iconProps}><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg> :
                        <svg {...iconProps}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    }
                </button>
            </div>
        </div>
    );
};

export const LayerPanelMinimizable: React.FC<LayerPanelMinimizableProps> = ({
    isMinimized,
    onToggleMinimize,
    elements,
    selectedElementIds,
    onSelectElement,
    onToggleVisibility,
    onToggleLock,
    onRenameElement,
    onReorder
}) => {
    const panelRef = useRef<HTMLDivElement>(null);
    const [dragOverId, setDragOverId] = useState<string | null>(null);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, id: string) => {
        e.dataTransfer.setData('text/plain', id);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const target = e.currentTarget;
        const id = target.getAttribute('data-id');
        setDragOverId(id);
        target.style.background = 'rgba(255,255,255,0.2)';
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.currentTarget.style.background = '';
        setDragOverId(null);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
        e.preventDefault();
        e.currentTarget.style.background = '';
        setDragOverId(null);
        const draggedId = e.dataTransfer.getData('text/plain');

        const rect = e.currentTarget.getBoundingClientRect();
        const position = e.clientY - rect.top > rect.height / 2 ? 'after' : 'before';

        if (draggedId && targetId && draggedId !== targetId) {
            onReorder(draggedId, targetId, position);
        }
    };

    const elementMap = useMemo(() => new Map(elements.map(el => [el.id, el])), [elements]);

    const renderOrderedLayers = (elements: Element[], level: number = 0, parentId?: string) => {
        return elements
            .filter(el => el.parentId === parentId)
            .map(element => (
                <React.Fragment key={element.id}>
                    <div data-id={element.id} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, element.id)}>
                        <LayerItem
                            element={element}
                            level={level}
                            isSelected={selectedElementIds.includes(element.id)}
                            onSelect={() => onSelectElement(element.id)}
                            onToggleLock={() => onToggleLock(element.id)}
                            onToggleVisibility={() => onToggleVisibility(element.id)}
                            onRename={name => onRenameElement(element.id, name)}
                            onDragStart={e => handleDragStart(e, element.id)}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, element.id)}
                        />
                    </div>
                    {renderOrderedLayers(elements, level + 1, element.id)}
                </React.Fragment>
            ));
    };

    // "传送门"效果：用 scaleX 从左边一条竖线展开
    return (
        <div
            ref={panelRef}
            style={{
                left: '16px',
                width: '256px', // 宽度固定
                transform: isMinimized ? 'scaleX(0.005)' : 'scaleX(1)', // 从极小缩放到正常
                transformOrigin: 'left center', // 从左边展开
                opacity: isMinimized ? 0 : 1,
                transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.25s ease-out',
                pointerEvents: isMinimized ? 'none' : 'auto',
            }}
            className="fixed top-4 bottom-4 z-20 bg-white border border-neutral-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
            {/* Header - with big minimize button */}
            <div className="flex-shrink-0 flex justify-between items-center px-3 py-2 border-b border-neutral-200">
                <h3 className="text-sm font-semibold">图层</h3>
                <button
                    onClick={onToggleMinimize}
                    className="shrink-0 p-2.5 rounded-xl border border-neutral-200 hover:bg-neutral-100 transition-colors"
                    title="最小化"
                    aria-label="最小化"
                >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <rect x="3" y="3" width="18" height="18" rx="3" />
                        <path d="M19 12H5" />
                    </svg>
                </button>
            </div>

            {/* Layer list */}
            <div className="flex-grow p-2 overflow-y-auto">
                {renderOrderedLayers([...elements].reverse())}
            </div>
        </div>
    );
};

