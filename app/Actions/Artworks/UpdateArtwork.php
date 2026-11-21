<?php

declare(strict_types=1);

namespace App\Actions\Artworks;

use App\Models\ArtistCollection;
use App\Models\ArtistContent;
use App\Models\Artwork;
use App\Services\ArtworkImageVariants;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class UpdateArtwork
{
    public function __construct(private readonly ArtworkImageVariants $imageVariants)
    {
    }

    /**
     * @param  array<string, mixed>  $attributes  Validated UpdateArtworkRequest data.
     */
    public function handle(Artwork $artwork, array $attributes): Artwork
    {
        $oldImagePath = $artwork->image_path;
        $newImagePath = null;

        if (isset($attributes['image'])) {
            /** @var UploadedFile $image */
            $image = $attributes['image'];
            $newImagePath = $image->store('artworks', 'local');

            if (! is_string($newImagePath) || $newImagePath === '') {
                throw new RuntimeException('The replacement artwork image could not be stored.');
            }
            unset($attributes['image']);
        }

        try {
            DB::transaction(function () use ($artwork, $attributes, $newImagePath): void {
                $saved = $artwork->update([
                    ...$attributes,
                    'status' => Artwork::STATUS_PENDING_REVIEW,
                    'rejection_note' => null,
                    'reviewed_by' => null,
                    'reviewed_at' => null,
                    ...($newImagePath ? ['image_path' => $newImagePath] : []),
                ]);

                if (! $saved) {
                    throw new RuntimeException('The artwork update was not persisted.');
                }

                $content = $artwork->artistContent()->first();

                if ($content) {
                    $content->update([
                        'title' => $artwork->title,
                        'description' => $artwork->description,
                        'media_path' => $artwork->image_path,
                        'publication_status' => ArtistContent::PUBLICATION_DRAFT,
                        'artist_approved_at' => null,
                    ]);

                    DB::table('artist_collections')
                        ->whereIn('id', DB::table('artist_collection_items')
                            ->select('artist_collection_id')
                            ->where('artist_content_id', $content->id))
                        ->where('visibility', ArtistCollection::VISIBILITY_PUBLIC)
                        ->update([
                            'visibility' => ArtistCollection::VISIBILITY_PRIVATE,
                            'published_at' => null,
                            'updated_at' => now(),
                        ]);

                    return;
                }

                $content = ArtistContent::query()->create([
                    'artist_profile_id' => $artwork->artist_profile_id,
                    'source' => ArtistContent::SOURCE_NATIVE,
                    'content_type' => 'artwork',
                    'title' => $artwork->title,
                    'description' => $artwork->description,
                    'media_path' => $artwork->image_path,
                    'publication_status' => ArtistContent::PUBLICATION_DRAFT,
                ]);

                DB::table('artworks')->where('id', $artwork->id)->update(['artist_content_id' => $content->id]);
                $artwork->setAttribute('artist_content_id', $content->id);
                $artwork->setRelation('artistContent', $content);
            });
        } catch (Throwable $exception) {
            if ($newImagePath !== null) {
                $this->imageVariants->deleteForOriginal($newImagePath);
                Storage::disk('local')->delete($newImagePath);
            }

            throw $exception;
        }

        if ($newImagePath !== null) {
            $this->imageVariants->generate($newImagePath);

            if ($oldImagePath !== null) {
                $this->imageVariants->deleteForOriginal($oldImagePath);
                Storage::disk('local')->delete($oldImagePath);
            }
        }

        return $artwork->refresh();
    }
}
