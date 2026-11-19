<?php

declare(strict_types=1);

namespace App\Actions\Messaging;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Notifications\MessageReceivedNotification;
use Illuminate\Support\Facades\DB;

class SendMessage
{
    /**
     * Persist one message and its conversation/notification side effects atomically.
     *
     * The caller owns participant authorization, request validation, artwork ownership
     * checks, schema compatibility detection, and response serialization.
     *
     * @param  array{body: string, client_message_id?: string|null, reply_to_id?: int|string|null, artwork_id?: int|string|null}  $attributes
     * @param  array<int, string>  $relations
     */
    public function handle(
        Conversation $conversation,
        User $sender,
        array $attributes,
        bool $supportsArtworkReferences,
        array $relations,
    ): Message {
        return DB::transaction(function () use (
            $conversation,
            $sender,
            $attributes,
            $supportsArtworkReferences,
            $relations,
        ): Message {
            $lockedConversation = Conversation::query()->lockForUpdate()->findOrFail($conversation->id);

            if (! empty($attributes['client_message_id'])) {
                $existing = $lockedConversation->messages()
                    ->withTrashed()
                    ->where('sender_user_id', $sender->id)
                    ->where('client_message_id', $attributes['client_message_id'])
                    ->first();

                if ($existing) {
                    return $existing->load($relations);
                }
            }

            $messageAttributes = [
                'sender_user_id' => $sender->id,
                'client_message_id' => $attributes['client_message_id'] ?? null,
                'body' => trim($attributes['body']),
                'reply_to_id' => $attributes['reply_to_id'] ?? null,
                'delivered_at' => now(),
            ];

            if ($supportsArtworkReferences) {
                $messageAttributes['artwork_id'] = $attributes['artwork_id'] ?? null;
            }

            $message = $lockedConversation->messages()->create($messageAttributes);

            $lockedConversation->forceFill(['last_message_at' => $message->created_at])->save();

            $recipientId = (int) $sender->id === (int) $lockedConversation->buyer_user_id
                ? (int) $lockedConversation->artist_user_id
                : (int) $lockedConversation->buyer_user_id;
            $recipientMutedAt = $recipientId === (int) $lockedConversation->buyer_user_id
                ? $lockedConversation->buyer_muted_at
                : $lockedConversation->artist_muted_at;

            if ($recipientMutedAt === null) {
                User::query()->find($recipientId)?->notify(new MessageReceivedNotification(
                    (int) $lockedConversation->id,
                    (int) $message->id,
                    $sender->name,
                ));
            }

            return $message->load($relations);
        });
    }
}
