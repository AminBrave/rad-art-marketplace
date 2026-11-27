import { useEffect, useState } from 'react';

/**
 * Detects whether a scroll container has clipped content at its edges.
 * Horizontal direction is logical (start/end); vertical uses top/bottom.
 */
export function useScrollOverflow(
    scrollRef,
    { enabled = true, axis = 'horizontal', direction = 'ltr', contentKey = '' } = {},
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

            let next;
            if (axis === 'vertical') {
                // Scroll metrics are more reliable than child bounding boxes here:
                // the scrollport can include padding, and nested filter sections may
                // change their layout while the sidebar itself stays max-height constrained.
                const maxScrollTop = element.scrollHeight - element.clientHeight;
                next = {
                    start: element.scrollTop > 1,
                    end: maxScrollTop > 1 && element.scrollTop < maxScrollTop - 1,
                };
            } else {
                next = direction === 'rtl'
                    ? {
                        start: first.right > bounds.right + 1,
                        end: last.left < bounds.left - 1,
                    }
                    : {
                        start: first.left < bounds.left - 1,
                        end: last.right > bounds.right + 1,
                    };
            }

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
    }, [axis, contentKey, direction, enabled, scrollRef]);

    return visibleFades;
}

/** Backwards-compatible horizontal overflow helper. */
export function useHorizontalOverflow(scrollRef, options = {}) {
    return useScrollOverflow(scrollRef, { ...options, axis: 'horizontal' });
}
