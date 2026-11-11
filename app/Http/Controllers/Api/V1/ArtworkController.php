<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Actions\Artworks\CreateArtwork;
use App\Actions\Artworks\UpdateArtwork;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreArtworkRequest;
use App\Http\Requests\UpdateArtworkRequest;
use App\Http\Resources\ArtworkResource as ArtworkJsonResource;
use App\Http\Resources\PublicArtworkResource;
use App\Models\Artwork;
use App\Models\Category;
use App\Support\PersianSearch;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ArtworkController extends Controller
{
    private const PUBLIC_SORTS = ['newest', 'oldest', 'title_asc', 'title_desc', 'year_desc', 'year_asc', 'price_asc', 'price_desc'];

    public function categories(): JsonResponse
    {
        return response()->json([
            'data' => Category::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'slug']),
        ]);
    }

    public function filters(): JsonResponse
    {
        return response()->json([
            'data' => [
                'mediums' => Artwork::query()
                    ->where('status', Artwork::STATUS_APPROVED)
                    ->whereHas('artistProfile', fn ($artist) => $artist->where('is_public', true))
                    ->whereNotNull('medium')
                    ->where('medium', '<>', '')
                    ->distinct()
                    ->orderBy('medium')
                    ->pluck('medium'),
                'availability' => [
                    ['value' => 'available', 'label' => 'قابل استعلام'],
                    ['value' => 'sold', 'label' => 'فروخته‌شده'],
                    ['value' => 'not_for_sale', 'label' => 'برای فروش ارائه نشده'],
                ],
                'sorts' => [
                    ['value' => 'newest', 'label' => 'جدیدترین'],
                    ['value' => 'oldest', 'label' => 'قدیمی‌ترین'],
                    ['value' => 'year_desc', 'label' => 'سال خلق: جدید به قدیم'],
                    ['value' => 'year_asc', 'label' => 'سال خلق: قدیم به جدید'],
                    ['value' => 'title_asc', 'label' => 'عنوان: الف تا ی'],
                    ['value' => 'title_desc', 'label' => 'عنوان: ی تا الف'],
                    ['value' => 'price_asc', 'label' => 'قیمت: کم به زیاد'],
                    ['value' => 'price_desc', 'label' => 'قیمت: زیاد به کم'],
                ],
            ],
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'q' => ['sometimes', 'nullable', 'string', 'max:160'],
            'category' => ['sometimes', 'nullable', 'string', 'max:160'],
            'medium' => ['sometimes', 'nullable', 'string', 'max:120'],
            'availability' => ['sometimes', 'nullable', Rule::in(['available', 'sold', 'not_for_sale'])],
            'sort' => ['sometimes', 'nullable', Rule::in(self::PUBLIC_SORTS)],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:24'],
            'page' => ['sometimes', 'integer', 'min:1'],
        ]);

        $perPage = min(max((int) ($validated['per_page'] ?? 12), 1), 24);
        $sort = $validated['sort'] ?? 'newest';

        $query = Artwork::query()
            ->where('status', Artwork::STATUS_APPROVED)
            ->whereHas('artistProfile', fn ($artist) => $artist->where('is_public', true))
            ->with(['category', 'artistProfile'])
            ->when(! empty($validated['q']), function ($query) use ($validated): void {
                $term = $validated['q'];
                $query->where(function ($nested) use ($term): void {
                    PersianSearch::whereLike($nested, 'title', $term);
                    PersianSearch::whereLike($nested, 'description', $term, 'or');
                    PersianSearch::whereLike($nested, 'medium', $term, 'or');
                    $nested->orWhereHas(
                        'artistProfile',
                        fn ($artist) => PersianSearch::whereLike($artist, 'display_name', $term),
                    );
                });
            })
            ->when(! empty($validated['category']), fn ($query) => $query->whereHas(
                'category',
                fn ($category) => $category->where('slug', $validated['category'])->where('is_active', true),
            ))
            ->when(! empty($validated['medium']), fn ($query) => $query->where('medium', $validated['medium']))
            ->when(! empty($validated['availability']), fn ($query) => $query->where('availability', $validated['availability']));

        match ($sort) {
            'oldest' => $query->orderBy('created_at')->orderBy('id'),
            'title_asc' => $query->orderBy('title')->orderBy('id'),
            'title_desc' => $query->orderByDesc('title')->orderByDesc('id'),
            'year_desc' => $query->orderByRaw('year IS NULL')->orderByDesc('year')->orderByDesc('id'),
            'year_asc' => $query->orderByRaw('year IS NULL')->orderBy('year')->orderBy('id'),
            'price_asc' => $query->orderByRaw('price IS NULL')->orderBy('price')->orderBy('id'),
            'price_desc' => $query->orderByRaw('price IS NULL')->orderByDesc('price')->orderByDesc('id'),
            default => $query->latest()->orderByDesc('id'),
        };

        $artworks = $query->paginate($perPage)
            ->through(fn (Artwork $artwork): array => (new PublicArtworkResource($artwork))->resolve());

        return response()->json($artworks);
    }

    public function show(Artwork $artwork): JsonResponse
    {
        $this->authorize('view', $artwork);
        $artwork->load(['category', 'artistProfile']);

        $related = Artwork::query()
            ->where('status', Artwork::STATUS_APPROVED)
            ->whereHas('artistProfile', fn ($artist) => $artist->where('is_public', true))
            ->where('id', '<>', $artwork->id)
            ->where(function ($query) use ($artwork): void {
                $query->where('category_id', $artwork->category_id)
                    ->orWhere('artist_profile_id', $artwork->artist_profile_id);
            })
            ->with(['category', 'artistProfile'])
            ->orderByRaw('category_id = ? DESC', [$artwork->category_id])
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn (Artwork $item): array => (new PublicArtworkResource($item))->resolve())
            ->values();

        return response()->json([
            'data' => [
                ...(new PublicArtworkResource($artwork))->resolve(),
                'related_artworks' => $related,
            ],
        ]);
    }

    public function image(Artwork $artwork): StreamedResponse
    {
        $this->authorize('view', $artwork);

        abort_unless(Storage::disk('local')->exists($artwork->image_path), 404);

        return Storage::disk('local')->response($artwork->image_path, null, [
            'Cache-Control' => 'private, max-age=60',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }

    public function mine(Request $request): JsonResponse
    {
        $profile = $request->user()->artistProfile()->firstOrFail();

        return response()->json(
            $profile->artworks()
                ->with(['category', 'artistProfile'])
                ->latest()
                ->orderByDesc('id')
                ->paginate(12)
                ->through(fn (Artwork $artwork): array => (new ArtworkJsonResource($artwork))->resolve()),
        );
    }

    public function store(StoreArtworkRequest $request, CreateArtwork $createArtwork): JsonResponse
    {
        $profile = $request->user()->artistProfile()->firstOrFail();
        $artwork = $createArtwork->handle($profile, $request->validated());

        return response()->json([
            'message' => 'اثر برای بررسی مدیر ثبت شد.',
            'data' => (new ArtworkJsonResource($artwork->load('category')))->resolve(),
        ], 201);
    }

    public function update(UpdateArtworkRequest $request, Artwork $artwork, UpdateArtwork $updateArtwork): JsonResponse
    {
        $artwork = $updateArtwork->handle($artwork, $request->validated());

        return response()->json([
            'message' => 'اثر ویرایش شد و دوباره در صف بررسی قرار گرفت.',
            'data' => (new ArtworkJsonResource($artwork->load('category')))->resolve(),
        ]);
    }


}
