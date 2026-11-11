<?php

declare(strict_types=1);

namespace Tests\Integration\Storage;

use App\Actions\Artworks\CreateArtwork;
use App\Actions\Artworks\UpdateArtwork;
use App\Models\ArtistProfile;
use App\Models\Artwork;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Mockery;
use RuntimeException;
use Tests\TestCase;

final class ArtworkStorageRollbackTest extends TestCase
{
    public function test_uploaded_image_is_removed_when_artwork_creation_fails(): void
    {
        Storage::fake('local');

        $profile = Mockery::mock(ArtistProfile::class)->makePartial();
        $relation = Mockery::mock(HasMany::class);
        $profile->shouldReceive('artworks')->once()->andReturn($relation);
        $relation->shouldReceive('create')->once()->andThrow(new RuntimeException('database write failed'));

        try {
            app(CreateArtwork::class)->handle($profile, [
                'title' => 'اثر آزمایشی',
                'image' => UploadedFile::fake()->image('artwork.jpg'),
            ]);

            self::fail('The artwork creation failure should be rethrown.');
        } catch (RuntimeException $exception) {
            self::assertSame('database write failed', $exception->getMessage());
        }

        self::assertSame([], Storage::disk('local')->allFiles('artworks'));
    }

    public function test_replacement_image_is_removed_and_original_is_preserved_when_update_fails(): void
    {
        Storage::fake('local');
        Storage::disk('local')->put('artworks/original.jpg', 'original-image');

        $artwork = Mockery::mock(Artwork::class)->makePartial();
        $artwork->setAttribute('image_path', 'artworks/original.jpg');
        $artwork->shouldReceive('update')->once()->andReturn(false);

        try {
            app(UpdateArtwork::class)->handle($artwork, [
                'title' => 'عنوان جدید',
                'image' => UploadedFile::fake()->image('replacement.jpg'),
            ]);

            self::fail('The failed artwork update should throw.');
        } catch (RuntimeException $exception) {
            self::assertSame('The artwork update was not persisted.', $exception->getMessage());
        }

        self::assertSame(
            ['artworks/original.jpg'],
            Storage::disk('local')->allFiles('artworks'),
        );
        Storage::disk('local')->assertExists('artworks/original.jpg');
    }
}
