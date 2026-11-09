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

        $this->actingAs($artist)->withHeaders(['Accept' => 'application/json'])->post('/api/v1/artist/artworks', [
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
        $this->withHeaders(['Accept' => 'application/json'])
            ->post('/api/v1/artist/artworks', [
                ...$this->validArtwork(),
                'image' => UploadedFile::fake()->image('guest.jpg'),
            ])
            ->assertUnauthorized();

        [, $profile] = $this->artistWithProfile();
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

    public function test_public_artwork_catalogue_honors_a_bounded_per_page_request(): void
    {
        [, $profile] = $this->artistWithProfile();

        foreach (range(1, 7) as $index) {
            $profile->artworks()->create([
                ...$this->validArtwork(),
                'slug' => 'catalogue-page-work-'.$index,
                'image_path' => 'artworks/catalogue-page-work-'.$index.'.jpg',
                'status' => Artwork::STATUS_APPROVED,
            ]);
        }

        $this->getJson('/api/v1/artworks?per_page=3')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('per_page', 3)
            ->assertJsonPath('total', 7);
    }

    public function test_artist_artwork_list_includes_total_and_is_scoped_to_the_current_artist(): void
    {
        [$artist, $profile] = $this->artistWithProfile();

        foreach (range(1, 13) as $index) {
            $profile->artworks()->create([
                ...$this->validArtwork(),
                'slug' => 'artist-work-'.$index,
                'image_path' => 'artworks/artist-work-'.$index.'.jpg',
            ]);
        }

        [, $otherProfile] = $this->artistWithProfile('other-artist@example.com');
        $otherProfile->artworks()->create([
            ...$this->validArtwork(),
            'slug' => 'another-artists-work',
            'image_path' => 'artworks/another-artists-work.jpg',
        ]);

        $this->actingAs($artist)
            ->getJson('/api/v1/artist/artworks?page=1')
            ->assertOk()
            ->assertJsonCount(12, 'data')
            ->assertJsonPath('current_page', 1)
            ->assertJsonPath('total', 13)
            ->assertJsonStructure(['next_page_url'])
            ->assertJsonMissing(['slug' => 'another-artists-work']);

        $this->actingAs($artist)
            ->getJson('/api/v1/artist/artworks?page=2')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('current_page', 2)
            ->assertJsonPath('total', 13)
            ->assertJsonPath('next_page_url', null);
    }

    public function test_public_artwork_payload_distinguishes_zero_price_from_undisclosed_price(): void
    {
        [, $profile] = $this->artistWithProfile();

        $zeroPrice = $profile->artworks()->create([
            ...$this->validArtwork(),
            'slug' => 'zero-priced-work',
            'image_path' => 'artworks/zero-priced-work.jpg',
            'price' => 0,
            'status' => Artwork::STATUS_APPROVED,
        ]);
        $undisclosedPrice = $profile->artworks()->create([
            ...$this->validArtwork(),
            'slug' => 'undisclosed-price-work',
            'image_path' => 'artworks/undisclosed-price-work.jpg',
            'price' => null,
            'status' => Artwork::STATUS_APPROVED,
        ]);

        $this->getJson('/api/v1/artworks/'.$zeroPrice->slug)
            ->assertOk()
            ->assertJsonPath('data.price', '0.00');

        $this->getJson('/api/v1/artworks/'.$undisclosedPrice->slug)
            ->assertOk()
            ->assertJsonPath('data.price', null);
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

    public function test_public_catalogue_filters_by_medium_availability_and_artist_and_supports_sorting(): void
    {
        [$artist, $profile] = $this->artistWithProfile('discovery-artist@example.com');
        $category = Category::query()->where('slug', 'painting')->firstOrFail();

        $watercolor = $profile->artworks()->create([
            ...$this->validArtwork(),
            'slug' => 'discovery-watercolor',
            'title' => 'منظره آبرنگی',
            'medium' => 'آبرنگ',
            'year' => 2022,
            'availability' => 'available',
            'image_path' => 'artworks/watercolor.jpg',
            'status' => Artwork::STATUS_APPROVED,
        ]);
        $oil = $profile->artworks()->create([
            ...$this->validArtwork(),
            'slug' => 'discovery-oil',
            'title' => 'پرتره رنگ روغن',
            'medium' => 'رنگ روغن',
            'year' => 2025,
            'availability' => 'sold',
            'image_path' => 'artworks/oil.jpg',
            'status' => Artwork::STATUS_APPROVED,
        ]);

        $this->getJson('/api/v1/artworks?medium='.urlencode('آبرنگ').'&availability=available')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', $watercolor->slug);

        $this->getJson('/api/v1/artworks?q='.urlencode('هنرمند آزمایشی'))
            ->assertOk()
            ->assertJsonCount(2, 'data');

        $this->getJson('/api/v1/artworks?sort=year_desc')
            ->assertOk()
            ->assertJsonPath('data.0.slug', $oil->slug);

        $this->getJson('/api/v1/artworks?sort=year_asc')
            ->assertOk()
            ->assertJsonPath('data.0.slug', $watercolor->slug);

        $this->getJson('/api/v1/artworks?availability=unknown')
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['availability']);
    }

    public function test_public_artwork_filters_only_include_mediums_from_public_approved_work(): void
    {
        [, $publicProfile] = $this->artistWithProfile('public-filter@example.com');
        [, $privateProfile] = $this->artistWithProfile('private-filter@example.com');
        $privateProfile->update(['is_public' => false]);

        $publicProfile->artworks()->create([
            ...$this->validArtwork(),
            'slug' => 'public-filter-work',
            'medium' => 'مداد رنگی',
            'image_path' => 'artworks/public-filter.jpg',
            'status' => Artwork::STATUS_APPROVED,
        ]);
        $privateProfile->artworks()->create([
            ...$this->validArtwork(),
            'slug' => 'private-filter-work',
            'medium' => 'تکنیک خصوصی',
            'image_path' => 'artworks/private-filter.jpg',
            'status' => Artwork::STATUS_APPROVED,
        ]);
        $publicProfile->artworks()->create([
            ...$this->validArtwork(),
            'slug' => 'pending-filter-work',
            'medium' => 'تکنیک در انتظار',
            'image_path' => 'artworks/pending-filter.jpg',
            'status' => Artwork::STATUS_PENDING_REVIEW,
        ]);

        $this->getJson('/api/v1/artwork-filters')
            ->assertOk()
            ->assertJsonFragment(['مداد رنگی'])
            ->assertJsonMissing(['تکنیک خصوصی'])
            ->assertJsonMissing(['تکنیک در انتظار']);
    }

    public function test_approved_artwork_of_a_private_artist_is_not_publicly_discoverable_or_viewable(): void
    {
        [, $profile] = $this->artistWithProfile('hidden-artist@example.com');
        $profile->update(['is_public' => false]);
        $artwork = $profile->artworks()->create([
            ...$this->validArtwork(),
            'slug' => 'hidden-artist-work',
            'image_path' => 'artworks/hidden-artist.jpg',
            'status' => Artwork::STATUS_APPROVED,
        ]);

        $this->getJson('/api/v1/artworks')
            ->assertOk()
            ->assertJsonMissing(['slug' => $artwork->slug]);

        $this->getJson('/api/v1/artworks/'.$artwork->slug)->assertForbidden();
        $this->get('/api/v1/artworks/'.$artwork->slug.'/image')->assertForbidden();
    }

    public function test_artwork_detail_returns_only_public_approved_related_works(): void
    {
        [, $artistProfile] = $this->artistWithProfile('related-owner@example.com');
        [, $otherProfile] = $this->artistWithProfile('related-peer@example.com');
        [, $privateProfile] = $this->artistWithProfile('related-private@example.com');
        $privateProfile->update(['is_public' => false]);
        $category = Category::query()->where('slug', 'painting')->firstOrFail();

        $target = $artistProfile->artworks()->create([
            ...$this->validArtwork(),
            'slug' => 'related-target',
            'image_path' => 'artworks/related-target.jpg',
            'status' => Artwork::STATUS_APPROVED,
        ]);
        $sameArtist = $artistProfile->artworks()->create([
            ...$this->validArtwork(),
            'slug' => 'related-same-artist',
            'image_path' => 'artworks/related-same-artist.jpg',
            'status' => Artwork::STATUS_APPROVED,
        ]);
        $sameCategory = $otherProfile->artworks()->create([
            ...$this->validArtwork(),
            'slug' => 'related-same-category',
            'image_path' => 'artworks/related-same-category.jpg',
            'status' => Artwork::STATUS_APPROVED,
        ]);
        $privateRelated = $privateProfile->artworks()->create([
            ...$this->validArtwork(),
            'slug' => 'related-private',
            'image_path' => 'artworks/related-private.jpg',
            'status' => Artwork::STATUS_APPROVED,
        ]);

        $this->getJson('/api/v1/artworks/'.$target->slug)
            ->assertOk()
            ->assertJsonFragment(['slug' => $sameArtist->slug])
            ->assertJsonFragment(['slug' => $sameCategory->slug])
            ->assertJsonMissing(['slug' => $privateRelated->slug])
            ->assertJsonMissingPath('data.related_artworks.0.status');
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
