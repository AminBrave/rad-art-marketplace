import { useEffect, useState } from 'react';
import { getHeaderBottom, getSiteHeader } from '../../utils/scroll';

/**
 * Tracks the visible bottom edge of the global site header.
 * Responds to header size changes, viewport changes and scrolling.
 */
export function useHeaderOffset(selector = '[data-site-header], header') {
    const [headerOffset, setHeaderOffset] = useState(() => getHeaderBottom(getSiteHeader(selector)));

    useEffect(() => {
        const header = getSiteHeader(selector);
        const updateOffset = () => {
            const nextOffset = getHeaderBottom(header);
            setHeaderOffset((current) => (
                Math.abs(current - nextOffset) < 1 ? current : nextOffset
            ));
        };

        updateOffset();

        const resizeObserver = typeof window.ResizeObserver === 'function' && header
            ? new window.ResizeObserver(updateOffset)
            : null;

        if (resizeObserver) resizeObserver.observe(header);
        window.addEventListener('scroll', updateOffset, { passive: true });
        window.addEventListener('resize', updateOffset);

        return () => {
            window.removeEventListener('scroll', updateOffset);
            window.removeEventListener('resize', updateOffset);
            resizeObserver?.disconnect();
        };
    }, [selector]);

    return headerOffset;
}
