<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

final class ArtistFollowTest extends TestCase
{
    use RefreshDatabase;

    public function test_buyer_can_follow_and_unfollow_a_public_artist_once(): void
    {
        [, $profile] = $this->artistFixture();
        $buyer = $this->user('follow-buyer@example.test', User::ROLE_BUYER);

        $this->actingAs($buyer)
            ->postJson('/api/v1/artists/'.$profile->slug.'/follow')
            ->assertOk()
            ->assertJsonPath('data.is_following', true)
            ->assertJsonPath('data.followers_count', 1);

        $this->postJson('/api/v1/artists/'.$profile->slug.'/follow')
            ->assertOk()
            ->assertJsonPath('data.followers_count', 1);

        $this->getJson('/api/v1/artists/'.$profile->slug)
            ->assertOk()
            ->assertJsonPath('data.followers_count', 1)
            ->assertJsonPath('data.is_following', true)
            ->assertJsonPath('data.is_own_profile', false);

        $this->deleteJson('/api/v1/artists/'.$profile->slug.'/follow')
            ->assertOk()
            ->assertJsonPath('data.is_following', false)
            ->assertJsonPath('data.followers_count', 0);

        $this->deleteJson('/api/v1/artists/'.$profile->slug.'/follow')
            ->assertOk()
            ->assertJsonPath('data.followers_count', 0);

        $this->assertDatabaseCount('artist_follows', 0);
    }

    public function test_artist_can_follow_another_artist_but_cannot_follow_themselves(): void
    {
        [$artist, $profile] = $this->artistFixture();
        $other = $this->user('follow-other-artist@example.test', User::ROLE_ARTIST);
        $otherProfile = $other->artistProfile()->create([
            'slug' => 'follow-other-artist',
            'display_name' => 'هنرمند دیگر',
            'is_public' => true,
        ]);

        $this->actingAs($artist)
            ->postJson('/api/v1/artists/'.$otherProfile->slug.'/follow')
            ->assertOk()
            ->assertJsonPath('data.followers_count', 1);

        $this->postJson('/api/v1/artists/'.$profile->slug.'/follow')->assertUnprocessable();
        $this->assertDatabaseHas('artist_follows', [
            'artist_profile_id' => $otherProfile->id,
            'follower_user_id' => $artist->id,
        ]);
    }

    public function test_admin_and_guests_cannot_follow_and_private_profiles_are_hidden(): void
    {
        [, $profile] = $this->artistFixture();

        $this->postJson('/api/v1/artists/'.$profile->slug.'/follow')->assertUnauthorized();

        $admin = $this->user('follow-admin@example.test', User::ROLE_ADMIN);
        $this->actingAs($admin)
            ->postJson('/api/v1/artists/'.$profile->slug.'/follow')
            ->assertForbidden();

        $profile->update(['is_public' => false]);
        $artist = $profile->user;
        $this->actingAs($artist)
            ->getJson('/api/v1/artists/'.$profile->slug)
            ->assertOk()
            ->assertJsonPath('data.is_own_profile', true)
            ->assertJsonMissingPath('data.followers_count');

        $buyer = $this->user('follow-private-buyer@example.test', User::ROLE_BUYER);
        $this->actingAs($buyer)
            ->getJson('/api/v1/artists/'.$profile->slug)
            ->assertNotFound();

        $this->postJson('/api/v1/artists/'.$profile->slug.'/follow')->assertNotFound();
    }

    public function test_public_profile_does_not_expose_follow_state_for_anonymous_visitors(): void
    {
        [, $profile] = $this->artistFixture();

        $this->getJson('/api/v1/artists/'.$profile->slug)
            ->assertOk()
            ->assertJsonPath('data.followers_count', 0)
            ->assertJsonPath('data.is_following', false)
            ->assertJsonPath('data.is_own_profile', false);
    }

    private function artistFixture(): array
    {
        $artist = $this->user('follow-artist@example.test', User::ROLE_ARTIST);
        $profile = $artist->artistProfile()->create([
            'slug' => 'follow-artist-profile',
            'display_name' => 'هنرمند دنبال‌شونده',
            'is_public' => true,
        ]);

        return [$artist, $profile];
    }

    private function user(string $email, string $role): User
    {
        return User::query()->create([
            'name' => 'کاربر آزمایشی',
            'email' => $email,
            'password' => Hash::make('strong-password-123'),
            'role' => $role,
        ]);
    }
}
