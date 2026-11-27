import { useEffect, useState } from 'react';

/**
 * Detects whether a horizontal scroller has content clipped at either logical edge.
 * Direction must be 'rtl' or 'ltr'.
 */
export function useHorizontalOverflow(
    scrollRef,
    { enabled = true, direction = 'ltr', contentKey = '' } = {},
) {
    const [visibleFades, setVisibleFades] = useState({ start: false, end: false });

    useEffect(() => {
        if (!enabled) {
            setVisibleFades({ start: false, end: false });
            return undefined;
        }

        const element = scrollRef.current;
        if (!element) return undefined;

        const updateFades = () => {
            const first = element.firstElementChild?.getBoundingClientRect();
            const last = element.lastElementChild?.getBoundingClientRect();
            const bounds = element.getBoundingClientRect();

            if (!first || !last) {
                setVisibleFades({ start: false, end: false });
                return;
            }

            const next = direction === 'rtl'
                ? {
                    start: first.right > bounds.right + 1,
                    end: last.left < bounds.left - 1,
                }
                : {
                    start: first.left < bounds.left - 1,
                    end: last.right > bounds.right + 1,
                };

            setVisibleFades((current) => (
                current.start === next.start && current.end === next.end ? current : next
            ));
        };

        updateFades();
        element.addEventListener('scroll', updateFades, { passive: true });

        const resizeObserver = typeof window.ResizeObserver === 'function'
            ? new window.ResizeObserver(updateFades)
            : null;

        resizeObserver?.observe(element);
        if (element.firstElementChild) resizeObserver?.observe(element.firstElementChild);
        if (element.lastElementChild) resizeObserver?.observe(element.lastElementChild);
        window.addEventListener('resize', updateFades);

        return () => {
            element.removeEventListener('scroll', updateFades);
            window.removeEventListener('resize', updateFades);
            resizeObserver?.disconnect();
        };
    }, [contentKey, direction, enabled, scrollRef]);

    return visibleFades;
}
