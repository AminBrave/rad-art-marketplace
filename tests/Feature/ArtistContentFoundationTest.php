<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ArtistCollection;
use App\Models\ArtistContent;
use App\Models\ArtistProfile;
use App\Models\Artwork;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ArtistContentFoundationTest extends TestCase
{
    use RefreshDatabase;

    public function test_legacy_artwork_backfill_is_resumable_and_preserves_previously_public_work(): void
    {
        [, $profile] = $this->artistWithProfile();
        $artwork = $this->createArtwork($profile);

        $this->assertSame(0, Artisan::call('rademan:backfill-artist-content', ['--dry-run' => true]));
        $this->assertDatabaseCount('artist_contents', 0);

        $this->assertSame(0, Artisan::call('rademan:backfill-artist-content'));
        $this->assertDatabaseCount('artist_contents', 1);

        $artwork->refresh();
        $content = $artwork->artistContent()->firstOrFail();

        $this->assertSame($profile->id, $content->artist_profile_id);
        $this->assertSame('native', $content->source);
        $this->assertSame('artwork', $content->content_type);
        $this->assertSame($artwork->title, $content->title);
        $this->assertSame($artwork->description, $content->description);
        $this->assertSame($artwork->image_path, $content->media_path);
        $this->assertSame('published', $content->publication_status);
        $this->assertTrue($content->legacy_publication);
        $this->assertNull($content->artist_approved_at);

        Artisan::call('rademan:backfill-artist-content');
        $this->assertDatabaseCount('artist_contents', 1);
    }


    public function test_public_artwork_requires_published_and_artist_approved_content(): void
    {
        Storage::fake('local');
        [$artist, $profile] = $this->artistWithProfile();
        $artwork = $this->createArtwork($profile);
        $artwork->forceFill(['medium' => 'رنگ روغن'])->save();
        Storage::disk('local')->put('artworks/legacy.jpg', 'test-image');

        $content = ArtistContent::query()->create([
            'artist_profile_id' => $profile->id,
            'source' => ArtistContent::SOURCE_NATIVE,
            'content_type' => 'artwork',
            'title' => $artwork->title,
            'publication_status' => ArtistContent::PUBLICATION_DRAFT,
        ]);
        $artwork->artistContent()->associate($content)->save();

        $this->getJson('/api/v1/artworks')
            ->assertOk()
            ->assertJsonMissing(['slug' => $artwork->slug]);
        $this->getJson('/api/v1/artwork-filters')
            ->assertOk()
            ->assertJsonMissing(['medium' => 'رنگ روغن']);
        $this->getJson('/api/v1/artworks/'.$artwork->slug)
            ->assertForbidden();
        $this->get('/api/v1/artworks/'.$artwork->slug.'/image')
            ->assertForbidden();

        $content->forceFill([
            'artist_approved_at' => now(),
            'publication_status' => ArtistContent::PUBLICATION_PUBLISHED,
        ])->save();

        $this->getJson('/api/v1/artworks')
            ->assertOk()
            ->assertJsonFragment(['slug' => $artwork->slug]);
        $this->getJson('/api/v1/artwork-filters')
            ->assertOk()
            ->assertJsonFragment('رنگ روغن');
        $this->getJson('/api/v1/artworks/'.$artwork->slug)
            ->assertOk()
            ->assertJsonPath('data.slug', $artwork->slug);
        $this->get('/api/v1/artworks/'.$artwork->slug.'/image')
            ->assertOk();
    }

    public function test_new_artwork_creation_writes_its_content_companion_transactionally(): void
    {
        Storage::fake('local');
        [$artist, $profile] = $this->artistWithProfile();

        $this->actingAs($artist)->postJson('/api/v1/artist/artworks', [
            'title' => 'اثر تازه',
            'description' => 'روایت هنرمند',
            'category_id' => Category::query()->where('slug', 'painting')->value('id'),
            'medium' => 'رنگ روغن',
            'dimensions' => '۵۰ در ۷۰ سانتی‌متر',
            'year' => 2025,
            'price' => 12500000,
            'availability' => 'available',
            'image' => UploadedFile::fake()->image('artwork.jpg', 1200, 800),
        ])->assertCreated();

        $artwork = Artwork::query()->firstOrFail();
        $content = $artwork->artistContent()->firstOrFail();

        $this->assertSame($profile->id, $content->artist_profile_id);
        $this->assertSame('اثر تازه', $content->title);
        $this->assertSame('روایت هنرمند', $content->description);
        $this->assertSame($artwork->image_path, $content->media_path);
        $this->assertSame('draft', $content->publication_status);
    }

    public function test_editing_legacy_artwork_creates_a_companion_and_returns_it_to_draft(): void
    {
        [$artist, $profile] = $this->artistWithProfile();
        $artwork = $this->createArtwork($profile);

        $this->actingAs($artist)->post('/api/v1/artist/artworks/'.$artwork->id, [
            '_method' => 'PATCH',
            'title' => 'اثر ویرایش‌شده',
            'description' => 'روایت به‌روزشده',
            'category_id' => Category::query()->where('slug', 'painting')->value('id'),
            'medium' => 'آبرنگ',
            'dimensions' => '۴۰ در ۶۰ سانتی‌متر',
            'year' => 2026,
            'price' => 0,
            'availability' => 'available',
        ])->assertOk()->assertJsonPath('data.title', 'اثر ویرایش‌شده');

        $content = $artwork->fresh()->artistContent()->firstOrFail();

        $this->assertSame('اثر ویرایش‌شده', $content->title);
        $this->assertSame('روایت به‌روزشده', $content->description);
        $this->assertSame('artworks/legacy.jpg', $content->media_path);
        $this->assertSame('draft', $content->publication_status);
        $this->assertNull($content->artist_approved_at);
    }

    public function test_artist_collection_membership_cannot_cross_artist_ownership(): void
    {
        [, $ownerProfile] = $this->artistWithProfile('owner@example.com');
        [, $otherProfile] = $this->artistWithProfile('other@example.com');

        $content = ArtistContent::query()->create([
            'artist_profile_id' => $ownerProfile->id,
            'source' => 'native',
            'content_type' => 'post',
            'title' => 'محتوای خصوصی',
        ]);
        $collection = ArtistCollection::query()->create([
            'artist_profile_id' => $otherProfile->id,
            'title' => 'مجموعه دیگر',
            'slug' => 'other-collection',
        ]);

        $this->expectException(QueryException::class);

        DB::table('artist_collection_items')->insert([
            'artist_collection_id' => $collection->id,
            'artist_content_id' => $content->id,
            'artist_profile_id' => $otherProfile->id,
            'position' => 0,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    /**
     * @return array{0: User, 1: ArtistProfile}
     */
    private function artistWithProfile(string $email = 'artist@example.com'): array
    {
        $artist = User::query()->create([
            'name' => 'Artist',
            'email' => $email,
            'password' => 'strong-password-123',
            'role' => User::ROLE_ARTIST,
        ]);

        $profile = $artist->artistProfile()->create([
            'slug' => 'artist-'.str_replace(['@', '.'], '-', $email),
            'display_name' => 'هنرمند آزمایشی',
            'is_public' => true,
        ]);

        return [$artist, $profile];
    }

    private function createArtwork(ArtistProfile $profile): Artwork
    {
        return $profile->artworks()->create([
            'category_id' => Category::query()->where('slug', 'painting')->value('id'),
            'slug' => 'legacy-artwork-'.$profile->id,
            'title' => 'اثر قدیمی',
            'description' => 'توضیحات قدیمی',
            'availability' => 'available',
            'status' => Artwork::STATUS_APPROVED,
            'image_path' => 'artworks/legacy.jpg',
        ]);
    }
}
