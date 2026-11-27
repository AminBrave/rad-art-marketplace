import { useLayoutEffect, useState } from 'react';

const noOverflow = { start: false, end: false };

/**
 * Detects clipped content in a scroll container.
 *
 * Horizontal edges are logical (start/end and RTL-aware); vertical edges
 * represent top/bottom. The hook observes scrolling, resizing and dynamic
 * child changes, so consumers do not need to manually refresh measurements.
 */
export function useScrollOverflow(
    scrollRef,
    { enabled = true, axis = 'horizontal', direction = 'ltr', contentKey = '' } = {},
) {
    const [visibleFades, setVisibleFades] = useState(noOverflow);

    useLayoutEffect(() => {
        const element = scrollRef.current;

        if (!enabled || !element) {
            setVisibleFades(noOverflow);
            return undefined;
        }

        let frame = null;
        let resizeObserver = null;

        const updateFades = () => {
            frame = null;

            const first = element.firstElementChild?.getBoundingClientRect();
            const last = element.lastElementChild?.getBoundingClientRect();
            const bounds = element.getBoundingClientRect();
            const next = { start: false, end: false };

            if (axis === 'vertical') {
                const maxScrollTop = element.scrollHeight - element.clientHeight;
                next.start = element.scrollTop > 1;
                next.end = maxScrollTop > 1 && element.scrollTop < maxScrollTop - 1;
            } else if (first && last) {
                // Element bounds handle RTL consistently across browsers, unlike
                // raw scrollLeft values whose origin differs between engines.
                next.start = direction === 'rtl'
                    ? first.right > bounds.right + element.clientLeft + 1
                    : first.left < bounds.left + element.clientLeft - 1;
                next.end = direction === 'rtl'
                    ? last.left < bounds.left + element.clientLeft + element.clientWidth - 1
                    : last.right > bounds.left + element.clientLeft + element.clientWidth + 1;
            } else {
                const maxScrollLeft = element.scrollWidth - element.clientWidth;
                next.start = maxScrollLeft > 1 && (direction === 'rtl'
                    ? element.scrollLeft < -1
                    : element.scrollLeft > 1);
                next.end = maxScrollLeft > 1 && (direction === 'rtl'
                    ? element.scrollLeft > -maxScrollLeft + 1
                    : element.scrollLeft < maxScrollLeft - 1);
            }

            setVisibleFades((current) => (
                current.start === next.start && current.end === next.end ? current : next
            ));
        };

        const scheduleUpdate = () => {
            if (frame === null) frame = window.requestAnimationFrame(updateFades);
        };

        const observeChildren = () => {
            if (!resizeObserver) return;
            resizeObserver.disconnect();
            resizeObserver.observe(element);
            Array.from(element.children).forEach((child) => resizeObserver.observe(child));
        };

        updateFades();
        element.addEventListener('scroll', scheduleUpdate, { passive: true });

        resizeObserver = typeof window.ResizeObserver === 'function'
            ? new window.ResizeObserver(scheduleUpdate)
            : null;
        observeChildren();

        const mutationObserver = typeof window.MutationObserver === 'function'
            ? new window.MutationObserver(() => {
                observeChildren();
                scheduleUpdate();
            })
            : null;
        mutationObserver?.observe(element, { childList: true, subtree: true, characterData: true });

        window.addEventListener('resize', scheduleUpdate);

        return () => {
            element.removeEventListener('scroll', scheduleUpdate);
            window.removeEventListener('resize', scheduleUpdate);
            resizeObserver?.disconnect();
            mutationObserver?.disconnect();
            if (frame !== null) window.cancelAnimationFrame(frame);
        };
    }, [axis, contentKey, direction, enabled, scrollRef]);

    return visibleFades;
}

/** Backwards-compatible horizontal overflow helper. */
export function useHorizontalOverflow(scrollRef, options = {}) {
    return useScrollOverflow(scrollRef, { ...options, axis: 'horizontal' });
}
