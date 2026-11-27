# Shared layout and scroll hooks

These hooks provide domain-independent browser behavior for pages and shared UI. Import hooks from the public `resources/js/shared/hooks` entry point; import imperative scroll helpers from `resources/js/utils/scroll.js`.

## Measure the global header

```jsx
import { useHeaderOffset } from '../../shared/hooks';

function PageToolbar() {
    const headerOffset = useHeaderOffset();

    return <div style={{ top: headerOffset }} className="fixed inset-x-0">...</div>;
}
```

The public site header should carry `data-site-header`. The default selector also falls back to the first `header` element for layouts that have not adopted the attribute yet.

## Scroll an element below the header

```jsx
import { scrollToElement } from '../../utils/scroll';

scrollToElement(sectionRef.current, {
    behavior: 'smooth',
    offset: 12,
});
```

The target and header are measured inside the animation frame, immediately before scrolling. `offset` is additional breathing room below the header, not a replacement for header height. The helper returns the animation-frame request ID.

## Reveal an element on scroll direction

```jsx
import { useStickyOnScroll } from '../../shared/hooks';

const {
    enabled,
    visible,
    headerOffset,
    suppressDirectionFor,
} = useStickyOnScroll({
    activationRef: sectionEndRef,
    direction: 'up', // 'up', 'down' or 'either'
});

// Before an interaction that changes page layout:
suppressDirectionFor(1000);
```

The activation element's document position is captured when the hook mounts. The visible header offset is included in the activation calculation. Use `suppressDirectionFor` before applying filters, expanding content, or other layout-changing interactions that could cause browser scroll anchoring.

## Detect clipped scroll content

Use the shared `useScrollOverflow` hook for any horizontal or vertical scroll container, including responsive drawers, sticky sidebars, chip rows, tabs, carousels and nested panels:

```jsx
import { useScrollOverflow } from '../../shared/hooks';

const horizontalFades = useScrollOverflow(chipsRef, {
    axis: 'horizontal',
    direction: isRtl ? 'rtl' : 'ltr',
});

const verticalFades = useScrollOverflow(sidebarRef, {
    axis: 'vertical',
    enabled: drawerIsOpen,
});

// Horizontal: start/end are logical edges (RTL-aware).
// Vertical: start/end mean top/bottom.
```

The hook measures on layout commit so edge indicators are correct before the next paint, then responds to scroll events, viewport/container resizing, and dynamic content mutations/resizing. `enabled` can scope observation to a mounted/open scroll surface (for example, a dialog). `contentKey` is an optional explicit refresh signal for content changes that are not reflected in observed DOM mutations or sizes. The existing `useHorizontalOverflow` remains as a backwards-compatible wrapper.

The hook reports which edges are clipped; each consumer places the matching visual gradient around its own scrollport and chooses theme-aware colors. Keep overlays `pointer-events-none` so they never intercept scrolling, touch or clicks. Use the same hook on mobile and desktop rather than maintaining breakpoint-specific overflow logic.

## Ownership

Keep page-specific targets, filter state, route state, labels and visual decisions in their feature. Shared hooks should only own reusable measurement, scroll and overflow mechanics.
