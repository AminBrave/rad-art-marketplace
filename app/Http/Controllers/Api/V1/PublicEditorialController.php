<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Artwork;
use App\Models\CuratedCollection;
use App\Models\FeaturedArtistSelection;
use Illuminate\Http\JsonResponse;

class PublicEditorialController extends Controller
{
    public function collections(): JsonResponse
    {
        $items = CuratedCollection::query()
            ->where('status', 'published')->whereNotNull('published_at')->where('published_at', '<=', now())
            ->with(['artworks' => fn ($query) => $this->publicArtworkQuery($query)])
            ->orderBy('position')->orderByDesc('published_at')->orderBy('id')
            ->paginate(12)
            ->through(fn (CuratedCollection $collection) => $this->collectionPayload($collection, false));

        return response()->json($items);
    }

    public function collection(CuratedCollection $collection): JsonResponse
    {
        abort_unless($collection->isPublished(), 404);
        $collection->load(['artworks' => fn ($query) => $this->publicArtworkQuery($query)]);

        return response()->json(['data' => $this->collectionPayload($collection, true)]);
    }

    public function featuredArtists(): JsonResponse
    {
        $items = FeaturedArtistSelection::query()
            ->where('is_published', true)
            ->where(fn ($query) => $query->whereNull('starts_at')->orWhere('starts_at', '<=', now()))
            ->where(fn ($query) => $query->whereNull('ends_at')->orWhere('ends_at', '>=', now()))
            ->whereHas('artistProfile', fn ($query) => $query->where('is_public', true))
            ->with('artistProfile')
            ->orderBy('position')->orderBy('id')
            ->get()
            ->map(fn (FeaturedArtistSelection $selection) => [
                'id' => $selection->id,
                'editorial_intro' => $selection->editorial_intro,
                'position' => $selection->position,
                'artist' => [
                    'slug' => $selection->artistProfile->slug,
                    'display_name' => $selection->artistProfile->display_name,
                    'bio' => $selection->artistProfile->bio,
                    'city' => $selection->artistProfile->city,
                ],
            ]);

        return response()->json(['data' => $items]);
    }

    private function publicArtworkQuery($query)
    {
        return $query->publiclyVisible()
            ->with(['category', 'artistProfile']);
    }

    private function collectionPayload(CuratedCollection $collection, bool $includeItems): array
    {
        $payload = ['id' => $collection->id, 'slug' => $collection->slug, 'title' => $collection->title, 'intro' => $collection->intro, 'published_at' => $collection->published_at?->toISOString(), 'artwork_count' => $collection->artworks->count()];
        if ($includeItems) {
            $payload['artworks'] = $collection->artworks->map(fn (Artwork $artwork) => $this->artworkPayload($artwork))->values();
        }

        return $payload;
    }

    private function artworkPayload(Artwork $artwork): array
    {
        return [
            'id' => $artwork->id, 'slug' => $artwork->slug, 'title' => $artwork->title,
            'description' => $artwork->description, 'medium' => $artwork->medium, 'year' => $artwork->year,
            'price' => $artwork->price, 'availability' => $artwork->availability,
            'image_url' => route('api.v1.artworks.image', $artwork->slug),
            'category' => ['name' => $artwork->category->name, 'slug' => $artwork->category->slug],
            'artist' => ['display_name' => $artwork->artistProfile->display_name, 'slug' => $artwork->artistProfile->slug],
        ];
    }
}
