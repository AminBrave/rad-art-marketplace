<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ArtistProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ArtistProfileController extends Controller
{
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

            $profile = $user->artistProfile()->create([
                ...$validated,
                'slug' => $baseSlug.'-'.$user->id,
            ]);
        }

        return response()->json([
            'message' => 'پروفایل هنرمند ذخیره شد.',
            'data' => $this->payload($profile->refresh()),
        ]);
    }

    public function publicShow(Request $request, ArtistProfile $artistProfile): JsonResponse
    {
        if (! $artistProfile->is_public
            && (! $request->user()
                || (! $request->user()->isAdmin() && $request->user()->id !== $artistProfile->user_id))) {
            abort(404);
        }

        $this->authorize('view', $artistProfile);

        return response()->json(['data' => $this->payload($artistProfile)]);
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

        return response()->json([
            'message' => 'پروفایل هنرمند به‌روزرسانی شد.',
            'data' => $this->payload($artistProfile->refresh()),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
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

    /**
     * @return array<string, mixed>
     */
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
}
