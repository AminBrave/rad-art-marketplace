<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Artwork;
use App\Models\Category;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ArtworkController extends Controller
{
    public function categories(): JsonResponse
    {
        return response()->json([
            'data' => Category::query()
                ->where('is_active', true)
                ->orderBy('name')
                ->get(['id', 'name', 'slug']),
        ]);
    }

    public function index(Request $request): JsonResponse
    {
        $artworks = Artwork::query()
            ->where('status', Artwork::STATUS_APPROVED)
            ->with(['category', 'artistProfile'])
            ->when($request->filled('q'), function ($query) use ($request): void {
                $term = '%'.(string) $request->string('q').'%';
                $query->where(function ($nested) use ($term): void {
                    $nested->where('title', 'like', $term)
                        ->orWhere('description', 'like', $term)
                        ->orWhere('medium', 'like', $term);
                });
            })
            ->when($request->filled('category'), fn ($query) => $query->whereHas(
                'category',
                fn ($category) => $category->where('slug', (string) $request->string('category'))->where('is_active', true),
            ))
            ->latest()
            ->paginate(12)
            ->through(fn (Artwork $artwork): array => $this->publicPayload($artwork));

        return response()->json($artworks);
    }

    public function show(Artwork $artwork): JsonResponse
    {
        $this->authorize('view', $artwork);

        return response()->json(['data' => $this->publicPayload($artwork->load(['category', 'artistProfile']))]);
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
                ->with('category')
                ->latest()
                ->orderByDesc('id')
                ->simplePaginate(12)
                ->through(fn (Artwork $artwork): array => $this->payload($artwork)),
        );
    }

    public function store(Request $request): JsonResponse
    {
        $this->authorize('create', Artwork::class);

        $profile = $request->user()->artistProfile()->firstOrFail();
        $validated = $this->validatedArtwork($request, true);
        $imagePath = $validated['image']->store('artworks', 'local');
        unset($validated['image']);

        $baseSlug = Str::slug($validated['title']) ?: 'artwork';
        $artwork = $profile->artworks()->create([
            ...$validated,
            'slug' => $baseSlug.'-'.Str::lower(Str::random(10)),
            'image_path' => $imagePath,
            'status' => Artwork::STATUS_PENDING_REVIEW,
        ]);

        return response()->json([
            'message' => 'اثر برای بررسی مدیر ثبت شد.',
            'data' => $this->payload($artwork->load('category')),
        ], 201);
    }

    public function update(Request $request, Artwork $artwork): JsonResponse
    {
        $this->authorize('update', $artwork);

        $validated = $this->validatedArtwork($request, false);
        $oldImagePath = $artwork->image_path;
        $newImagePath = isset($validated['image'])
            ? $validated['image']->store('artworks', 'local')
            : null;
        unset($validated['image']);

        $artwork->update([
            ...$validated,
            'status' => Artwork::STATUS_PENDING_REVIEW,
            'rejection_note' => null,
            'reviewed_by' => null,
            'reviewed_at' => null,
            ...($newImagePath ? ['image_path' => $newImagePath] : []),
        ]);

        if ($newImagePath) {
            Storage::disk('local')->delete($oldImagePath);
        }

        return response()->json([
            'message' => 'اثر ویرایش شد و دوباره در صف بررسی قرار گرفت.',
            'data' => $this->payload($artwork->refresh()->load('category')),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validatedArtwork(Request $request, bool $imageRequired): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:160'],
            'description' => ['nullable', 'string', 'max:3000'],
            'category_id' => ['required', 'integer', Rule::exists('categories', 'id')->where('is_active', true)],
            'medium' => ['nullable', 'string', 'max:120'],
            'dimensions' => ['nullable', 'string', 'max:120'],
            'year' => ['nullable', 'integer', 'min:1000', 'max:'.(now()->year + 1)],
            'price' => ['nullable', 'numeric', 'min:0', 'max:999999999999.99'],
            'availability' => ['required', Rule::in(['available', 'sold', 'not_for_sale'])],
            'image' => [
                $imageRequired ? 'required' : 'sometimes',
                'image',
                'mimes:jpg,jpeg,png,webp',
                'dimensions:max_width=6000,max_height=6000',
                'max:5120',
            ],
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function publicPayload(Artwork $artwork): array
    {
        $payload = $this->payload($artwork);
        unset($payload['status'], $payload['rejection_note']);

        return $payload;
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Artwork $artwork): array
    {
        $artwork->loadMissing(['category', 'artistProfile']);

        return [
            'id' => $artwork->id,
            'slug' => $artwork->slug,
            'title' => $artwork->title,
            'description' => $artwork->description,
            'medium' => $artwork->medium,
            'dimensions' => $artwork->dimensions,
            'year' => $artwork->year,
            'price' => $artwork->price,
            'availability' => $artwork->availability,
            'status' => $artwork->status,
            'rejection_note' => $artwork->rejection_note,
            'image_url' => route('api.v1.artworks.image', $artwork->slug),
            'category' => ['id' => $artwork->category->id, 'name' => $artwork->category->name, 'slug' => $artwork->category->slug],
            'artist' => [
                'display_name' => $artwork->artistProfile->display_name,
                'slug' => $artwork->artistProfile->slug,
            ],
        ];
    }
}
