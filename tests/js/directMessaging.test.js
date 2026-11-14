import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const messaging = read('../../resources/js/app/MessagingCenter.jsx');
const layouts = read('../../resources/js/app/Layouts.jsx');
const workspaceCss = read('../../resources/css/app.css');
const conversations = read('../../app/Http/Controllers/Api/V1/ConversationController.php');
const directStart = read('../../app/Http/Controllers/Api/V1/DirectConversationController.php');
const attachments = read('../../app/Http/Controllers/Api/V1/MessageAttachmentController.php');
const routes = read('../../routes/web.php');

test('message composer supports accessible text entry, IME-safe Enter send and multiline input', () => {
    assert.ok(messaging.includes('aria-label="متن پیام"'));
    assert.ok(messaging.includes("event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing"));
    assert.ok(messaging.includes('event.currentTarget.form?.requestSubmit()'));
    assert.ok(messaging.includes('maxLength={5000}'));
    assert.ok(messaging.includes('disabled={sending || safetyLoading || safety.blocked_by_me || safety.blocked_by_other}'));
});

test('messaging workspace fills the viewport and related artwork chips scroll horizontally in RTL', () => {
    assert.ok(layouts.includes('ra-workspace-shell min-h-screen bg-canvas text-ink'));
    assert.ok(!layouts.includes('h-[100dvh] min-h-0 flex-col overflow-hidden'));
    assert.ok(!layouts.includes('ra-workspace-content min-w-0 h-full'));
    assert.ok(!workspaceCss.includes('.ra-workspace-shell { min-height: 100vh'));
    assert.ok(messaging.includes('flex min-h-0 flex-col gap-3 overflow-visible'));
    assert.ok(messaging.includes('grid h-[100dvh] min-h-[100dvh] min-w-0 grid-cols-1 grid-rows-[minmax(0,1fr)]'));
    assert.ok(!messaging.includes('grid min-h-0 min-w-0 flex-1'));
    assert.ok(messaging.includes('flex-nowrap items-center gap-2 overflow-x-auto overscroll-x-contain'));
    assert.ok(messaging.includes('role="group" aria-label="آثار مرتبط" tabIndex={0}'));
    assert.ok(messaging.includes('shrink-0 truncate rounded-lg border border-border'));
    assert.ok(!messaging.includes('h-[calc(100dvh-14rem)]'));
    assert.ok(!messaging.includes('lg:h-[min(82dvh,900px)]'));
});

test('messaging uses a dedicated viewport page with only the main site header and independent chat panes', () => {
    assert.ok(layouts.includes('ra-public-header sticky top-0 z-40'));
    assert.ok(layouts.includes('publicHeaderRef'));
    assert.ok(layouts.includes("'--site-header-height': publicHeaderHeight + 'px'"));
    assert.ok(layouts.includes('{!isChatPage && <footer'));
    assert.ok(messaging.includes('ra-chat-page'));
    assert.ok(messaging.includes('ra-chat-layout grid min-h-0 min-w-0 flex-1'));
    assert.ok(messaging.includes('shrink-0 border-b border-border bg-white px-5 py-4'));
    assert.ok(!messaging.includes('sticky top-[var(--workspace-header-height,4.5rem)]'));
    assert.ok(messaging.includes('shrink-0 border-b border-border bg-white shadow-soft'));
    assert.ok(messaging.includes('overflow-y-auto overscroll-contain [scrollbar-gutter:stable]'));
    assert.ok(messaging.includes('px-3 py-3 sm:gap-3 sm:px-5 sm:py-5'));
    assert.ok(workspaceCss.includes('.ra-chat-page {'));
    assert.ok(workspaceCss.includes('height: calc(100dvh - var(--site-header-height, 4.5rem))'));
});

test('conversation history uses incremental synchronization and stable older-message cursors', () => {
    assert.ok(messaging.includes('after_id: latestMessageIdRef.current ?? 0'));
    assert.ok(messaging.includes('updated_after: syncCursorRef.current'));
    assert.ok(messaging.includes('before_id: beforeId'));
    assert.ok(conversations.includes("Carbon::parse($filters['updated_after'])->toDateTimeString()"));
    assert.ok(conversations.includes("where('id', '<', (int) $filters['before_id'])"));
    assert.ok(conversations.includes("'sync_cursor' => $syncCursor->toISOString()"));
});

test('artwork deep links become validated message references and persistent conversation context', () => {
    assert.ok(messaging.includes('artwork_id: pendingArtwork?.id ?? null'));
    assert.ok(messaging.includes('setPendingArtwork(artwork)'));
    assert.ok(messaging.includes('پاسخ درباره این اثر'));
    assert.ok(messaging.includes('selected.contexts.filter((context) => context.artwork?.slug)'));
    assert.ok(directStart.includes("'artwork_slug' => ['nullable', 'string', 'max:180']"));
    assert.ok(directStart.includes("->where('status', Artwork::STATUS_APPROVED)"));
    assert.ok(directStart.includes("DB::table('conversation_contexts')->updateOrInsert"));
    assert.ok(conversations.includes("Rule::exists('artworks', 'id')->where('status', Artwork::STATUS_APPROVED)"));
    assert.ok(conversations.includes("$artwork->artistProfile?->user_id"));
});

test('message replies, reactions, edit/delete and read receipts stay inside the selected conversation', () => {
    for (const feature of ['reply_to_id', 'setReaction', 'updateMessage', 'deleteMessage', 'markRead', 'read_at']) {
        assert.ok(conversations.includes(feature), 'Missing backend messaging capability: ' + feature);
    }
    assert.ok(messaging.includes('setReplyTo(message)'));
    assert.ok(messaging.includes('saveEdit(event, message)'));
    assert.ok(messaging.includes('deleteMessage(message)'));
    assert.ok(messaging.includes('reportMessage(message)'));
});

test('attachment upload and private image preview enforce participant, type, size and dimension boundaries', () => {
    assert.ok(messaging.includes('accept="image/jpeg,image/png,image/webp,application/pdf"'));
    assert.ok(messaging.includes('preview_url'));
    assert.ok(attachments.includes("abort_unless($this->isParticipant($user, $conversation), 404)"));
    assert.ok(attachments.includes("'max:10240'"));
    assert.ok(attachments.includes("'mimes:jpg,jpeg,png,webp,pdf'"));
    assert.ok(attachments.includes('$dimensions[0] > 6000'));
    assert.ok(attachments.includes("'Cache-Control' => 'private, no-store'"));
    assert.ok(attachments.includes("'X-Content-Type-Options' => 'nosniff'"));
});

test('direct messaging routes remain available in the authenticated workspace', () => {
    assert.ok(routes.includes("Route::post('/conversations/direct'"));
    assert.ok(routes.includes("Route::get('/conversations/{conversation}/messages'"));
    assert.ok(routes.includes("Route::post('/conversations/{conversation}/messages'"));
});
