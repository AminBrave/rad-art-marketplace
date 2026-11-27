# Shared layout and scroll hooks

These hooks provide domain-independent browser behavior for pages and shared UI. Import hooks from `resources/js/shared/hooks`; import imperative scroll helpers from `resources/js/utils/scroll.js`.

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

## Detect clipped horizontal content

```jsx
import { useHorizontalOverflow } from '../../shared/hooks';

const fades = useHorizontalOverflow(scrollRef, {
    enabled: true,
    direction: isRtl ? 'rtl' : 'ltr',
    contentKey: activeItems.join('|'),
});

// fades.start and fades.end indicate clipped content at logical edges.
```

Pass a `contentKey` that changes when the scroller's children change so measurements are refreshed after React updates the content. The hook only reports overflow; the consuming component owns the fade styling and theme tokens.

## Ownership

Keep page-specific targets, filter state, route state, labels and visual decisions in their feature. Shared hooks should only own reusable measurement, scroll and overflow mechanics.
