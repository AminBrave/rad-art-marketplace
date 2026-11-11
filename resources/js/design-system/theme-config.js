export const DEFAULT_THEME_CONFIG = {
    defaultTheme: 'new-york',
    allowRuntimeSwitching: true,
    persistSelection: true,
    storageKey: 'rad-art-theme',
    themes: {
        editorial: { id: 'editorial', name: 'Editorial', enabled: true },
        'new-york': { id: 'new-york', name: 'New York', enabled: true },
    },
};

export function getThemeConfig() {
    const injected = globalThis.window?.__RAD_THEME_CONFIG__;

    return {
        ...DEFAULT_THEME_CONFIG,
        ...(injected ?? {}),
        themes: injected?.themes ?? DEFAULT_THEME_CONFIG.themes,
    };
}
