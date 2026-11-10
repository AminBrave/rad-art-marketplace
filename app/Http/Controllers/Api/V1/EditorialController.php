<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Artwork;
use App\Models\ArtistProfile;
use App\Models\CuratedCollection;
use App\Models\EditorialAudit;
use App\Models\FeaturedArtistSelection;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class EditorialController extends Controller
{
    public function collections(): JsonResponse
    {
        $items = CuratedCollection::query()
            ->where('status', 'published')->whereNotNull('published_at')->where('published_at', '<=', now())
            ->with(['artworks' => fn (Builder $query) => $this->publicArtworkQuery($query)])
            ->orderBy('position')->orderByDesc('published_at')->orderBy('id')
            ->paginate(12)
            ->through(fn (CuratedCollection $collection) => $this->collectionPayload($collection, false));

        return response()->json($items);
    }

    public function collection(CuratedCollection $collection): JsonResponse
    {
        abort_unless($collection->isPublished(), 404);
        $collection->load(['artworks' => fn (Builder $query) => $this->publicArtworkQuery($query)]);

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

    public function adminCollections(): JsonResponse
    {
        $items = CuratedCollection::query()->withCount('artworks')->orderBy('position')->orderByDesc('updated_at')->paginate(20);

        return response()->json($items);
    }

    public function options(): JsonResponse
    {
        $artworks = Artwork::query()->where('status', Artwork::STATUS_APPROVED)
            ->whereHas('artistProfile', fn ($query) => $query->where('is_public', true))
            ->with('artistProfile')->orderBy('title')->limit(200)->get()
            ->map(fn (Artwork $artwork) => ['id' => $artwork->id, 'title' => $artwork->title, 'artist' => $artwork->artistProfile->display_name]);

        $artists = ArtistProfile::query()->where('is_public', true)->orderBy('display_name')->limit(200)->get(['id', 'display_name', 'slug']);

        return response()->json(['data' => ['artworks' => $artworks, 'artists' => $artists]]);
    }

    public function storeCollection(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'intro' => ['nullable', 'string', 'max:2000'],
            'artwork_ids' => ['sometimes', 'array', 'max:30'],
            'artwork_ids.*' => ['integer', 'distinct', 'exists:artworks,id'],
            'publish' => ['sometimes', 'boolean'],
        ]);
        $this->assertPublicArtworks($validated['artwork_ids'] ?? []);
        $slug = Str::slug($validated['title']) ?: 'collection';
        $slug .= '-'.Str::lower(Str::random(8));

        $collection = DB::transaction(function () use ($validated, $request, $slug): CuratedCollection {
            $collection = CuratedCollection::create([
                'slug' => $slug, 'title' => $validated['title'], 'intro' => $validated['intro'] ?? null,
                'status' => ($validated['publish'] ?? false) ? 'published' : 'draft',
                'position' => (int) CuratedCollection::max('position') + 1,
                'published_at' => ($validated['publish'] ?? false) ? now() : null,
                'created_by' => $request->user()->id, 'updated_by' => $request->user()->id,
            ]);
            $this->syncCollectionItems($collection, $validated['artwork_ids'] ?? []);
            $this->audit($request, 'collection.created', $collection, ['status' => $collection->status, 'items' => count($validated['artwork_ids'] ?? [])]);

            return $collection;
        });

        return response()->json(['message' => 'مجموعه ایجاد شد.', 'data' => $this->adminCollectionPayload($collection->load('artworks'))], 201);
    }

    public function updateCollection(Request $request, CuratedCollection $collection): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:160'],
            'intro' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'artwork_ids' => ['sometimes', 'array', 'max:30'],
            'artwork_ids.*' => ['integer', 'distinct', 'exists:artworks,id'],
        ]);
        if (array_key_exists('artwork_ids', $validated)) $this->assertPublicArtworks($validated['artwork_ids']);

        DB::transaction(function () use ($request, $collection, $validated): void {
            $collection->fill(array_intersect_key($validated, array_flip(['title', 'intro'])));
            $collection->updated_by = $request->user()->id;
            $collection->save();
            if (array_key_exists('artwork_ids', $validated)) $this->syncCollectionItems($collection, $validated['artwork_ids']);
            $this->audit($request, 'collection.updated', $collection, ['fields' => array_keys($validated)]);
        });

        return response()->json(['message' => 'مجموعه به‌روزرسانی شد.', 'data' => $this->adminCollectionPayload($collection->fresh()->load('artworks'))]);
    }

    public function setCollectionPublication(Request $request, CuratedCollection $collection): JsonResponse
    {
        $validated = $request->validate(['publish' => ['required', 'boolean']]);
        $publish = $validated['publish'];
        $collection->update([
            'status' => $publish ? 'published' : 'draft',
            'published_at' => $publish ? now() : null,
            'updated_by' => $request->user()->id,
        ]);
        $this->audit($request, $publish ? 'collection.published' : 'collection.unpublished', $collection);

        return response()->json(['message' => $publish ? 'مجموعه منتشر شد.' : 'انتشار مجموعه متوقف شد.', 'data' => $this->adminCollectionPayload($collection->fresh()->load('artworks'))]);
    }

    public function reorderCollections(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'collection_ids' => ['required', 'array', 'max:100'],
            'collection_ids.*' => ['integer', 'distinct', 'exists:curated_collections,id'],
        ]);
        DB::transaction(function () use ($validated, $request): void {
            foreach ($validated['collection_ids'] as $position => $id) {
                CuratedCollection::whereKey($id)->update(['position' => $position, 'updated_by' => $request->user()->id, 'updated_at' => now()]);
                EditorialAudit::create(['actor_id' => $request->user()->id, 'action' => 'collection.reordered', 'subject_type' => 'collection', 'subject_id' => $id, 'metadata' => ['position' => $position]]);
            }
        });

        return response()->json(['message' => 'ترتیب مجموعه‌ها ثبت شد.']);
    }

    public function adminFeaturedArtists(): JsonResponse
    {
        $items = FeaturedArtistSelection::query()->with('artistProfile')->orderBy('position')->orderBy('id')->get()
            ->map(fn (FeaturedArtistSelection $selection) => [
                'id' => $selection->id,
                'artist_profile_id' => $selection->artist_profile_id,
                'editorial_intro' => $selection->editorial_intro,
                'starts_at' => $selection->starts_at?->toISOString(),
                'ends_at' => $selection->ends_at?->toISOString(),
                'is_published' => $selection->is_published,
                'artist' => ['display_name' => $selection->artistProfile->display_name, 'slug' => $selection->artistProfile->slug],
            ]);

        return response()->json(['data' => $items]);
    }

    public function saveFeaturedArtists(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'selections' => ['present', 'array', 'max:30'],
            'selections.*.artist_profile_id' => ['required', 'integer', 'distinct', 'exists:artist_profiles,id'],
            'selections.*.editorial_intro' => ['nullable', 'string', 'max:500'],
            'selections.*.starts_at' => ['nullable', 'date'],
            'selections.*.ends_at' => ['nullable', 'date', 'after_or_equal:selections.*.starts_at'],
        ]);
        $ids = collect($validated['selections'])->pluck('artist_profile_id')->all();
        abort_if(ArtistProfile::query()->whereIn('id', $ids)->where('is_public', true)->count() !== count($ids), 422, 'فقط پروفایل‌های عمومی قابل انتخاب‌اند.');

        DB::transaction(function () use ($validated, $request): void {
            FeaturedArtistSelection::query()->delete();
            foreach ($validated['selections'] as $position => $item) {
                $selection = FeaturedArtistSelection::create([
                    ...$item, 'position' => $position, 'is_published' => true,
                    'created_by' => $request->user()->id, 'updated_by' => $request->user()->id,
                ]);
                $this->audit($request, 'featured_artist.saved', $selection, ['position' => $position]);
            }
        });

        return response()->json(['message' => 'انتخاب هنرمندان ویژه ذخیره شد.']);
    }

    private function publicArtworkQuery(Builder $query): Builder
    {
        return $query->where('artworks.status', Artwork::STATUS_APPROVED)
            ->whereHas('artistProfile', fn ($artist) => $artist->where('is_public', true))
            ->with(['category', 'artistProfile']);
    }

    private function assertPublicArtworks(array $ids): void
    {
        if ($ids === []) return;
        $count = Artwork::query()->whereIn('id', $ids)->where('status', Artwork::STATUS_APPROVED)
            ->whereHas('artistProfile', fn ($artist) => $artist->where('is_public', true))->count();
        abort_if($count !== count($ids), 422, 'مجموعه فقط می‌تواند شامل آثار تأییدشده از هنرمندان عمومی باشد.');
    }

    private function syncCollectionItems(CuratedCollection $collection, array $ids): void
    {
        $sync = [];
        foreach (array_values($ids) as $position => $id) $sync[$id] = ['position' => $position];
        $collection->artworks()->sync($sync);
    }

    private function collectionPayload(CuratedCollection $collection, bool $includeItems): array
    {
        $payload = ['id' => $collection->id, 'slug' => $collection->slug, 'title' => $collection->title, 'intro' => $collection->intro, 'published_at' => $collection->published_at?->toISOString(), 'artwork_count' => $collection->artworks->count()];
        if ($includeItems) $payload['artworks'] = $collection->artworks->map(fn (Artwork $artwork) => $this->artworkPayload($artwork))->values();

        return $payload;
    }

    private function adminCollectionPayload(CuratedCollection $collection): array
    {
        return [
            'id' => $collection->id, 'slug' => $collection->slug, 'title' => $collection->title,
            'intro' => $collection->intro, 'status' => $collection->status, 'position' => $collection->position,
            'published_at' => $collection->published_at?->toISOString(),
            'artwork_ids' => $collection->artworks->pluck('id')->all(),
            'artwork_count' => $collection->artworks->count(),
        ];
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

    private function audit(Request $request, string $action, $subject, array $metadata = []): void
    {
        EditorialAudit::create([
            'actor_id' => $request->user()->id, 'action' => $action,
            'subject_type' => class_basename($subject), 'subject_id' => $subject->id,
            'metadata' => $metadata,
        ]);
    }
}
