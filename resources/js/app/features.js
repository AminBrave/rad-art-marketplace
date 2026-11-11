/**
 * Read the server-provided feature registry.
 *
 * Laravel injects the registry into the application shell so the browser and
 * backend use the same configured values. Unknown or missing flags fail closed.
 */
export function isFeatureEnabled(feature) {
    if (typeof window === 'undefined') return false;

    return window.__RAD_FEATURES__?.[feature] === true;
}
