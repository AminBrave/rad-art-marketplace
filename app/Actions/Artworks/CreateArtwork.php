<?php

declare(strict_types=1);

namespace App\Actions\Artworks;

use App\Models\ArtistContent;
use App\Models\ArtistProfile;
use App\Models\Artwork;
use App\Services\ArtworkImageVariants;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use RuntimeException;
use Throwable;

class CreateArtwork
{
    public function __construct(private readonly ArtworkImageVariants $imageVariants)
    {
    }

    /**
     * @param  array<string, mixed>  $attributes  Validated StoreArtworkRequest data.
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
            $this->imageVariants->generate($imagePath);

            return DB::transaction(function () use ($profile, $attributes, $imagePath): Artwork {
                $baseSlug = Str::slug($attributes['title']) ?: 'artwork';
                $artwork = $profile->artworks()->create([
                    ...$attributes,
                    'slug' => $baseSlug.'-'.Str::lower(Str::random(10)),
                    'image_path' => $imagePath,
                    'status' => Artwork::STATUS_PENDING_REVIEW,
                ]);

                $content = ArtistContent::query()->create([
                    'artist_profile_id' => $profile->id,
                    'source' => ArtistContent::SOURCE_NATIVE,
                    'content_type' => 'artwork',
                    'title' => $artwork->title,
                    'description' => $artwork->description,
                    'media_path' => $imagePath,
                    'publication_status' => ArtistContent::PUBLICATION_DRAFT,
                ]);

                DB::table('artworks')->where('id', $artwork->id)->update(['artist_content_id' => $content->id]);
                $artwork->setAttribute('artist_content_id', $content->id);
                $artwork->setRelation('artistContent', $content);

                return $artwork;
            });
        } catch (Throwable $exception) {
            $this->imageVariants->deleteForOriginal($imagePath);
            Storage::disk('local')->delete($imagePath);

            throw $exception;
        }
    }
}
