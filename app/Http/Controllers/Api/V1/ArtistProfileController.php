<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ArtistProfile;
use App\Models\Artwork;
use App\Support\PersianSearch;
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
                $term = (string) $request->string('q');
                $query->where(function ($nested) use ($term): void {
                    PersianSearch::whereLike($nested, 'display_name', $term);
                    PersianSearch::whereLike($nested, 'city', $term, 'or');
                });
            })
            ->orderBy('display_name')
            ->orderBy('id')
            ->paginate(min(max($request->integer('per_page', 12), 1), 48))
            ->through(fn (ArtistProfile $profile): array => [
                'id' => $profile->id,
                'slug' => $profile->slug,
                'display_name' => $profile->display_name,
                'display_name_en' => $profile->display_name_en,
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

        // Keep public profile payloads bounded even when an artist has a large portfolio.
        // simplePaginate avoids the additional COUNT query used by length-aware pagination.
        $artworks = $artistProfile->artworks()
            ->where('status', Artwork::STATUS_APPROVED)
            ->with('category')
            ->withCount(['likes', 'comments'])
            ->when($request->user(), fn ($query) => $query->withExists(['likes as liked_by_me' => fn ($likes) => $likes->where('user_id', $request->user()->id)]))
            ->latest()
            ->orderByDesc('id')
            ->simplePaginate(12, ['*'], 'artworks_page');

        $followData = $artistProfile->is_public ? [
            'followers_count' => $artistProfile->followers()->count(),
            'is_following' => $request->user()
                ? $artistProfile->followers()->where('follower_user_id', $request->user()->id)->exists()
                : false,
        ] : [];

        return response()->json([
            'data' => [
                ... $this->payload($artistProfile),
                ...$followData,
                'is_own_profile' => $request->user()?->id === $artistProfile->user_id,
                'artworks' => $artworks->getCollection()
                    ->map(fn (Artwork $artwork): array => $this->publicArtworkPayload($artwork, $artistProfile->is_public))
                    ->values(),
                'artworks_pagination' => [
                    'current_page' => $artworks->currentPage(),
                    'per_page' => $artworks->perPage(),
                    'has_more' => $artworks->hasMorePages(),
                    'next_page' => $artworks->hasMorePages() ? $artworks->currentPage() + 1 : null,
                ],
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
            'display_name_en' => ['nullable', 'string', 'max:120'],
            'bio' => ['nullable', 'string', 'max:2000'],
            'bio_en' => ['nullable', 'string', 'max:2000'],
            'city' => ['nullable', 'string', 'max:120'],
            'city_en' => ['nullable', 'string', 'max:120'],
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
            'bio_en' => $profile->bio_en,
            'city' => $profile->city,
            'city_en' => $profile->city_en,
            'website_url' => $profile->website_url,
            'instagram_handle' => $profile->instagram_handle,
            'is_public' => $profile->is_public,
        ];
    }

    private function publicArtworkPayload(Artwork $artwork, bool $includeEngagement): array
    {
        $payload = [
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

        if ($includeEngagement) {
            $payload['likes_count'] = (int) ($artwork->likes_count ?? 0);
            $payload['comments_count'] = (int) ($artwork->comments_count ?? 0);
            $payload['liked_by_me'] = (bool) ($artwork->liked_by_me ?? false);
        }

        return $payload;
    }
}
