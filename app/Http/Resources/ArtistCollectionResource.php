<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ArtistCollection;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ArtistCollection
 */
class ArtistCollectionResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'slug' => $this->slug,
            'description' => $this->description,
            'visibility' => $this->visibility,
            'position' => $this->position,
            'published_at' => $this->published_at?->toISOString(),
            'items_count' => $this->whenCounted('contents'),
            'items' => $this->whenLoaded('contents', fn ($contents) => $contents
                ->map(fn ($content): array => [
                    'id' => $content->id,
                    'content_type' => $content->content_type,
                    'title' => $content->title,
                    'publication_status' => $content->publication_status,
                ])
                ->values()),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];
    }
}
