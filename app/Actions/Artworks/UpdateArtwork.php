<?php

declare(strict_types=1);

namespace App\\Actions\\Artworks;

use App\\Models\\Artwork;
use App\\Services\\ArtworkImageVariants;
use Illuminate\\Http\\UploadedFile;
use Illuminate\\Support\\Facades\\Storage;
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
