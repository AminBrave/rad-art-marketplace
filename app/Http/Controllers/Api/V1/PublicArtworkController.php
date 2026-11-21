<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\PublicArtworkResource;
use App\Models\Artwork;
use App\Models\Category;
use App\Support\PersianSearch;
use App\Services\ArtworkImageVariants;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class PublicArtworkController extends Controller
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
                    ->publiclyVisible()
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
            ->publiclyVisible()
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
            ->publiclyVisible()
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

    public function image(Request $request, Artwork $artwork, ArtworkImageVariants $variants): StreamedResponse
    {
        $this->authorize('view', $artwork);

        $disk = Storage::disk('local');
        abort_unless($disk->exists($artwork->image_path), 404);

        $variantPath = $variants->pathFor((string) $artwork->image_path, (string) $request->query('variant', ''));
        $imagePath = $variantPath !== null && $disk->exists($variantPath)
            ? $variantPath
            : $artwork->image_path;

        return $disk->response($imagePath, null, [
            'Cache-Control' => 'private, max-age=60',
            'X-Content-Type-Options' => 'nosniff',
        ]);
    }
}
