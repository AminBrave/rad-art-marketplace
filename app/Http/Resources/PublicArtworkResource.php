<?php

declare(strict_types=1);

namespace App\Http\Resources;

use Illuminate\Http\Request;

class PublicArtworkResource extends ArtworkResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = parent::toArray($request);
        unset($data['status'], $data['rejection_note']);
        $data['likes_count'] = (int) ($this->resource->likes_count ?? 0);
        $data['comments_count'] = (int) ($this->resource->comments_count ?? 0);
        $data['liked_by_me'] = (bool) ($this->resource->liked_by_me ?? false);

        return $data;
    }
}
