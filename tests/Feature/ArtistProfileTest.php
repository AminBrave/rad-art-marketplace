<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ArtistProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArtistProfileTest extends TestCase
{
    use RefreshDatabase;

    public function test_artist_can_create_and_retrieve_their_profile(): void
    {
        $artist = $this->makeUser('artist');

        $this->actingAs($artist)
            ->putJson('/api/v1/artist-profile/me', $this->validProfile())
            ->assertOk()
            ->assertJsonPath('data.display_name', 'هنرمند نمونه')
            ->assertJsonPath('data.is_public', true);

        $this->assertDatabaseHas('artist_profiles', [
            'user_id' => $artist->id,
            'slug' => 'artist-'.$artist->id,
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
