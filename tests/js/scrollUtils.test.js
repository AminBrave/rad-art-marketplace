import assert from 'node:assert/strict';
import test from 'node:test';
import { getHeaderBottom, getSiteHeader, scrollToElement } from '../../resources/js/utils/scroll.js';

test('getSiteHeader resolves the shared header selector', () => {
    const header = { getBoundingClientRect: () => ({ bottom: 76 }) };
    global.document = {
        querySelector(selector) {
            assert.equal(selector, '[data-site-header], header');
            return header;
        },
    };

    assert.equal(getSiteHeader(), header);
    delete global.document;
});

test('getHeaderBottom measures the visible bottom edge and clamps negative values', () => {
    assert.equal(getHeaderBottom({ getBoundingClientRect: () => ({ bottom: 84 }) }), 84);
    assert.equal(getHeaderBottom({ getBoundingClientRect: () => ({ bottom: -12 }) }), 0);
    assert.equal(getHeaderBottom(null), 0);
});

test('scrollToElement positions the target below the measured header', () => {
    const calls = [];
    let beforeScrollCalled = false;
    const header = { getBoundingClientRect: () => ({ bottom: 72 }) };
    const target = {
        isConnected: true,
        getBoundingClientRect: () => ({ top: 310 }),
    };

    global.document = { querySelector: () => header };
    global.window = {
        scrollY: 500,
        requestAnimationFrame(callback) {
            callback();
            return 42;
        },
        scrollTo(options) {
            calls.push(options);
        },
    };

    const frameId = scrollToElement(target, {
        behavior: 'smooth',
        offset: 12,
        onBeforeScroll: () => {
            beforeScrollCalled = true;
        },
    });

    assert.equal(frameId, 42);
    assert.equal(beforeScrollCalled, true);
    assert.deepEqual(calls, [{ top: 726, behavior: 'smooth' }]);

    delete global.document;
    delete global.window;
});

test('scrollToElement ignores detached targets', () => {
    let scrollCalled = false;
    global.window = {
        requestAnimationFrame(callback) {
            callback();
            return 7;
        },
        scrollTo() {
            scrollCalled = true;
        },
    };

    scrollToElement({ isConnected: false, getBoundingClientRect: () => ({ top: 10 }) });

    assert.equal(scrollCalled, false);
    delete global.window;
});
