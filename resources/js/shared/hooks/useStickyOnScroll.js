import { useCallback, useEffect, useRef, useState } from 'react';
import { useHeaderOffset } from './useHeaderOffset';

/**
 * Controls a sticky element using a measured activation point and scroll direction.
 * Call suppressDirectionFor() before layout-changing interactions to ignore
 * browser scroll anchoring while the page settles.
 */
export function useStickyOnScroll({
    activationRef,
    direction = 'up',
    activationThreshold = 8,
    headerSelector = '[data-site-header], header',
} = {}) {
    const headerOffset = useHeaderOffset(headerSelector);
    const lastScrollY = useRef(0);
    const suppressDirectionUntil = useRef(0);
    const [enabled, setEnabled] = useState(false);
    const [visible, setVisible] = useState(false);

    const suppressDirectionFor = useCallback((duration = 500) => {
        if (typeof window === 'undefined') return;
        suppressDirectionUntil.current = window.performance.now() + Math.max(0, duration);
        lastScrollY.current = window.scrollY;
    }, []);

    useEffect(() => {
        if (typeof window === 'undefined') return undefined;

        lastScrollY.current = window.scrollY;
        const activationElement = activationRef?.current;
        const activationDocumentY = activationElement
            ? activationElement.getBoundingClientRect().top + window.scrollY
            : 0;

        const handleScroll = () => {
            const currentY = window.scrollY;
            const suppressDirection = window.performance.now() < suppressDirectionUntil.current;
            const scrollingUp = currentY < lastScrollY.current;
            const scrollingDown = currentY > lastScrollY.current;
            const passedActivation = Boolean(activationElement)
                && currentY + headerOffset > activationDocumentY - activationThreshold;

            setEnabled((current) => (current === passedActivation ? current : passedActivation));

            if (!suppressDirection) {
                const movingInRequestedDirection = direction === 'down'
                    ? scrollingDown
                    : direction === 'either'
                        ? scrollingUp || scrollingDown
                        : scrollingUp;
                const nextVisible = passedActivation && movingInRequestedDirection;
                setVisible((current) => (current === nextVisible ? current : nextVisible));
            }

            lastScrollY.current = currentY;
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [activationRef, activationThreshold, direction, headerOffset]);

    return {
        enabled,
        visible,
        headerOffset,
        suppressDirectionFor,
    };
}
