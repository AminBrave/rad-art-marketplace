import assert from 'node:assert/strict';
import { after, test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';

// Use Vite's existing JSX pipeline and React's server renderer so component
// contracts can be tested without adding a second DOM/test dependency stack.
const vite = await createServer({
    configFile: false,
    root: process.cwd(),
    plugins: [react()],
    server: { middlewareMode: true },
    appType: 'custom',
    logLevel: 'error',
});

const primitives = await vite.ssrLoadModule('/resources/js/components/ui/primitives.jsx');
const input = await vite.ssrLoadModule('/resources/js/components/ui/input.jsx');
const feedback = await vite.ssrLoadModule('/resources/js/components/ui/feedback.jsx');

after(async () => {
    await vite.close();
});

test('Button exposes disabled and busy semantics while loading', () => {
    const html = renderToStaticMarkup(
        React.createElement(primitives.Button, { loading: true }, 'ارسال'),
    );

    assert.match(html, /<button[^>]*disabled=""/);
    assert.match(html, /aria-busy="true"/);
    assert.match(html, /ارسال/);
});

test('FormField associates its label, hint and validation error with the control', () => {
    const html = renderToStaticMarkup(
        React.createElement(
            primitives.FormField,
            { id: 'email', label: 'ایمیل', hint: 'نشانی ورود', error: 'ایمیل معتبر نیست', required: true },
            React.createElement(input.Input, { type: 'email', name: 'email' }),
        ),
    );

    assert.match(html, /<label[^>]*for="email"/);
    assert.match(html, /<input[^>]*id="email"/);
    assert.match(html, /aria-invalid="true"/);
    assert.match(html, /aria-describedby="email-hint email-error"/);
    assert.match(html, /id="email-hint"/);
    assert.match(html, /id="email-error"/);
    assert.match(html, /role="alert"/);
});

test('SearchField renders a labelled search landmark and submit control', () => {
    const html = renderToStaticMarkup(
        React.createElement(primitives.SearchField, {
            value: 'آبرنگ',
            onChange: () => {},
            onSearch: () => {},
            label: 'جست‌وجو در آثار',
            buttonLabel: 'جست‌وجو',
        }),
    );

    assert.match(html, /role="search"/);
    assert.match(html, /type="search"/);
    assert.match(html, /جست‌وجو در آثار/);
    assert.match(html, /جست‌وجو/);
});

test('ErrorState announces errors and provides an actionable retry control', () => {
    const html = renderToStaticMarkup(
        React.createElement(feedback.ErrorState, {
            title: 'دریافت اطلاعات ناموفق بود',
            description: 'اتصال را بررسی کنید.',
            onRetry: () => {},
            retryLabel: 'تلاش دوباره',
        }),
    );

    assert.match(html, /role="alert"/);
    assert.match(html, /دریافت اطلاعات ناموفق بود/);
    assert.match(html, /تلاش دوباره/);
});

test('UploadFeedback clamps progress to the valid accessible range', () => {
    const html = renderToStaticMarkup(
        React.createElement(feedback.UploadFeedback, {
            fileName: 'artwork.png',
            status: 'uploading',
            progress: 140,
        }),
    );

    assert.match(html, /role="progressbar"/);
    assert.match(html, /aria-valuemin="0"/);
    assert.match(html, /aria-valuemax="100"/);
    assert.match(html, /aria-valuenow="100"/);
    assert.match(html, /width:100%/);
});

test('EmptyState renders a semantic heading and helpful description', () => {
    const html = renderToStaticMarkup(
        React.createElement(feedback.EmptyState, {
            title: 'اثری پیدا نشد',
            description: 'فیلترها را تغییر دهید.',
        }),
    );

    assert.match(html, /<section[^>]*dir="rtl"/);
    assert.match(html, /<h2[^>]*>اثری پیدا نشد<\/h2>/);
    assert.match(html, /فیلترها را تغییر دهید/);
});
