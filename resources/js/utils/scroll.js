const DEFAULT_HEADER_SELECTOR = '[data-site-header], header';

export function getSiteHeader(selector = DEFAULT_HEADER_SELECTOR) {
    if (typeof document === 'undefined') return null;
    return document.querySelector(selector);
}

export function getHeaderBottom(header = getSiteHeader()) {
    if (!header) return 0;
    return Math.max(0, header.getBoundingClientRect().bottom);
}

/**
 * Scroll an element into view directly below the current site header.
 * The target and header are measured at execution time, not when this is called.
 */
export function scrollToElement(target, {
    behavior = 'smooth',
    offset = 0,
    header,
    onBeforeScroll,
} = {}) {
    if (!target || typeof window === 'undefined') return null;

    return window.requestAnimationFrame(() => {
        if (!target.isConnected) return;

        const headerElement = header ?? getSiteHeader();
        const headerBottom = getHeaderBottom(headerElement);
        const targetTop = window.scrollY
            + target.getBoundingClientRect().top
            - headerBottom
            - offset;

        onBeforeScroll?.();
        window.scrollTo({
            top: Math.max(0, targetTop),
            behavior,
        });
    });
}
