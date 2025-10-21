import type { AssetLibrary, AssetItem, AssetCategory } from '../types';

const STORAGE_KEY = 'making.assetLibrary.v1';

export const loadAssetLibrary = (): AssetLibrary => {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return { character: [], scene: [], prop: [] };
        const parsed = JSON.parse(raw) as AssetLibrary;
        return {
            character: parsed.character || [],
            scene: parsed.scene || [],
            prop: parsed.prop || [],
        };
    } catch {
        return { character: [], scene: [], prop: [] };
    }
};

export const saveAssetLibrary = (lib: AssetLibrary) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lib));
};

export const addAsset = (lib: AssetLibrary, item: AssetItem): AssetLibrary => {
    const next: AssetLibrary = { ...lib, [item.category]: [item, ...lib[item.category]] } as AssetLibrary;
    saveAssetLibrary(next);
    return next;
};

export const removeAsset = (lib: AssetLibrary, category: AssetCategory, id: string): AssetLibrary => {
    const next: AssetLibrary = { ...lib, [category]: lib[category].filter(a => a.id !== id) } as AssetLibrary;
    saveAssetLibrary(next);
    return next;
};

export const renameAsset = (lib: AssetLibrary, category: AssetCategory, id: string, name: string): AssetLibrary => {
    const next: AssetLibrary = { ...lib, [category]: lib[category].map(a => a.id === id ? { ...a, name } : a) } as AssetLibrary;
    saveAssetLibrary(next);
    return next;
};


