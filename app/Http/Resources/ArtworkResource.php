<?php

declare(strict_types=1);

namespace App\Http\Resources;

use App\Models\Artwork;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

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
            'title_en' => $this->title_en,
            'description' => $this->description,
            'description_en' => $this->description_en,
            'city' => $this->city,
            'city_en' => $this->city_en,
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
                'name_en' => $this->category->name_en,
                'slug => $this->category->slug,
            ],
            'artist' => [
                'display_name' => $this->artistProfile->display_name,
                'display_name_en' => $this->artistProfile->display_name_en,
                'city' => $this->artistProfile->city,
                'city_en' => $this->artistProfile->city_en,
                'slug' => $this->artistProfile->slug,
            ],
        ];
    }
}
