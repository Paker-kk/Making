import React from 'react';
import type { AssetCategory } from '../types';

interface AssetAddModalProps {
    isOpen: boolean;
    onClose: () => void;
    previewDataUrl: string;
    onConfirm: (category: AssetCategory, name?: string) => void;
}

export const AssetAddModal: React.FC<AssetAddModalProps> = ({ isOpen, onClose, previewDataUrl, onConfirm }) => {
    const [category, setCategory] = React.useState<AssetCategory>('character');
    const [name, setName] = React.useState<string>('');

    React.useEffect(() => {
        if (!isOpen) return;
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20" onClick={onClose}>
            <div className="w-[680px] bg-white rounded-2xl shadow-2xl border border-neutral-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-4 border-b border-neutral-200">
                    <strong>加入素材库</strong>
                    <button onClick={onClose} className="text-neutral-400 hover:text-neutral-900 p-1 rounded-full">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div className="p-4 grid grid-cols-2 gap-4">
                    <div className="border border-neutral-200 rounded-lg p-2 bg-neutral-50">
                        <img src={previewDataUrl} alt="预览" className="w-full h-64 object-contain" />
                    </div>
                    <div className="flex flex-col gap-3">
                        <label className="text-sm text-neutral-600">分类</label>
                        <div className="grid grid-cols-3 rounded-xl overflow-hidden border border-neutral-200 w-full max-w-sm">
                            {(['character','scene','prop'] as AssetCategory[]).map((cat, idx) => (
                                <button key={cat} onClick={() => setCategory(cat)}
                                        className={`px-3 py-1.5 text-sm transition-colors ${category===cat? 'bg-neutral-900 text-white':'bg-white hover:bg-neutral-50'} ${idx<2?'border-r border-neutral-200':''}`}>
                                    {cat==='character'?'角色':cat==='scene'?'场景':'道具'}
                                </button>
                            ))}
                        </div>
                        <label className="text-sm text-neutral-600">名称（可选）</label>
                        <input value={name} onChange={(e)=>setName(e.target.value)} placeholder="给素材起个名字" className="border border-neutral-200 rounded-md p-2 outline-none focus:ring-2 focus:ring-neutral-200" />
                        <div className="flex justify-end gap-2 mt-auto pt-2">
                            <button onClick={onClose} className="px-3 py-2 rounded-md bg-neutral-50 border border-neutral-200 text-neutral-700">取消</button>
                            <button onClick={()=> onConfirm(category, name || undefined)} className="px-3 py-2 rounded-md bg-neutral-900 text-white">加入</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


