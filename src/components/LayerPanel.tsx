
import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Element } from '../types';

interface LayerPanelProps {
    isOpen: boolean;
    onClose: () => void;
    elements: Element[];
    selectedElementIds: string[];
    onSelectElement: (id: string | null) => void;
    onToggleVisibility: (id: string) => void;
    onToggleLock: (id: string) => void;
    onRenameElement: (id: string, name: string) => void;
    onReorder: (draggedId: string, targetId: string, position: 'before' | 'after') => void;
}

const getElementIcon = (element: Element) => {
    switch (element.type) {
        case 'image': return '🖼️';
        case 'text': return '🇹';
        case 'shape':
            switch (element.shapeType) {
                case 'rectangle': return '▭';
                case 'circle': return '◯';
                case 'triangle': return '▵';
            }
            break;
        case 'group': return '📁';
        case 'path': return '✎';
        case 'arrow': return '→';
        case 'line': return '—';
        default: return '●';
    }
    return '●';
};

const LayerItem: React.FC<{
    element: Element;
    level: number;
    isSelected: boolean;
    onSelect: () => void;
    onToggleVisibility: () => void;
    onToggleLock: () => void;
    onRename: (name: string) => void;
    // FIX: Changed drag handler prop types to match standard React event handlers.
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

    return (
        <div
            draggable
            {...dragProps}
            onClick={onSelect}
            onDoubleClick={() => setIsEditing(true)}
            className={`flex items-center space-x-2 p-1.5 rounded-md cursor-pointer text-sm transition-colors group ${
                isSelected ? 'bg-blue-500/30' : 'hover:bg-white/10'
            } ${element.isVisible === false ? 'opacity-50' : ''}`}
            style={{ paddingLeft: `${10 + level * 20}px` }}
        >
            <span className="flex-shrink-0 w-4">{getElementIcon(element)}</span>
            {isEditing ? (
                <input
                    ref={inputRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onBlur={handleBlur}
                    onKeyDown={(e) => e.key === 'Enter' && handleBlur()}
                    className="flex-grow bg-transparent border-b border-blue-400 outline-none text-white"
                    onClick={e => e.stopPropagation()}
                />
            ) : (
                <span className="flex-grow truncate">{name}</span>
            )}
            <div className="flex-shrink-0 flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleLock(); }}
                    className={`p-1 rounded-full hover:bg-white/20 ${element.isLocked ? 'text-white' : 'text-gray-500'}`}
                    title={element.isLocked ? "Unlock" : "Lock"}
                >
                    {element.isLocked ? '🔒' : '🔓'}
                </button>
                <button
                    onClick={(e) => { e.stopPropagation(); onToggleVisibility(); }}
                    className="p-1 rounded-full hover:bg-white/20"
                    title={element.isVisible === false ? "Show" : "Hide"}
                >
                    {element.isVisible === false ? '🙈' : '👁️'}
                </button>
            </div>
        </div>
    );
};

export const LayerPanel: React.FC<LayerPanelProps> = ({ isOpen, onClose, elements, selectedElementIds, onSelectElement, onToggleVisibility, onToggleLock, onRenameElement, onReorder }) => {
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
    const rootElements = useMemo(() => elements.filter(el => !el.parentId), [elements]);

    const renderLayers = (elementIds: string[], level: number) => {
        return elementIds.map(id => {
            const element = elementMap.get(id);
            if (!element) return null;

            const childrenIds = elements.filter(el => el.parentId === id).map(el => el.id);

            return (
                <React.Fragment key={id}>
                    <div data-id={id} onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={(e) => handleDrop(e, id)}>
                        <LayerItem
                            element={element}
                            level={level}
                            isSelected={selectedElementIds.includes(id)}
                            onSelect={() => onSelectElement(id)}
                            onToggleLock={() => onToggleLock(id)}
                            onToggleVisibility={() => onToggleVisibility(id)}
                            onRename={name => onRenameElement(id, name)}
                            onDragStart={e => handleDragStart(e, id)}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, id)}
                        />
                    </div>
                    {childrenIds.length > 0 && renderLayers(childrenIds, level + 1)}
                </React.Fragment>
            );
        });
    };

    // Render elements in their actual array order for Z-index representation
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


    if (!isOpen) return null;

    return (
        <div 
            ref={panelRef}
            className="absolute top-4 right-4 z-20 flex flex-col w-64 h-[calc(100vh-2rem)] backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl text-white overflow-hidden"
            style={{ backgroundColor: 'var(--ui-bg-color)' }}
        >
            <div className="flex-shrink-0 flex justify-between items-center p-3 border-b border-white/10 cursor-move">
                <h3 className="text-base font-semibold">Layers</h3>
                <button onClick={onClose} className="text-gray-400 hover:text-white p-1 rounded-full">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
            </div>
            <div className="flex-grow p-2 overflow-y-auto">
                 {renderOrderedLayers([...elements].reverse())}
            </div>
        </div>
    );
};
