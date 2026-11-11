<?php

declare(strict_types=1);

namespace App\Actions\Artworks;

use App\Models\ArtistProfile;
use App\Models\Artwork;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class CreateArtwork
{
    /**
     * @param array<string, mixed> $attributes Validated StoreArtworkRequest data.
     */
    public function handle(ArtistProfile $profile, array $attributes): Artwork
    {
        /** @var UploadedFile $image */
        $image = $attributes['image'];
        unset($attributes['image']);

        $imagePath = $image->store('artworks', 'local');

        if (! is_string($imagePath) || $imagePath === '') {
            throw new RuntimeException('The artwork image could not be stored.');
        }

        try {
            $baseSlug = Str::slug($attributes['title']) ?: 'artwork';

            return $profile->artworks()->create([
                ...$attributes,
                'slug' => $baseSlug.'-'.Str::lower(Str::random(10)),
                'image_path' => $imagePath,
                'status' => Artwork::STATUS_PENDING_REVIEW,
            ]);
        } catch (Throwable $exception) {
            Storage::disk('local')->delete($imagePath);

            throw $exception;
        }
    }
}
