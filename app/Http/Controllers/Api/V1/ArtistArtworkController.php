<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Actions\Artworks\CreateArtwork;
use App\Actions\Artworks\UpdateArtwork;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreArtworkRequest;
use App\Http\Requests\UpdateArtworkRequest;
use App\Http\Resources\ArtworkResource as ArtworkJsonResource;
use App\Models\Artwork;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ArtistArtworkController extends Controller
{
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
