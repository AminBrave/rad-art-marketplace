<?php

declare(strict_types=1);

namespace App\\Actions\\Messaging;

use App\\Models\\Conversation;
use App\\Models\\User;
use Illuminate\\Contracts\\Pagination\\LengthAwarePaginator;

class ListConversations
{
    public function handle(User $viewer, string $participantColumn, string $search, string $filter): LengthAwarePaginator
    {
        if (! in_array($participantColumn, ['buyer_user_id', 'artist_user_id'], true)) {
            throw new \\InvalidArgumentException('Unsupported conversation participant column.');
        }

        $archivedColumn = $participantColumn === 'buyer_user_id' ? 'buyer_archived_at' : 'artist_archived_at';

        $query = Conversation::query()
            ->where($participantColumn, $viewer->id)
            ->with(['buyer', 'artist.artistProfile', 'latestMessage.sender', 'latestMessage.attachments'])
            ->withCount([
                'messages as unread_count' => fn ($messages) => $messages
                    ->where('sender_user_id', '!=', $viewer->id)
                    ->whereNull('read_at'),
            ]);

        if ($filter === 'archived') {
            $query->whereNotNull($archivedColumn);
        } else {
            $query->whereNull($archivedColumn);
        }

        if ($filter === 'unread') {
            $query->whereHas('messages', fn ($messages) => $messages
                ->where('sender_user_id', '!=', $viewer->id)
                ->whereNull('read_at'));
        }

        if ($search !== '') {
            $query->where(function ($nested) use ($search): void {
                $nested->whereHas('buyer', fn ($buyer) => $buyer->where('name', 'like', '%'.$search.'%'))
                    ->orWhereHas('artist', fn ($artist) => $artist->where('name', 'like', '%'.$search.'%'))
                    ->orWhereHas('messages', fn ($messages) => $messages->where('body', 'like', '%'.$search.'%'));
            });
        }

        return $query->orderByDesc('last_message_at')->paginate(20);
    }
}
