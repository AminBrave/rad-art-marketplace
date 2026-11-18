<?php

declare(strict_types=1);

namespace App\\Actions\\Messaging;

use App\\Models\\Artwork;
use Illuminate\\Support\\Facades\\DB;

class ListConversationContexts
{
    /**
     * Load every context for the supplied conversations and hydrate artwork data in batches.
     *
     * @param  array<int, int>  $conversationIds
     * @return array<int, array<int, array{artwork: ?array}>>
     */
    public function handle(array $conversationIds): array
    {
        $conversationIds = array_values(array_unique(array_map('intval', $conversationIds)));

        if ($conversationIds === []) {
            return [];
        }

        $contexts = DB::table('conversation_contexts')
            ->whereIn('conversation_id', $conversationIds)
            ->get();

        $artworkIds = $contexts->pluck('artwork_id')->filter()->unique()->values()->all();

        $artworks = $artworkIds === []
            ? collect()
            : DB::table('artworks')->whereIn('id', $artworkIds)->get()->keyBy('id');

        $records = $artworkIds === []
            ? collect()
            : Artwork::query()->with(['category', 'artistProfile'])
                ->whereIn('id', $artworkIds)
                ->get()
                ->keyBy('id');

        $result = [];

        foreach ($contexts as $context) {
            $rawArtwork = $context->artwork_id ? $artworks->get($context->artwork_id) : null;
            $record = $context->artwork_id ? $records->get($context->artwork_id) : null;

            $result[$context->conversation_id][] = [
                'artwork' => $rawArtwork ? [
                    'id' => $record?->id,
                    'title' => $record?->title ?? $rawArtwork->title,
                    'slug' => $record?->slug ?? $rawArtwork->slug,
                    'image_url' => $record?->slug ? '/api/v1/artworks/'.$record->slug.'/image' : null,
                    'category' => $record?->category?->name,
                    'medium' => $record?->medium,
                    'dimensions' => $record?->dimensions,
                    'year' => $record?->year,
                    'price' => $record?->price,
                    'artist_name' => $record?->artistProfile?->display_name,
                ] : null,
            ];
        }

        return $result;
    }
}
