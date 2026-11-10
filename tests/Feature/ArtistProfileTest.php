<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Artwork;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArtistProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_artist_can_create_and_retrieve_their_profile(): void
    {
        $artist = $this->makeUser('artist');

        $response = $this->actingAs($artist)
            ->putJson('/api/v1/artist-profile/me', $this->validProfile())
            ->assertOk()
            ->assertJsonPath('data.display_name', 'هنرمند نمونه')
            ->assertJsonPath('data.is_public', true);

        $this->assertDatabaseHas('artist_profiles', [
            'user_id' => $artist->id,
            'slug' => $response->json('data.slug'),
            'display_name' => 'هنرمند نمونه',
        ]);

        $this->actingAs($artist)
            ->getJson('/api/v1/artist-profile/me')
            ->assertOk()
            ->assertJsonPath('data.city', 'تهران');
    }

    public function test_profile_validation_rejects_invalid_website_and_social_handle(): void
    {
        $this->actingAs($this->makeUser('artist'))
            ->putJson('/api/v1/artist-profile/me', [
                ...$this->validProfile(),
                'website_url' => 'not-a-url',
                'instagram_handle' => '@not-valid',
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['website_url', 'instagram_handle']);
    }

    public function test_artist_can_edit_only_their_own_profile(): void
    {
        $artist = $this->makeUser('artist');
        $profile = $artist->artistProfile()->create([
            ...$this->validProfile(),
            'slug' => 'artist-'.$artist->id,
        ]);

        $this->actingAs($artist)
            ->patchJson('/api/v1/artist-profiles/'.$profile->id, [
                ...$this->validProfile(),
                'display_name' => 'نام تازه',
            ])
            ->assertOk()
            ->assertJsonPath('data.display_name', 'نام تازه');

        $otherArtist = $this->makeUser('other@example.com');
        $otherProfile = $otherArtist->artistProfile()->create([
            ...$this->validProfile(),
            'slug' => 'artist-'.$otherArtist->id,
        ]);

        $this->actingAs($artist)
            ->patchJson('/api/v1/artist-profiles/'.$otherProfile->id, [
                ...$this->validProfile(),
                'display_name' => 'تلاش غیرمجاز',
            ])
            ->assertForbidden();
    }

    public function test_guest_cannot_access_the_authenticated_profile_endpoint(): void
    {
        $this->getJson('/api/v1/artist-profile/me')->assertUnauthorized();
        $this->putJson('/api/v1/artist-profile/me', $this->validProfile())->assertUnauthorized();
    }

    public function test_public_profiles_are_visible_but_private_profiles_are_not(): void
    {
        $artist = $this->makeUser('artist');
        $publicProfile = $artist->artistProfile()->create([
            ...$this->validProfile(),
            'slug' => 'public-artist',
        ]);

        $this->getJson('/api/v1/artists/'.$publicProfile->slug)
            ->assertOk()
            ->assertJsonPath('data.display_name', 'هنرمند نمونه');

        $privateProfile = $artist->artistProfile()->updateOrCreate(
            ['user_id' => $artist->id],
            [...$this->validProfile(), 'slug' => 'private-artist', 'is_public' => false],
        );

        $this->getJson('/api/v1/artists/'.$privateProfile->slug)->assertNotFound();
    }

    public function test_artist_can_preview_their_own_private_profile_without_making_it_public(): void
    {
        $artist = $this->makeUser('private-preview');
        $profile = $artist->artistProfile()->create([
            ...$this->validProfile(),
            'slug' => 'private-preview',
            'is_public' => false,
        ]);

        $this->actingAs($artist)
            ->getJson('/api/v1/artists/'.$profile->slug)
            ->assertOk()
            ->assertJsonPath('data.slug', 'private-preview')
            ->assertJsonPath('data.is_public', false);

        $this->getJson('/api/v1/artists/'.$profile->slug)
            ->assertNotFound();

        $this->assertDatabaseHas('artist_profiles', [
            'id' => $profile->id,
            'is_public' => false,
        ]);
    }

    public function test_admin_can_view_and_update_any_artist_profile(): void
    {
        $artist = $this->makeUser('artist');
        $profile = $artist->artistProfile()->create([
            ...$this->validProfile(),
            'slug' => 'managed-artist',
            'is_public' => false,
        ]);
        $admin = $this->makeUser('admin', User::ROLE_ADMIN);

        $this->actingAs($admin)
            ->getJson('/api/v1/artist-profiles/'.$profile->id)
            ->assertOk()
            ->assertJsonPath('data.slug', 'managed-artist');

        $this->actingAs($admin)
            ->patchJson('/api/v1/artist-profiles/'.$profile->id, [
                ...$this->validProfile(),
                'display_name' => 'پروفایل ویرایش‌شده توسط مدیر',
                'is_public' => true,
            ])
            ->assertOk()
            ->assertJsonPath('data.display_name', 'پروفایل ویرایش‌شده توسط مدیر');
    }

    public function test_artist_cannot_view_another_artists_private_profile(): void
    {
        $owner = $this->makeUser('owner');
        $profile = $owner->artistProfile()->create([
            ...$this->validProfile(),
            'slug' => 'private-owner',
            'is_public' => false,
        ]);
        $visitor = $this->makeUser('visitor');

        $this->actingAs($visitor)
            ->getJson('/api/v1/artist-profiles/'.$profile->id)
            ->assertForbidden();
    }

    public function test_public_artist_directory_only_lists_public_profiles_and_supports_search_and_pagination(): void
    {
        $first = $this->makeUser('first@example.com');
        $first->artistProfile()->create([...$this->validProfile(), 'slug' => 'first-artist', 'display_name' => 'آرمان اول']);
        $second = $this->makeUser('second@example.com');
        $second->artistProfile()->create([...$this->validProfile(), 'slug' => 'second-artist', 'display_name' => 'آرمان دوم', 'city' => 'شیراز']);
        $private = $this->makeUser('private@example.com');
        $private->artistProfile()->create([...$this->validProfile(), 'slug' => 'private-artist', 'is_public' => false]);

        $this->getJson('/api/v1/artists?per_page=1')
            ->assertOk()
            ->assertJsonPath('per_page', 1)
            ->assertJsonCount(1, 'data')
            ->assertJsonMissingPath('data.0.is_public')
            ->assertJsonMissingPath('data.0.user_id');

        $this->getJson('/api/v1/artists?q=شیراز')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', 'second-artist');

        $this->getJson('/api/v1/artists?q=private-artist')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_public_artist_profile_includes_only_approved_portfolio_artworks(): void
    {
        $artist = $this->makeUser('portfolio@example.com');
        $profile = $artist->artistProfile()->create([...$this->validProfile(), 'slug' => 'portfolio-artist']);
        $category = Category::query()->where('slug', 'painting')->firstOrFail();

        $profile->artworks()->create([
            'category_id' => $category->id,
            'slug' => 'approved-portfolio-work',
            'title' => 'اثر تأییدشده',
            'image_path' => 'artworks/approved.jpg',
            'status' => Artwork::STATUS_APPROVED,
            'availability' => 'available',
        ]);
        $profile->artworks()->create([
            'category_id' => $category->id,
            'slug' => 'pending-portfolio-work',
            'title' => 'اثر در انتظار بررسی',
            'image_path' => 'artworks/pending.jpg',
            'status' => Artwork::STATUS_PENDING_REVIEW,
            'availability' => 'available',
        ]);

        $this->getJson('/api/v1/artists/'.$profile->slug)
            ->assertOk()
            ->assertJsonPath('data.slug', 'portfolio-artist')
            ->assertJsonCount(1, 'data.artworks')
            ->assertJsonPath('data.artworks.0.slug', 'approved-portfolio-work')
            ->assertJsonMissingPath('data.artworks.0.status')
            ->assertJsonMissingPath('data.artworks.0.rejection_note');
    }

    public function test_public_artist_portfolio_is_bounded_and_supports_load_more_pagination(): void
    {
        $artist = $this->makeUser('large-portfolio@example.com');
        $profile = $artist->artistProfile()->create([...$this->validProfile(), 'slug' => 'large-portfolio']);
        $category = Category::query()->where('slug', 'painting')->firstOrFail();

        foreach (range(1, 13) as $index) {
            $profile->artworks()->create([
                'category_id' => $category->id,
                'slug' => 'portfolio-work-'.$index,
                'title' => 'اثر شماره '.$index,
                'image_path' => 'artworks/work-'.$index.'.jpg',
                'status' => Artwork::STATUS_APPROVED,
                'availability' => 'available',
            ]);
        }

        $this->getJson('/api/v1/artists/'.$profile->slug.'?artworks_page=1')
            ->assertOk()
            ->assertJsonCount(12, 'data.artworks')
            ->assertJsonPath('data.artworks_pagination.current_page', 1)
            ->assertJsonPath('data.artworks_pagination.has_more', true)
            ->assertJsonPath('data.artworks_pagination.next_page', 2);

        $this->getJson('/api/v1/artists/'.$profile->slug.'?artworks_page=2')
            ->assertOk()
            ->assertJsonCount(1, 'data.artworks')
            ->assertJsonPath('data.artworks_pagination.current_page', 2)
            ->assertJsonPath('data.artworks_pagination.has_more', false)
            ->assertJsonPath('data.artworks_pagination.next_page', null);
    }

    /**
     * @return array<string, mixed>
     */
    private function validProfile(): array
    {
        return [
            'display_name' => 'هنرمند نمونه',
            'bio' => 'هنرمند هنرهای تجسمی',
            'city' => 'تهران',
            'website_url' => 'https://example.com',
            'instagram_handle' => 'sample.artist',
            'is_public' => true,
        ];
    }

    private function makeUser(string $email, string $role = User::ROLE_ARTIST): User
    {
        return User::create([
            'name' => 'Artist',
            'email' => $email === 'artist' ? 'artist@example.com' : (str_contains($email, '@') ? $email : $email.'@example.com'),
            'password' => 'strong-password-123',
            'role' => $role,
        ]);
    }
}
