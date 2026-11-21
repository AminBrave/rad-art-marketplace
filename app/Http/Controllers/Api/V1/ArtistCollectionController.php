<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArtistCollectionResource;
use App\Models\ArtistCollection;
use App\Models\ArtistContent;
use App\Models\Artwork;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class ArtistCollectionController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', ArtistCollection::class);

        $validated = $request->validate([
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:100'],
        ]);

        $profile = $request->user()->artistProfile()->firstOrFail();
        $collections = $profile->collections()
            ->with(['contents' => fn ($query) => $query->orderByPivot('position')])
            ->withCount('contents')
            ->orderBy('position')
            ->orderBy('id')
            ->paginate($validated['per_page'] ?? 48)
            ->through(fn (ArtistCollection $collection): array => (new ArtistCollectionResource($collection))->resolve($request));

        return response()->json($collections);
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', ArtistCollection::class);

        $validated = $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:2000'],
        ]);

        $profile = $request->user()->artistProfile()->firstOrFail();
        $collection = $profile->collections()->create([
            ...$validated,
            'slug' => $this->uniqueSlug($profile->id, $validated['title']),
            'visibility' => ArtistCollection::VISIBILITY_PRIVATE,
            'position' => (int) $profile->collections()->max('position') + 1,
        ]);

        return response()->json([
            'message' => 'مجموعه خصوصی ایجاد شد.',
            'data' => (new ArtistCollectionResource($collection->loadCount('contents')))->resolve($request),
        ], 201);
    }

    public function update(Request $request, ArtistCollection $collection): JsonResponse
    {
        $this->authorize('update', $collection);

        $validated = $request->validate([
            'title' => ['sometimes', 'required', 'string', 'max:160'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
        ]);

        if (isset($validated['title']) && $validated['title'] !== $collection->title) {
            $validated['slug'] = $this->uniqueSlug($collection->artist_profile_id, $validated['title']);
        }

        $collection->update($validated);

        return response()->json([
            'message' => 'مجموعه به‌روزرسانی شد.',
            'data' => (new ArtistCollectionResource($collection->refresh()->loadCount('contents')))->resolve($request),
        ]);
    }

    public function destroy(ArtistCollection $collection): JsonResponse
    {
        $this->authorize('delete', $collection);
        $collection->delete();

        return response()->json([], 204);
    }

    public function replaceItems(Request $request, ArtistCollection $collection): JsonResponse
    {
        $this->authorize('update', $collection);

        $validated = $request->validate([
            'content_ids' => ['present', 'array', 'max:100'],
            'content_ids.*' => ['required', 'integer', 'distinct', 'exists:artist_contents,id'],
        ]);

        $ids = array_values($validated['content_ids']);
        $profileId = $collection->artist_profile_id;

        if ($ids !== [] && ArtistContent::query()
            ->where('artist_profile_id', $profileId)
            ->whereIn('id', $ids)
            ->count() !== count($ids)) {
            throw ValidationException::withMessages([
                'content_ids' => ['همه محتواها باید متعلق به همین هنرمند باشند.'],
            ]);
        }

        DB::transaction(function () use ($collection, $ids, $profileId): void {
            ArtistCollection::query()->lockForUpdate()->findOrFail($collection->id);

            if ($ids !== []) {
                ArtistContent::query()
                    ->where('artist_profile_id', $profileId)
                    ->whereIn('id', $ids)
                    ->orderBy('id')
                    ->lockForUpdate()
                    ->get();
            }

            DB::table('artist_collection_items')
                ->where('artist_collection_id', $collection->id)
                ->delete();

            $now = now();
            $rows = [];

            foreach ($ids as $position => $contentId) {
                $rows[] = [
                    'artist_collection_id' => $collection->id,
                    'artist_content_id' => $contentId,
                    'artist_profile_id' => $profileId,
                    'position' => $position,
                    'created_at' => $now,
                    'updated_at' => $now,
                ];
            }

            if ($rows !== []) {
                DB::table('artist_collection_items')->insert($rows);
            }

            ArtistCollection::query()
                ->whereKey($collection->id)
                ->update([
                    'visibility' => ArtistCollection::VISIBILITY_PRIVATE,
                    'published_at' => null,
                    'updated_at' => $now,
                ]);
        });

        $collection->load(['contents' => fn ($query) => $query->orderByPivot('position')])->loadCount('contents');

        return response()->json([
            'message' => 'چیدمان محتوای مجموعه ذخیره شد.',
            'data' => (new ArtistCollectionResource($collection))->resolve($request),
        ]);
    }

    public function reorder(Request $request): JsonResponse
    {
        $this->authorize('viewAny', ArtistCollection::class);

        $validated = $request->validate([
            'collection_ids' => ['present', 'array', 'max:100'],
            'collection_ids.*' => ['required', 'integer', 'distinct', 'exists:artist_collections,id'],
        ]);

        $profile = $request->user()->artistProfile()->firstOrFail();
        $ids = array_values($validated['collection_ids']);

        if ($ids !== [] && $profile->collections()->whereIn('id', $ids)->count() !== count($ids)) {
            throw ValidationException::withMessages([
                'collection_ids' => ['همه مجموعه‌ها باید متعلق به همین هنرمند باشند.'],
            ]);
        }

        DB::transaction(function () use ($profile, $ids): void {
            foreach ($ids as $position => $id) {
                $profile->collections()->whereKey($id)->update(['position' => $position]);
            }
        });

        return $this->index($request);
    }

    public function publish(Request $request, ArtistCollection $collection): JsonResponse
    {
        $this->authorize('update', $collection);

        DB::transaction(function () use ($request, $collection): void {
            $lockedCollection = ArtistCollection::query()->lockForUpdate()->findOrFail($collection->id);
            $profile = $request->user()->artistProfile()->lockForUpdate()->firstOrFail();

            if (! $profile->is_public) {
                abort(409, 'برای انتشار مجموعه ابتدا نمایان‌بودن پروفایل هنرمند را فعال کنید.');
            }

            $contents = $lockedCollection->contents()
                ->with(['artwork' => fn ($query) => $query->lockForUpdate()])
                ->lockForUpdate()
                ->get();

            if ($contents->isEmpty()) {
                abort(409, 'برای انتشار مجموعه، ابتدا محتوا به آن اضافه کنید.');
            }

            foreach ($contents as $content) {
                if ($content->source !== ArtistContent::SOURCE_NATIVE
                    || $content->publication_status !== ArtistContent::PUBLICATION_PUBLISHED
                    || $content->artist_approved_at === null) {
                    abort(409, 'همه محتواهای مجموعه باید بومی، تأییدشده و منتشرشده باشند.');
                }

                if ($content->content_type === 'artwork' && ! $content->artwork) {
                    abort(409, 'محتوای اثر هنری باید به یک اثر ثبت‌شده متصل باشد.');
                }

                if ($content->artwork && $content->artwork->status !== Artwork::STATUS_APPROVED) {
                    abort(409, 'همه آثار هنری مجموعه باید تأیید مدیر را دریافت کرده باشند.');
                }
            }

            $lockedCollection->forceFill([
                'visibility' => ArtistCollection::VISIBILITY_PUBLIC,
                'published_at' => now(),
            ])->save();
        });

        $collection->refresh()->loadCount('contents');

        return response()->json([
            'message' => 'مجموعه منتشر شد.',
            'data' => (new ArtistCollectionResource($collection))->resolve($request),
        ]);
    }

    public function unpublish(Request $request, ArtistCollection $collection): JsonResponse
    {
        $this->authorize('update', $collection);

        DB::transaction(function () use ($collection): void {
            $locked = ArtistCollection::query()->lockForUpdate()->findOrFail($collection->id);
            $locked->forceFill([
                'visibility' => ArtistCollection::VISIBILITY_PRIVATE,
                'published_at' => null,
            ])->save();
        });

        $collection->refresh()->loadCount('contents');

        return response()->json([
            'message' => 'مجموعه خصوصی شد.',
            'data' => (new ArtistCollectionResource($collection))->resolve($request),
        ]);
    }

    private function uniqueSlug(int $artistProfileId, string $title): string
    {
        $base = Str::slug($title);
        if ($base === '') {
            $base = 'collection';
        }

        $base = Str::limit($base, 165, '');
        $slug = $base.'-'.Str::lower(Str::random(8));

        while (ArtistCollection::query()
            ->where('artist_profile_id', $artistProfileId)
            ->where('slug', $slug)
            ->exists()) {
            $slug = $base.'-'.Str::lower(Str::random(8));
        }

        return $slug;
    }
}
