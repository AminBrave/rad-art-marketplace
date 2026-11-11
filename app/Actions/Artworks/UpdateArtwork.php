<?php

declare(strict_types=1);

namespace App\Actions\Artworks;

use App\Models\Artwork;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Throwable;

class UpdateArtwork
{
    /**
     * @param array<string, mixed> $attributes Validated UpdateArtworkRequest data.
     */
    public function handle(Artwork $artwork, array $attributes): Artwork
    {
        $oldImagePath = $artwork->image_path;
        $newImagePath = null;

        if (isset($attributes['image'])) {
            /** @var UploadedFile $image */
            $image = $attributes['image'];
            $newImagePath = $image->store('artworks', 'local');
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
                Storage::disk('local')->delete($newImagePath);
            }

            throw $exception;
        }

        if ($newImagePath !== null && $oldImagePath !== null) {
            Storage::disk('local')->delete($oldImagePath);
        }

        return $artwork->refresh();
    }
}
