<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Artwork;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Http\Request;

/**
 * @mixin Artwork
 */
class ArtworkResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $this->resource->loadMissing(['category', 'artistProfile']);

        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'title' => $this->title,
            'description' => $this->description,
            'medium' => $this->medium,
            'dimensions' => $this->dimensions,
            'year' => $this->year,
            'price' => $this->price,
            'availability' => $this->availability,
            'status' => $this->status,
            'rejection_note' => $this->rejection_note,
            'image_url' => route('api.v1.artworks.image', $this->slug),
            'category' => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
            ],
            'artist' => [
                'display_name' => $this->artistProfile->display_name,
                'slug' => $this->artistProfile->slug,
            ],
        ];
    }
}
