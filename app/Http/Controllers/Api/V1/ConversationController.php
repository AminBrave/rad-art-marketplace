<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ArtistInquiry;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ConversationController extends Controller
{
    public function buyerIndex(Request $request): JsonResponse
    {
        return $this->indexFor($request->user(), 'buyer_user_id');
    }

    public function artistIndex(Request $request): JsonResponse
    {
        return $this->indexFor($request->user(), 'artist_user_id');
    }

    public function startFromInquiry(Request $request, ArtistInquiry $inquiry): JsonResponse
    {
        $user = $request->user();
        $artistUserId = (int) $inquiry->artistProfile()->value('user_id');

        abort_unless(
            (int) $inquiry->sender_user_id === (int) $user->id
                || $artistUserId === (int) $user->id,
            404
        );
        abort_unless(in_array($user->role, [User::ROLE_BUYER, User::ROLE_ARTIST], true), 403);

        $conversation = DB::transaction(function () use ($inquiry, $artistUserId): Conversation {
            $conversation = Conversation::query()->firstOrCreate(
                ['pair_key' => $inquiry->sender_user_id.':'.$artistUserId],
                [
                    'inquiry_id' => $inquiry->id,
                    'pair_key' => $inquiry->sender_user_id.':'.$artistUserId,
                    'buyer_user_id' => $inquiry->sender_user_id,
                    'artist_user_id' => $artistUserId,
                    'last_message_at' => $inquiry->created_at ?? now(),
                ],
            );

            DB::table('conversation_contexts')->updateOrInsert([
                'conversation_id' => $conversation->id,
                'inquiry_id' => $inquiry->id,
                'artwork_id' => $inquiry->artwork_id,
            ], ['added_by_user_id' => $inquiry->sender_user_id, 'created_at' => now(), 'updated_at' => now()]);

            $conversation->messages()->firstOrCreate(
                [
                    'sender_user_id' => $inquiry->sender_user_id,
                    'client_message_id' => 'inquiry-'.$inquiry->id,
                ],
                [
                    'body' => $inquiry->message,
                    'delivered_at' => $inquiry->created_at ?? now(),
                    'created_at' => $inquiry->created_at ?? now(),
                    'updated_at' => $inquiry->created_at ?? now(),
                ],
            );

            return $conversation;
        });

        $this->authorizeParticipant($user, $conversation, 'view');

        return response()->json([
            'data' => $this->conversationPayload($conversation->load([
                'inquiry.artistProfile',
                'inquiry.artwork',
                'buyer',
                'artist.artistProfile',
                'latestMessage.sender',
            ]), $user),
        ]);
    }

    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorizeParticipant($request->user(), $conversation, 'view');

        return response()->json([
            'data' => $this->conversationPayload($conversation->load([
                'inquiry.artistProfile',
                'inquiry.artwork',
                'buyer',
                'artist',
                'latestMessage.sender',
            ]), $request->user()),
        ]);
    }

    public function messages(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorizeParticipant($request->user(), $conversation, 'view');

        $messages = $conversation->messages()
            ->with(['sender', 'replyTo.sender'])
            ->latest('id')
            ->paginate(30);

        $messages->setCollection($messages->getCollection()->reverse()->values()->map(
            fn (Message $message): array => $this->messagePayload($message)
        ));

        return response()->json($messages);
    }

    public function storeMessage(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorizeParticipant($request->user(), $conversation, 'sendMessage');

        $validated = $request->validate([
            'body' => ['required', 'string', 'min:1', 'max:5000'],
            'client_message_id' => ['nullable', 'string', 'max:64', 'regex:/^[A-Za-z0-9._:-]+$/'],
            'reply_to_id' => [
                'nullable',
                'integer',
                Rule::exists('messages', 'id')->where('conversation_id', $conversation->id),
            ],
        ]);

        $message = DB::transaction(function () use ($conversation, $request, $validated): Message {
            $lockedConversation = Conversation::query()->lockForUpdate()->findOrFail($conversation->id);

            if (! empty($validated['client_message_id'])) {
                $existing = $lockedConversation->messages()
                    ->where('sender_user_id', $request->user()->id)
                    ->where('client_message_id', $validated['client_message_id'])
                    ->first();

                if ($existing) {
                    return $existing->load(['sender', 'replyTo.sender']);
                }
            }

            $message = $lockedConversation->messages()->create([
                'sender_user_id' => $request->user()->id,
                'client_message_id' => $validated['client_message_id'] ?? null,
                'body' => trim($validated['body']),
                'reply_to_id' => $validated['reply_to_id'] ?? null,
                'delivered_at' => now(),
            ]);

            $lockedConversation->forceFill(['last_message_at' => $message->created_at])->save();

            return $message->load(['sender', 'replyTo.sender']);
        });

        return response()->json([
            'data' => $this->messagePayload($message),
        ], $message->wasRecentlyCreated ? 201 : 200);
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

    private function authorizeParticipant(User $user, Conversation $conversation, string $ability): void
    {
        abort_unless($user->can($ability, $conversation), 404);
    }

    private function indexFor(User $user, string $participantColumn): JsonResponse
    {
        $conversations = Conversation::query()
            ->where($participantColumn, $user->id)
            ->with(['inquiry.artistProfile', 'inquiry.artwork', 'buyer', 'artist.artistProfile', 'latestMessage.sender'])
            ->withCount([
                'messages as unread_count' => fn ($query) => $query
                    ->where('sender_user_id', '!=', $user->id)
                    ->whereNull('read_at'),
            ])
            ->orderByDesc('last_message_at')
            ->paginate(20)
            ->through(fn (Conversation $conversation): array => $this->conversationPayload($conversation, $user));

        return response()->json($conversations);
    }

    /**
     * @return array<string, mixed>
     */
    private function conversationPayload(Conversation $conversation, User $viewer): array
    {
        $other = (int) $conversation->buyer_user_id === (int) $viewer->id
            ? $conversation->artist
            : $conversation->buyer;

        return [
            'id' => $conversation->id,
            'inquiry_id' => $conversation->inquiry_id,
            'subject' => $conversation->inquiry?->subject,
            'participant' => ['name' => $other?->name],
            'artist' => [
                'display_name' => $conversation->inquiry?->artistProfile?->display_name ?? $conversation->artist?->artistProfile?->display_name,
                'slug' => $conversation->inquiry?->artistProfile?->slug ?? $conversation->artist?->artistProfile?->slug,
            ],
            'artwork' => $conversation->inquiry?->artwork ? [
                'title' => $conversation->inquiry->artwork->title,
                'slug' => $conversation->inquiry->artwork->slug,
            ] : null,
            'last_message' => $conversation->latestMessage
                ? $this->messagePayload($conversation->latestMessage)
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
    private function messagePayload(Message $message): array
    {
        return [
            'id' => $message->id,
            'sender_id' => $message->sender_user_id,
            'sender_name' => $message->sender?->name,
            'body' => $message->trashed() ? null : $message->body,
            'reply_to' => $message->replyTo ? [
                'id' => $message->replyTo->id,
                'sender_name' => $message->replyTo->sender?->name,
                'body' => $message->replyTo->trashed() ? null : $message->replyTo->body,
            ] : null,
            'delivered_at' => $message->delivered_at?->toISOString(),
            'read_at' => $message->read_at?->toISOString(),
            'edited_at' => $message->edited_at?->toISOString(),
            'deleted_at' => $message->deleted_at?->toISOString(),
            'created_at' => $message->created_at?->toISOString(),
        ];
    }
}
