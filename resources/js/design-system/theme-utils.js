import { DEFAULT_THEME_CONFIG } from './theme-config.js';

export function isThemeEnabled(themeId, config = DEFAULT_THEME_CONFIG) {
    return Boolean(themeId && config.themes?.[themeId]?.enabled);
}

export function resolveTheme(themeId, config = DEFAULT_THEME_CONFIG) {
    if (isThemeEnabled(themeId, config)) return themeId;
    if (isThemeEnabled(config.defaultTheme, config)) return config.defaultTheme;

    return Object.values(config.themes ?? {}).find((theme) => theme.enabled)?.id ?? 'editorial';
}

export function readThemePreference(storage, config = DEFAULT_THEME_CONFIG) {
    if (!config.allowRuntimeSwitching || !config.persistSelection || !storage) return null;

    try {
        const preference = storage.getItem(config.storageKey);
        return isThemeEnabled(preference, config) ? preference : null;
    } catch {
        return null;
    }
}

export function getInitialTheme(storage, config = DEFAULT_THEME_CONFIG) {
    return resolveTheme(readThemePreference(storage, config) ?? config.defaultTheme, config);
}

export function persistThemePreference(storage, themeId, config = DEFAULT_THEME_CONFIG) {
    if (!config.allowRuntimeSwitching || !config.persistSelection || !storage || !isThemeEnabled(themeId, config)) {
        return false;
    }

    try {
        storage.setItem(config.storageKey, themeId);
        return true;
    } catch {
        return false;
    }
}
