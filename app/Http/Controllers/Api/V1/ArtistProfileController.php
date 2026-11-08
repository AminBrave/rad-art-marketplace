<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ArtistProfile;
use App\Models\Artwork;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ArtistProfileController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $profiles = ArtistProfile::query()
            ->where('is_public', true)
            ->when($request->filled('q'), function ($query) use ($request): void {
                $term = '%'.(string) $request->string('q').'%';
                $query->where(function ($nested) use ($term): void {
                    $nested->where('display_name', 'like', $term)
                        ->orWhere('city', 'like', $term);
                });
            })
            ->orderBy('display_name')
            ->orderBy('id')
            ->paginate(min(max($request->integer('per_page', 12), 1), 48))
            ->through(fn (ArtistProfile $profile): array => [
                'id' => $profile->id,
                'slug' => $profile->slug,
                'display_name' => $profile->display_name,
                'bio' => $profile->bio ? Str::limit($profile->bio, 220) : null,
                'city' => $profile->city,
            ]);

        return response()->json($profiles);
    }

    public function mine(Request $request): JsonResponse
    {
        $profile = $request->user()->artistProfile()->first();

        return response()->json(['data' => $profile ? $this->payload($profile) : null]);
    }

    public function saveMine(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->artistProfile()->first();
        $validated = $this->validatedProfile($request);

        if ($profile) {
            $this->authorize('update', $profile);
            $profile->update($validated);
        } else {
            $this->authorize('create', ArtistProfile::class);
            $baseSlug = Str::slug($validated['display_name']) ?: 'artist';
            $profile = $user->artistProfile()->create([...$validated, 'slug' => $baseSlug.'-'.$user->id]);
        }

        return response()->json(['message' => 'پروفایل هنرمند ذخیره شد.', 'data' => $this->payload($profile->refresh())]);
    }

    public function publicShow(Request $request, ArtistProfile $artistProfile): JsonResponse
    {
        if (! $artistProfile->is_public
            && (! $request->user()
                || (! $request->user()->isAdmin() && $request->user()->id !== $artistProfile->user_id))) {
            abort(404);
        }

        $this->authorize('view', $artistProfile);
        $artistProfile->load(['artworks' => fn ($query) => $query
            ->where('status', Artwork::STATUS_APPROVED)
            ->with('category')
            ->latest()]);

        return response()->json([
            'data' => [
                ... $this->payload($artistProfile),
                'artworks' => $artistProfile->artworks->map(fn (Artwork $artwork): array => $this->publicArtworkPayload($artwork))->values(),
            ],
        ]);
    }

    public function show(Request $request, ArtistProfile $artistProfile): JsonResponse
    {
        $this->authorize('view', $artistProfile);
        return response()->json(['data' => $this->payload($artistProfile)]);
    }

    public function update(Request $request, ArtistProfile $artistProfile): JsonResponse
    {
        $this->authorize('update', $artistProfile);
        $artistProfile->update($this->validatedProfile($request));
        return response()->json(['message' => 'پروفایل هنرمند به‌روزرسانی شد.', 'data' => $this->payload($artistProfile->refresh())]);
    }

    private function validatedProfile(Request $request): array
    {
        return $request->validate([
            'display_name' => ['required', 'string', 'max:120'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'city' => ['nullable', 'string', 'max:120'],
            'website_url' => ['nullable', 'url', 'max:255'],
            'instagram_handle' => ['nullable', 'string', 'regex:/^[A-Za-z0-9._]{1,30}$/'],
            'is_public' => ['required', 'boolean'],
        ]);
    }

    private function payload(ArtistProfile $profile): array
    {
        return [
            'id' => $profile->id,
            'slug' => $profile->slug,
            'display_name' => $profile->display_name,
            'bio' => $profile->bio,
            'city' => $profile->city,
            'website_url' => $profile->website_url,
            'instagram_handle' => $profile->instagram_handle,
            'is_public' => $profile->is_public,
        ];
    }

    private function publicArtworkPayload(Artwork $artwork): array
    {
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
            'image_url' => route('api.v1.artworks.image', $artwork->slug),
            'category' => ['id' => $artwork->category->id, 'name' => $artwork->category->name, 'slug' => $artwork->category->slug],
        ];
    }
}
