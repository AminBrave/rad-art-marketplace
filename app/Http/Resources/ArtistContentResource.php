<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\ArtistContent;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ArtistContent
 */
class ArtistContentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'source' => $this->source,
            'content_type' => $this->content_type,
            'title' => $this->title,
            'description' => $this->description,
            'publication_status' => $this->publication_status,
            'artist_approved_at' => $this->artist_approved_at?->toISOString(),
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
            'artwork' => $this->whenLoaded('artwork', function ($artwork): ?array {
                if (! $artwork) {
                    return null;
                }

                return [
                    'id' => $artwork->id,
                    'slug' => $artwork->slug,
                    'status' => $artwork->status,
                ];
            }),
        ];
    }
}
