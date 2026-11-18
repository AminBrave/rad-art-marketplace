<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Actions\Messaging\ListConversationContexts;
use App\Actions\Messaging\ListConversations;
use App\Actions\Messaging\ListMessages;
use App\Actions\Messaging\RemoveMessage;
use App\Http\Controllers\Controller;
use App\Models\Artwork;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Notifications\MessageReceivedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\Rule;

class ConversationController extends Controller
{
    public function buyerIndex(
        Request $request,
        ListConversations $listConversations,
        ListConversationContexts $listConversationContexts,
    ): JsonResponse {
        return $this->indexFor($request, $request->user(), 'buyer_user_id', $listConversations, $listConversationContexts);
    }

    public function artistIndex(
        Request $request,
        ListConversations $listConversations,
        ListConversationContexts $listConversationContexts,
    ): JsonResponse {
        return $this->indexFor($request, $request->user(), 'artist_user_id', $listConversations, $listConversationContexts);
    }

    public function show(
        Request $request,
        Conversation $conversation,
        ListConversationContexts $listConversationContexts,
    ): JsonResponse {
        $this->authorizeParticipant($request->user(), $conversation, 'view');
        $contexts = $listConversationContexts->handle([(int) $conversation->id]);

        return response()->json([
            'data' => $this->conversationPayload(
                $conversation->load([
                    'buyer',
                    'artist.artistProfile',
                    'latestMessage.sender',
                ]),
                $request->user(),
                $contexts[$conversation->id] ?? [],
            ),
        ]);
    }

    public function messages(
        Request $request,
        Conversation $conversation,
        ListMessages $listMessages,
    ): JsonResponse {
        $this->authorizeParticipant($request->user(), $conversation, 'view');

        $filters = $request->validate([
            'after_id' => ['nullable', 'integer', 'min:0'],
            'before_id' => ['nullable', 'integer', 'min:1'],
            'updated_after' => ['nullable', 'date'],
        ]);
        // Keep a one-second overlap for databases with second-precision timestamps; clients merge by message ID.
        $syncCursor = now()->subSecond();

        $messages = $listMessages->handle($conversation, $filters, $this->messageRelations());
        $messages->setCollection($messages->getCollection()->map(
            fn (Message $message): array => $this->messagePayload($message, $request->user())
        ));

        return response()->json(array_merge($messages->toArray(), [
            'sync_cursor' => $syncCursor->toISOString(),
        ]));
    }

    public function storeMessage(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorizeParticipant($request->user(), $conversation, 'sendMessage');

        $supportsArtworkReferences = Schema::hasColumn('messages', 'artwork_id');
        $validated = $request->validate([
            'body' => ['required', 'string', 'min:1', 'max:5000'],
            'client_message_id' => ['nullable', 'string', 'max:64', 'regex:/^[A-Za-z0-9._:-]+$/'],
            'reply_to_id' => [
                'nullable',
                'integer',
                Rule::exists('messages', 'id')->where('conversation_id', $conversation->id),
            ],
            'artwork_id' => $supportsArtworkReferences
                ? ['nullable', 'integer', Rule::exists('artworks', 'id')->where('status', Artwork::STATUS_APPROVED)]
                : ['nullable', 'integer'],
        ]);

        if (! $supportsArtworkReferences && ! empty($validated['artwork_id'])) {
            abort(503, 'ارجاع اثر تا زمان به‌روزرسانی پایگاه داده در دسترس نیست.');
        }

        if (! empty($validated['artwork_id'])) {
            abort_unless((int) $request->user()->id === (int) $conversation->buyer_user_id, 403);
            $artwork = Artwork::query()->with('artistProfile')->findOrFail($validated['artwork_id']);
            abort_unless((int) $artwork->artistProfile?->user_id === (int) $conversation->artist_user_id, 422, 'این اثر متعلق به هنرمند این گفتگو نیست.');
            abort_unless($artwork->status === Artwork::STATUS_APPROVED, 404);
        }

        $message = DB::transaction(function () use ($conversation, $request, $validated): Message {
            $lockedConversation = Conversation::query()->lockForUpdate()->findOrFail($conversation->id);

            if (! empty($validated['client_message_id'])) {
                $existing = $lockedConversation->messages()
                    ->withTrashed()
                    ->where('sender_user_id', $request->user()->id)
                    ->where('client_message_id', $validated['client_message_id'])
                    ->first();

                if ($existing) {
                    return $existing->load($this->messageRelations());
                }
            }

            $attributes = [
                'sender_user_id' => $request->user()->id,
                'client_message_id' => $validated['client_message_id'] ?? null,
                'body' => trim($validated['body']),
                'reply_to_id' => $validated['reply_to_id'] ?? null,
                'delivered_at' => now(),
            ];
            if (Schema::hasColumn('messages', 'artwork_id')) {
                $attributes['artwork_id'] = $validated['artwork_id'] ?? null;
            }

            $message = $lockedConversation->messages()->create($attributes);

            $lockedConversation->forceFill(['last_message_at' => $message->created_at])->save();

            $recipientId = (int) $request->user()->id === (int) $lockedConversation->buyer_user_id
                ? (int) $lockedConversation->artist_user_id
                : (int) $lockedConversation->buyer_user_id;
            $recipientMutedAt = $recipientId === (int) $lockedConversation->buyer_user_id
                ? $lockedConversation->buyer_muted_at
                : $lockedConversation->artist_muted_at;
            if ($recipientMutedAt === null) {
                User::query()->find($recipientId)?->notify(new MessageReceivedNotification(
                    (int) $lockedConversation->id,
                    (int) $message->id,
                    $request->user()->name,
                ));
            }

            return $message->load($this->messageRelations());
        });

        return response()->json([
            'data' => $this->messagePayload($message, $request->user()),
        ], $message->wasRecentlyCreated ? 201 : 200);
    }

    public function updateMessage(Request $request, Conversation $conversation, Message $message): JsonResponse
    {
        $this->assertOwnMessage($request->user(), $conversation, $message);

        $validated = $request->validate([
            'body' => ['required', 'string', 'min:1', 'max:5000'],
        ]);

        $message->forceFill([
            'body' => trim($validated['body']),
            'edited_at' => now(),
        ])->save();

        return response()->json([
            'data' => $this->messagePayload($message->load($this->messageRelations()), $request->user()),
        ]);
    }

    public function deleteMessage(Request $request, Conversation $conversation, Message $message, RemoveMessage $removeMessage): JsonResponse
    {
        $this->assertOwnMessage($request->user(), $conversation, $message);

        // Retain a minimal tombstone for thread continuity.
        DB::transaction(function () use ($message, $removeMessage): void {
            $removeMessage->handle($message);
        });

        return response()->json([
            'message' => 'پیام حذف شد.',
            'data' => $this->messagePayload($message->load($this->messageRelations()), $request->user()),
        ]);
    }

    public function setReaction(Request $request, Conversation $conversation, Message $message): JsonResponse
    {
        $this->authorizeParticipant($request->user(), $conversation, 'view');
        abort_unless((int) $message->conversation_id === (int) $conversation->id, 404);
        abort_if($message->trashed(), 404);

        $validated = $request->validate([
            'emoji' => ['required', 'string', Rule::in(['👍', '❤️', '😂', '😮', '🙏', '🎨'])],
            'action' => ['required', Rule::in(['add', 'remove'])],
        ]);

        $reaction = $message->reactions()
            ->where('user_id', $request->user()->id)
            ->where('emoji', $validated['emoji']);

        if ($validated['action'] === 'add') {
            $reaction->firstOrCreate([
                'user_id' => $request->user()->id,
                'emoji' => $validated['emoji'],
            ]);
        } else {
            $reaction->delete();
        }

        return response()->json([
            'data' => $this->messagePayload($message->load(['sender', 'replyTo.sender', 'reactions', 'attachments']), $request->user()),
        ]);
    }

    public function updateSettings(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();
        $this->authorizeParticipant($user, $conversation, 'update');
        $validated = $request->validate([
            'archived' => ['sometimes', 'boolean'],
            'muted' => ['sometimes', 'boolean'],
        ]);

        $fields = [];
        if (array_key_exists('archived', $validated)) {
            $fields[(int) $user->id === (int) $conversation->buyer_user_id ? 'buyer_archived_at' : 'artist_archived_at'] =
                $validated['archived'] ? now() : null;
        }
        if (array_key_exists('muted', $validated)) {
            $fields[(int) $user->id === (int) $conversation->buyer_user_id ? 'buyer_muted_at' : 'artist_muted_at'] =
                $validated['muted'] ? now() : null;
        }
        if ($fields !== []) {
            $conversation->forceFill($fields)->save();
        }

        return response()->json([
            'data' => [
                'archived' => $conversation->fresh()->archivedAtFor($user) !== null,
                'muted' => ((int) $user->id === (int) $conversation->buyer_user_id
                    ? $conversation->fresh()->buyer_muted_at
                    : $conversation->fresh()->artist_muted_at) !== null,
            ],
        ]);
    }

    public function markRead(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorizeParticipant($request->user(), $conversation, 'update');

        $updated = $conversation->messages()
            ->where('sender_user_id', '!=', $request->user()->id)
            ->whereNull('read_at')
            ->update(['read_at' => now(), 'updated_at' => now()]);

        return response()->json([
            'message' => 'وضعیت خواندن گفتگو به‌روزرسانی شد.',
            'data' => ['updated_messages' => $updated],
        ]);
    }

    /**
     * Keep ordinary direct messaging available while an older deployment is
     * waiting for the nullable artwork reference migration.
     *
     * @return array<int, string>
     */
    private function messageRelations(): array
    {
        $relations = ['sender', 'replyTo.sender', 'reactions', 'attachments'];

        if (Schema::hasColumn('messages', 'artwork_id')) {
            $relations[] = 'artwork.category';
            $relations[] = 'artwork.artistProfile';
        }

        return $relations;
    }

    private function authorizeParticipant(User $user, Conversation $conversation, string $ability): void
    {
        abort_unless($user->can($ability, $conversation), 404);
    }

    private function assertOwnMessage(User $user, Conversation $conversation, Message $message): void
    {
        $this->authorizeParticipant($user, $conversation, 'view');
        abort_unless((int) $message->conversation_id === (int) $conversation->id, 404);
        abort_unless((int) $message->sender_user_id === (int) $user->id, 404);
        abort_if($message->trashed(), 404);
    }

    private function indexFor(
        Request $request,
        User $user,
        string $participantColumn,
        ListConversations $listConversations,
        ListConversationContexts $listConversationContexts,
    ): JsonResponse {
        $filters = $request->validate([
            'search' => ['nullable', 'string', 'max:100'],
            'filter' => ['nullable', 'string', Rule::in(['all', 'unread', 'archived'])],
        ]);

        $conversations = $listConversations->handle(
            $user,
            $participantColumn,
            trim((string) ($filters['search'] ?? '')),
            $filters['filter'] ?? 'all',
        );
        $contexts = $listConversationContexts->handle(
            $conversations->getCollection()->pluck('id')->map(fn ($id): int => (int) $id)->all(),
        );
        $conversations->setCollection($conversations->getCollection()->map(
            fn (Conversation $conversation): array => $this->conversationPayload(
                $conversation,
                $user,
                $contexts[$conversation->id] ?? [],
            )
        ));

        return response()->json($conversations);
    }

    /**
     * @return array<string, mixed>
     */
    private function conversationPayload(
        Conversation $conversation,
        User $viewer,
        array $contexts = [],
    ): array {
        $other = (int) $conversation->buyer_user_id === (int) $viewer->id
            ? $conversation->artist
            : $conversation->buyer;

        return [
            'id' => $conversation->id,
            'participant' => ['name' => $other?->name],
            'contexts' => $contexts,
            'artist' => [
                'display_name' => $conversation->artist?->artistProfile?->display_name,
                'slug' => $conversation->artist?->artistProfile?->slug,
            ],
            'last_message' => $conversation->latestMessage
                ? $this->messagePayload($conversation->latestMessage, $viewer)
                : null,
            'last_message_at' => $conversation->last_message_at?->toISOString(),
            'unread_count' => (int) ($conversation->unread_count ?? 0),
            'archived' => $conversation->archivedAtFor($viewer) !== null,
            'muted' => ((int) $viewer->id === (int) $conversation->buyer_user_id
                ? $conversation->buyer_muted_at
                : $conversation->artist_muted_at) !== null,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function messagePayload(Message $message, ?User $viewer = null): array
    {
        $reactions = $message->relationLoaded('reactions') ? $message->reactions : collect();
        $attachments = $message->relationLoaded('attachments') ? $message->attachments : $message->attachments()->get();
        $reactionSummary = $reactions->groupBy('emoji')->map(
            fn ($items, string $emoji): array => [
                'emoji' => $emoji,
                'count' => $items->count(),
                'reacted_by_me' => $viewer !== null && $items->contains(
                    fn ($reaction): bool => (int) $reaction->user_id === (int) $viewer->id
                ),
            ]
        )->values()->all();

        $artwork = $message->relationLoaded('artwork') ? $message->getRelation('artwork') : null;

        return [
            'id' => $message->id,
            'sender_id' => $message->sender_user_id,
            'sender_name' => $message->sender?->name,
            'body' => $message->trashed() ? null : $message->body,
            'artwork' => $artwork ? [
                'id' => $artwork->id,
                'title' => $artwork->title,
                'slug' => $artwork->slug,
                'image_url' => '/api/v1/artworks/'.$artwork->slug.'/image',
                'category' => $artwork->category?->name,
                'medium' => $artwork->medium,
                'dimensions' => $artwork->dimensions,
                'year' => $artwork->year,
                'price' => $artwork->price,
                'artist_name' => $artwork->artistProfile?->display_name,
            ] : null,
            'reply_to' => $message->replyTo ? [
                'id' => $message->replyTo->id,
                'sender_name' => $message->replyTo->sender?->name,
                'body' => $message->replyTo->trashed() ? null : $message->replyTo->body,
            ] : null,
            'reactions' => $reactionSummary,
            'attachments' => $attachments->map(fn ($attachment): array => [
                'id' => $attachment->id,
                'name' => $attachment->original_name,
                'mime_type' => $attachment->mime_type,
                'size_bytes' => $attachment->size_bytes,
                'download_url' => '/api/v1/conversations/'.$message->conversation_id.'/messages/'.$message->id.'/attachments/'.$attachment->id,
                'preview_url' => str_starts_with((string) $attachment->mime_type, 'image/')
                    ? '/api/v1/conversations/'.$message->conversation_id.'/messages/'.$message->id.'/attachments/'.$attachment->id.'/preview'
                    : null,
            ])->values()->all(),
            'delivered_at' => $message->delivered_at?->toISOString(),
            'read_at' => $message->read_at?->toISOString(),
            'edited_at' => $message->edited_at?->toISOString(),
            'deleted_at' => $message->deleted_at?->toISOString(),
            'created_at' => $message->created_at?->toISOString(),
        ];
    }
}
