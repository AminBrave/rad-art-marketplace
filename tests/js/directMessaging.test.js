import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';

const read = (path) => readFileSync(new URL(path, import.meta.url), 'utf8');
const messaging = read('../../resources/js/app/MessagingCenter.jsx');
const messageTimeline = read('../../resources/js/app/MessageTimeline.jsx');
const messageComposer = read('../../resources/js/app/MessageComposer.jsx');
const relatedArtworkStrip = read('../../resources/js/app/RelatedArtworkStrip.jsx');
const messagingQueries = read('../../resources/js/app/useMessagingQueries.js');
const queryUtils = read('../../resources/js/app/messagingQueryUtils.js');
const conversations = read('../../app/Http/Controllers/Api/V1/ConversationController.php');
const directStart = read('../../app/Http/Controllers/Api/V1/DirectConversationController.php');
const attachments = read('../../app/Http/Controllers/Api/V1/MessageAttachmentController.php');
const routes = read('../../routes/web.php');

test('message composer supports accessible text entry, IME-safe Enter send and multiline input', () => {
    assert.ok(messageComposer.includes('aria-label="متن پیام"'));
    assert.ok(messageComposer.includes("event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing"));
    assert.ok(messageComposer.includes('event.currentTarget.form?.requestSubmit()'));
    assert.ok(messageComposer.includes('maxLength={5000}'));
    assert.ok(messageComposer.includes('disabled={sending || safetyLoading || safety.blocked_by_me || safety.blocked_by_other}'));
    assert.ok(messaging.includes('<MessageComposer'));
    assert.ok(messaging.includes('onSubmit={send}'), 'The parent retains ownership of the send transaction.');
    assert.ok(messaging.includes('onDraftChange={setDraft}'), 'The composer remains controlled by parent draft state.');
    assert.ok(messaging.includes('safetyLoading ? <p role="status"'), 'The parent keeps safety-loading gating outside the composer.');
    assert.ok(messaging.includes(': <MessageComposer'), 'The parent renders the composer only after safety checks permit messaging.');
    assert.doesNotMatch(messageComposer, /useState|useEffect|axios|fetch\(|window\.URL\.(?:create|revoke)ObjectURL/, 'The extracted composer has no local lifecycle, API, or object-URL ownership.');
});

test('conversation history uses incremental synchronization and stable older-message cursors', () => {
    assert.ok(messagingQueries.includes('const params = buildMessageSyncParams(cached)'));
    assert.ok(queryUtils.includes('after_id: cached.latestMessageId ?? 0'));
    assert.ok(queryUtils.includes('updated_after: cached.syncCursor'));
    assert.ok(messagingQueries.includes('params: { before_id: beforeId }'));
    assert.ok(conversations.includes("Carbon::parse($filters['updated_after'])->toDateTimeString()"));
    assert.ok(conversations.includes("where('id', '<', (int) $filters['before_id'])"));
    assert.ok(conversations.includes("'sync_cursor' => $syncCursor->toISOString()"));
});

test('artwork deep links become validated message references and persistent conversation context', () => {
    assert.ok(messaging.includes('artwork_id: pendingArtwork?.id ?? null'));
    assert.ok(messaging.includes('setPendingArtwork(artwork)'));
    assert.ok(messageComposer.includes('پاسخ درباره این اثر'));
    assert.ok(relatedArtworkStrip.includes('.filter((context) => context.artwork?.slug)'), 'The extracted strip filters canonical conversation artwork contexts for presentation.');
    assert.ok(messaging.includes('contexts={selected?.contexts}'), 'The parent supplies the selected conversation contexts to the strip.');
    assert.ok(messaging.includes('onSelectArtwork={(artwork) => {'), 'The parent retains artwork selection orchestration.');
    assert.ok(messaging.includes("next.set('artwork', artwork.slug)"), 'The parent retains artwork URL synchronization.');
    assert.ok(directStart.includes("'artwork_slug' => ['nullable', 'string', 'max:180']"));
    assert.ok(directStart.includes("->where('status', Artwork::STATUS_APPROVED)"));
    assert.ok(directStart.includes("DB::table('conversation_contexts')->updateOrInsert"));
    assert.ok(conversations.includes("Rule::exists('artworks', 'id')->where('status', Artwork::STATUS_APPROVED)"));
    assert.ok(conversations.includes("$artwork->artistProfile?->user_id"));
});

test('incremental sync restores the new-incoming-message indicator while scrolled up', () => {
    assert.ok(messaging.includes('messageSyncSnapshotRef'));
    assert.ok(messaging.includes('!snapshot.ids.has(Number(message.id))'));
    assert.ok(messaging.includes('Number(message.sender_id) !== Number(user?.id)'));
    assert.ok(messaging.includes('newIncomingCount > 0 && !shouldStickToBottomRef.current'));
    assert.ok(messaging.includes('setNewMessageCount((count) => count + newIncomingCount)'));
});

test('read receipts only update the current user inbox and reconcile unread-filtered entries', () => {
    assert.ok(messagingQueries.includes("const userInboxKey = [...messagingKeys.all, 'inbox', userId ?? 'anonymous']"));
    assert.ok(messagingQueries.includes('findAll({ queryKey: userInboxKey })'));
    assert.ok(messagingQueries.includes("query.queryKey[5] === 'unread'"));
    assert.ok(messagingQueries.includes('markConversationReadInInboxPages(current, id, { remove: isUnreadInbox })'));
    assert.ok(messagingQueries.includes('queryClient.setQueryData(messagingKeys.detail(id, userId)'));
    assert.ok(messaging.includes("threadFilter === 'unread' && !Number(detailQuery.data.unread_count)"));
    assert.ok(queryUtils.includes('return remove ? [] : [{ ...thread, unread_count: 0 }]'));
});

test('message replies, reactions, edit/delete and read receipts stay inside the selected conversation', () => {
    for (const feature of ['reply_to_id', 'setReaction', 'updateMessage', 'deleteMessage', 'markRead', 'read_at']) {
        assert.ok(conversations.includes(feature), 'Missing backend messaging capability: ' + feature);
    }
    assert.ok(messaging.includes('onReplyTo={setReplyTo}'), 'The parent supplies the selected-conversation reply state handler.');
    assert.ok(messageTimeline.includes('onReplyTo(message)'), 'The timeline delegates reply selection to its parent.');
    assert.ok(messageTimeline.includes('onSaveEdit(event, message)'));
    assert.ok(messaging.includes('onDeleteMessage={deleteMessage}'));
    assert.ok(messaging.includes('onReportMessage={reportMessage}'));
    assert.ok(messaging.includes('onSaveEdit={saveEdit}'));
    assert.doesNotMatch(messaging, /setReplyTo\(message\)/);
});

test('attachment upload and private image preview enforce participant, type, size and dimension boundaries', () => {
    assert.ok(messageComposer.includes('accept="image/jpeg,image/png,image/webp,application/pdf"'));
    assert.ok(messageComposer.includes('onChange={onFileChange}'));
    assert.ok(messaging.includes('onRemoveFile={() => {'), 'The parent owns attachment removal and per-conversation file state.');
    assert.ok(messageComposer.includes('onClick={onRemoveFile}'), 'The composer delegates attachment removal through a callback.');
    assert.ok(messaging.includes('if (file && file.size > 10 * 1024 * 1024)'), 'The parent retains attachment size validation.');
    assert.ok(messaging.includes('filesByConversationRef.current.set(Number(active), file)'), 'The parent retains per-conversation attachment state.');
    assert.ok(messaging.includes('window.URL.createObjectURL(selectedFile)'), 'The parent owns attachment preview URL creation.');
    assert.ok(messaging.includes('window.URL.revokeObjectURL(url)'), 'The parent owns attachment preview URL cleanup.');
    assert.ok(messaging.includes('setSelectedFile(file)'), 'The parent owns selected attachment state.');
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
