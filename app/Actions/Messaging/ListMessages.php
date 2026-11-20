<?php

declare(strict_types=1);

namespace App\Actions\Messaging;

use App\Models\Conversation;
use Illuminate\Pagination\AbstractPaginator;
use Illuminate\Support\Carbon;

class ListMessages
{
    /**
     * Build the requested message-history page without owning authorization,
     * request validation, relation compatibility, or response serialization.
     *
     * @param  array{after_id?: int|string|null, before_id?: int|string|null, updated_after?: string|null}  $filters
     * @param  array<int, string>  $relations
     */
    public function handle(
        Conversation $conversation,
        array $filters,
        array $relations,
    ): AbstractPaginator {
        $query = $conversation->messages()
            ->withTrashed()
            ->with($relations);

        if (isset($filters['before_id'])) {
            // Keyset pagination keeps older history stable while new messages arrive.
            $messages = $query->where('id', '<', (int) $filters['before_id'])
                ->latest('id')
                ->paginate(30);
            $messages->setCollection($messages->getCollection()->reverse()->values());

            return $messages;
        }

        if (isset($filters['after_id']) || isset($filters['updated_after'])) {
            // Normalize ISO cursors to the database timestamp format (notably SQLite stores
            // timestamps with a space separator, so comparing against an ISO "T" string
            // lexically can silently omit every updated message).
            $updatedAfter = isset($filters['updated_after'])
                ? Carbon::parse($filters['updated_after'])->toDateTimeString()
                : null;

            // Include new messages and changed existing messages (e.g. edits, deletes and read receipts).
            // Polling only needs a next-page signal; a total count adds an unnecessary COUNT(*) query.
            return $query->where(function ($nested) use ($filters, $updatedAfter): void {
                if (isset($filters['after_id'])) {
                    $nested->where('id', '>', (int) $filters['after_id']);
                }
                if ($updatedAfter !== null) {
                    $method = isset($filters['after_id']) ? 'orWhere' : 'where';
                    $nested->{$method}('updated_at', '>=', $updatedAfter);
                }
            })->oldest('id')->simplePaginate(100);
        }

        $messages = $query->latest('id')->paginate(30);
        $messages->setCollection($messages->getCollection()->reverse()->values());

        return $messages;
    }
}
