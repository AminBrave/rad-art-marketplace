const FALLBACK_SURFACE = '#F7F5F0';

export function parseColor(input) {
    if (typeof input !== 'string') return null;
    const value = input.trim().toLowerCase();
    const hex = value.match(/^#([\da-f]{3,8})$/i);

    if (hex) {
        let digits = hex[1];
        if (digits.length === 3 || digits.length === 4) digits = [...digits].map((part) => part + part).join('');
        if (digits.length !== 6 && digits.length !== 8) return null;
        return {
            r: Number.parseInt(digits.slice(0, 2), 16),
            g: Number.parseInt(digits.slice(2, 4), 16),
            b: Number.parseInt(digits.slice(4, 6), 16),
            a: digits.length === 8 ? Number.parseInt(digits.slice(6, 8), 16) / 255 : 1,
        };
    }

    const rgb = value.match(/^rgba?\((.+)\)$/);
    if (!rgb) return null;
    const parts = rgb[1].replace('/', ' ').split(/[\s,]+/).filter(Boolean);
    if (parts.length < 3) return null;
    const channel = (part) => part.endsWith('%')
        ? Math.min(255, Math.max(0, Number.parseFloat(part) * 2.55))
        : Math.min(255, Math.max(0, Number.parseFloat(part)));
    const alpha = parts[3] === undefined ? 1
        : parts[3].endsWith('%') ? Number.parseFloat(parts[3]) / 100 : Number.parseFloat(parts[3]);
    const color = { r: channel(parts[0]), g: channel(parts[1]), b: channel(parts[2]), a: Math.min(1, Math.max(0, alpha)) };
    return Object.values(color).every(Number.isFinite) ? color : null;
}

function composite(foreground, background) {
    const alpha = foreground.a + background.a * (1 - foreground.a);
    if (!alpha) return { r: 0, g: 0, b: 0, a: 0 };
    return {
        r: (foreground.r * foreground.a + background.r * background.a * (1 - foreground.a)) / alpha,
        g: (foreground.g * foreground.a + background.g * background.a * (1 - foreground.a)) / alpha,
        b: (foreground.b * foreground.a + background.b * background.a * (1 - foreground.a)) / alpha,
        a: alpha,
    };
}

function luminance(color) {
    const linear = [color.r, color.g, color.b].map((channel) => {
        const value = channel / 255;
        return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
    });
    return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
}

export function getContrastRatio(foreground, background) {
    const first = typeof foreground === 'string' ? parseColor(foreground) : foreground;
    const second = typeof background === 'string' ? parseColor(background) : background;
    if (!first || !second) throw new TypeError('Both foreground and background must be valid CSS colors.');
    const firstOpaque = first.a < 1 ? composite(first, second) : first;
    const secondOpaque = second.a < 1 ? composite(second, parseColor(FALLBACK_SURFACE)) : second;
    const pair = [luminance(firstOpaque), luminance(secondOpaque)].sort((a, b) => b - a);
    return (pair[0] + 0.05) / (pair[1] + 0.05);
}

function colorLabel(color) {
    return 'rgb(' + Math.round(color.r) + ' ' + Math.round(color.g) + ' ' + Math.round(color.b) + ')';
}

function elementLabel(element) {
    const tag = element.tagName?.toLowerCase() ?? 'unknown';
    const id = element.id ? '#' + element.id : '';
    const classes = typeof element.className === 'string'
        ? element.className.trim().split(/\s+/).filter(Boolean).slice(0, 3).map((name) => '.' + name).join('')
        : '';
    return tag + id + classes;
}

function effectiveBackground(element, getStyle) {
    const ancestors = [];
    for (let node = element; node && node.nodeType === 1; node = node.parentElement) ancestors.push(node);
    let background = parseColor(FALLBACK_SURFACE);
    let hasImage = false;

    for (const node of ancestors.reverse()) {
        const style = getStyle(node);
        if (style.backgroundImage && style.backgroundImage !== 'none') hasImage = true;
        const previousBackground = background;
        const layer = parseColor(style.backgroundColor);
        if (layer && layer.a > 0) background = composite(layer, previousBackground);
        const opacity = Math.min(1, Math.max(0, Number.parseFloat(style.opacity || '1')));
        if (opacity < 1) background = composite({ ...background, a: opacity }, previousBackground);
    }

    return { background, hasImage };
}

function effectiveOpacity(element, getStyle) {
    let opacity = 1;
    for (let node = element; node && node.nodeType === 1; node = node.parentElement) {
        opacity *= Math.min(1, Math.max(0, Number.parseFloat(getStyle(node).opacity || '1')));
    }
    return opacity;
}

function isDisabled(element) {
    for (let node = element; node && node.nodeType === 1; node = node.parentElement) {
        if (node.matches?.(':disabled') || node.getAttribute('aria-disabled') === 'true') return true;
    }
    return false;
}

function hasOwnText(element) {
    return [...element.childNodes].some((node) => node.nodeType === 3 && node.textContent.trim().length > 0);
}

function isVisible(element, getStyle) {
    for (let node = element; node && node.nodeType === 1; node = node.parentElement) {
        const style = getStyle(node);
        if (style.display === 'none' || style.visibility === 'hidden') return false;
    }
    return true;
}

/**
 * Audits every rendered element in the supplied document or root element.
 * Text uses WCAG 2.2 AA thresholds (4.5:1, or 3:1 for large text);
 * meaningful icons, focus indicators and form-control boundaries use 3:1.
 * Image/gradient backgrounds are surfaced for manual review because their
 * contrast varies by pixel and cannot be certified from computed CSS colors.
 */
export function auditColorAccessibility(root = globalThis.document) {
    if (!root) throw new TypeError('A document or root element is required.');
    const document = root.nodeType === 9 ? root : root.ownerDocument;
    const view = document?.defaultView;
    if (!view?.getComputedStyle) throw new TypeError('The audit root must belong to a browser document.');
    const elements = [];
    if (root.nodeType === 1) elements.push(root);
    elements.push(...root.querySelectorAll('*'));

    const failures = [];
    const manualReview = [];
    let textChecks = 0;
    let nonTextChecks = 0;
    const getStyle = (element) => view.getComputedStyle(element);
    const addCheck = (element, foreground, background, minimum, kind) => {
        const ratio = getContrastRatio(foreground, background);
        if (ratio < minimum) {
            failures.push({
                element: elementLabel(element),
                kind,
                foreground: typeof foreground === 'string' ? foreground : colorLabel(foreground),
                background: typeof background === 'string' ? background : colorLabel(background),
                ratio: Number(ratio.toFixed(2)),
                minimum,
            });
        }
    };

    for (const element of elements) {
        const style = getStyle(element);
        const opacity = effectiveOpacity(element, getStyle);
        if (!isVisible(element, getStyle) || opacity <= 0 || isDisabled(element)) continue;
        const resolved = effectiveBackground(element, getStyle);
        const background = resolved.background;

        if (resolved.hasImage && (hasOwnText(element) || element.tagName?.toLowerCase() === 'svg')) {
            manualReview.push({ element: elementLabel(element), reason: 'Text or icon is rendered over an image/gradient background.' });
        }

        if (hasOwnText(element)) {
            const foreground = parseColor(style.color);
            if (foreground && foreground.a > 0) {
                foreground.a *= opacity;
                const fontSize = Number.parseFloat(style.fontSize) || 16;
                const isBold = Number.parseInt(style.fontWeight, 10) >= 700;
                const isLarge = fontSize >= 24 || (isBold && fontSize >= 18.66);
                textChecks += 1;
                addCheck(element, foreground, background, isLarge ? 3 : 4.5, 'text');
            }
        }

        if (element.tagName?.toLowerCase() === 'svg') {
            const foreground = parseColor(style.color);
            if (foreground && foreground.a > 0) {
                foreground.a *= opacity;
                nonTextChecks += 1;
                addCheck(element, foreground, background, 3, 'icon');
            }
        }

        if (['input', 'select', 'textarea'].includes(element.tagName?.toLowerCase())) {
            const borderWidth = Number.parseFloat(style.borderTopWidth) || 0;
            const border = parseColor(style.borderTopColor);
            if (style.borderTopStyle !== 'none' && borderWidth > 0 && border && border.a > 0) {
                border.a *= opacity;
                nonTextChecks += 1;
                addCheck(element, border, background, 3, 'control-boundary');
            }

            if (element.getAttribute('placeholder')) {
                const placeholderStyle = view.getComputedStyle(element, '::placeholder');
                const placeholder = parseColor(placeholderStyle.color);
                if (placeholder && placeholder.a > 0) {
                    placeholder.a *= opacity;
                    textChecks += 1;
                    addCheck(element, placeholder, background, 4.5, 'placeholder');
                }
            }
        }

        try {
            if (element.matches(':focus-visible')) {
                const outlineWidth = Number.parseFloat(style.outlineWidth) || 0;
                const outline = parseColor(style.outlineColor);
                if (outlineWidth > 0 && outline && outline.a > 0) {
                    nonTextChecks += 1;
                    addCheck(element, outline, background, 3, 'focus-indicator');
                }
            }
        } catch {
            // Older embedded browsers may not implement :focus-visible.
        }
    }

    return {
        checkedElements: elements.length,
        textChecks,
        nonTextChecks,
        failures,
        manualReview,
        passed: failures.length === 0,
    };
}
