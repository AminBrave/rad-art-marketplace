<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Artwork;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ArtworkTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        Storage::fake('local');
    }

    public function test_artist_can_submit_artwork_and_image_is_stored_privately(): void
    {
        [$artist, $profile] = $this->artistWithProfile();

        $response = $this->actingAs($artist)->post('/api/v1/artist/artworks', [
            ...$this->validArtwork(),
            'image' => UploadedFile::fake()->image('original.jpg', 1200, 800),
            'artist_profile_id' => 999,
            'status' => Artwork::STATUS_APPROVED,
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.status', Artwork::STATUS_PENDING_REVIEW)
            ->assertJsonPath('data.title', 'اثر آزمایشی');

        $artwork = Artwork::firstOrFail();
        $this->assertSame($profile->id, $artwork->artist_profile_id);
        Storage::disk('local')->assertExists($artwork->image_path);
        $this->assertDatabaseHas('artworks', [
            'artist_profile_id' => $profile->id,
            'status' => Artwork::STATUS_PENDING_REVIEW,
        ]);
    }

    public function test_artwork_validation_rejects_invalid_image_and_inactive_category(): void
    {
        [$artist] = $this->artistWithProfile();
        $inactive = Category::create(['name' => 'غیرفعال', 'slug' => 'inactive', 'is_active' => false]);

        $this->actingAs($artist)->post('/api/v1/artist/artworks', [
            ...$this->validArtwork(),
            'category_id' => $inactive->id,
            'image' => UploadedFile::fake()->create('script.svg', 10, 'image/svg+xml'),
        ])->assertUnprocessable()->assertJsonValidationErrors(['category_id', 'image']);
    }

    public function test_artist_can_edit_own_artwork_and_edit_returns_it_to_review(): void
    {
        [$artist, $profile] = $this->artistWithProfile();
        $artwork = $profile->artworks()->create([
            ...$this->validArtwork(),
            'slug' => 'own-artwork',
            'image_path' => 'artworks/original.jpg',
            'status' => Artwork::STATUS_APPROVED,
        ]);

        Storage::disk('local')->put('artworks/original.jpg', 'image');

        $this->actingAs($artist)->post('/api/v1/artist/artworks/'.$artwork->id, [
            '_method' => 'PATCH',
            ...$this->validArtwork(),
            'title' => 'عنوان ویرایش‌شده',
        ])->assertOk()->assertJsonPath('data.title', 'عنوان ویرایش‌شده')
            ->assertJsonPath('data.status', Artwork::STATUS_PENDING_REVIEW);
    }

    public function test_artist_cannot_edit_another_artists_artwork(): void
    {
        [$owner, $ownerProfile] = $this->artistWithProfile('owner@example.com');
        [$otherArtist] = $this->artistWithProfile('other@example.com');
        $artwork = $ownerProfile->artworks()->create([
            ...$this->validArtwork(),
            'slug' => 'owned-by-first',
            'image_path' => 'artworks/private.jpg',
        ]);

        $this->actingAs($otherArtist)->post('/api/v1/artist/artworks/'.$artwork->id, [
            '_method' => 'PATCH',
            ...$this->validArtwork(),
        ])->assertForbidden();
    }

    public function test_guest_cannot_submit_artwork_and_public_catalogue_hides_pending_items(): void
    {
        $this->post('/api/v1/artist/artworks', [
            ...$this->validArtwork(),
            'image' => UploadedFile::fake()->image('guest.jpg'),
        ])->assertUnauthorized();

        [$artist, $profile] = $this->artistWithProfile();
        $pending = $profile->artworks()->create([
            ...$this->validArtwork(),
            'slug' => 'pending-work',
            'image_path' => 'artworks/pending.jpg',
        ]);
        $approved = $profile->artworks()->create([
            ...$this->validArtwork(),
            'slug' => 'approved-work',
            'image_path' => 'artworks/approved.jpg',
            'status' => Artwork::STATUS_APPROVED,
        ]);

        $this->getJson('/api/v1/artworks')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', $approved->slug);

        $this->getJson('/api/v1/artworks/'.$pending->slug)->assertForbidden();
        $this->getJson('/api/v1/artworks/'.$approved->slug)->assertOk();
    }

    public function test_admin_can_view_and_edit_an_artists_artwork(): void
    {
        [, $profile] = $this->artistWithProfile();
        $artwork = $profile->artworks()->create([
            ...$this->validArtwork(),
            'slug' => 'admin-managed-work',
            'image_path' => 'artworks/admin.jpg',
        ]);
        $admin = $this->makeUser('admin@example.com', User::ROLE_ADMIN);

        $this->actingAs($admin)->post('/api/v1/artist/artworks/'.$artwork->id, [
            '_method' => 'PATCH',
            ...$this->validArtwork(),
            'title' => 'ویرایش مدیر',
        ])->assertOk()->assertJsonPath('data.title', 'ویرایش مدیر');
    }

    public function test_only_owner_or_admin_can_retrieve_a_pending_artwork_image(): void
    {
        [$owner, $profile] = $this->artistWithProfile();
        $artwork = $profile->artworks()->create([
            ...$this->validArtwork(),
            'slug' => 'private-image',
            'image_path' => 'artworks/private.jpg',
        ]);
        Storage::disk('local')->put('artworks/private.jpg', 'private');

        $this->get('/api/v1/artworks/'.$artwork->slug.'/image')->assertForbidden();
        [$otherArtist] = $this->artistWithProfile('other@example.com');
        $this->actingAs($otherArtist)->get('/api/v1/artworks/'.$artwork->slug.'/image')->assertForbidden();
        $this->actingAs($owner)->get('/api/v1/artworks/'.$artwork->slug.'/image')->assertOk();
    }

    /**
     * @return array{0: User, 1: ArtistProfile}
     */
    private function artistWithProfile(string $email = 'artist@example.com'): array
    {
        $artist = $this->makeUser($email);
        $profile = $artist->artistProfile()->create([
            'slug' => 'artist-'.str_replace(['@', '.'], '-', $email),
            'display_name' => 'هنرمند آزمایشی',
            'is_public' => true,
        ]);

        return [$artist, $profile];
    }

    private function makeUser(string $email, string $role = User::ROLE_ARTIST): User
    {
        return User::create([
            'name' => 'Artist',
            'email' => $email,
            'password' => 'strong-password-123',
            'role' => $role,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validArtwork(): array
    {
        return [
            'title' => 'اثر آزمایشی',
            'description' => 'توضیحات اثر',
            'category_id' => Category::query()->where('slug', 'painting')->value('id'),
            'medium' => 'رنگ روغن',
            'dimensions' => '۵۰ در ۷۰ سانتی‌متر',
            'year' => 2025,
            'price' => 12500000,
            'availability' => 'available',
        ];
    }
}
