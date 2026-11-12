<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guests_and_artists_cannot_access_admin_user_management(): void
    {
        $this->getJson('/api/v1/admin/users')->assertUnauthorized();

        $artist = User::create([
            'name' => 'Artist',
            'email' => 'artist@example.com',
            'password' => 'strong-password-123',
            'role' => User::ROLE_ARTIST,
        ]);

        $this->actingAs($artist)
            ->getJson('/api/v1/admin/users')
            ->assertForbidden();
    }

    public function test_buyer_artist_and_admin_routes_enforce_distinct_role_boundaries(): void
    {
        $buyer = User::create([
            'name' => 'Buyer',
            'email' => 'role-buyer@example.com',
            'password' => 'strong-password-123',
            'role' => User::ROLE_BUYER,
        ]);
        $artist = User::create([
            'name' => 'Artist',
            'email' => 'role-artist@example.com',
            'password' => 'strong-password-123',
            'role' => User::ROLE_ARTIST,
        ]);
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'role-admin@example.com',
            'password' => 'strong-password-123',
            'role' => User::ROLE_ADMIN,
        ]);

        foreach ([
            '/api/v1/artist/artworks',
            '/api/v1/artist/conversations',
            '/api/v1/admin/users',
            '/api/v1/admin/artworks',
            '/api/v1/admin/message-reports',
            '/api/v1/admin/editorial/collections',
        ] as $path) {
            $this->actingAs($buyer)->getJson($path)->assertForbidden();
        }

        foreach ([
            '/api/v1/buyer/conversations',
            '/api/v1/admin/users',
            '/api/v1/admin/artworks',
            '/api/v1/admin/message-reports',
            '/api/v1/admin/editorial/collections',
        ] as $path) {
            $this->actingAs($artist)->getJson($path)->assertForbidden();
        }

        $this->actingAs($admin)
            ->getJson('/api/v1/artist/conversations')
            ->assertForbidden();

        $this->actingAs($admin)
            ->getJson('/api/v1/buyer/conversations')
            ->assertForbidden();
    }

    public function test_admin_can_list_users_and_change_another_users_role(): void
    {
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => 'strong-password-123',
            'role' => User::ROLE_ADMIN,
        ]);

        $artist = User::create([
            'name' => 'Artist',
            'email' => 'artist@example.com',
            'password' => 'strong-password-123',
            'role' => User::ROLE_ARTIST,
        ]);

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/users')
            ->assertOk()
            ->assertJsonStructure(['data' => [['id', 'name', 'email', 'role']]]);

        $this->patchJson("/api/v1/admin/users/{$artist->id}/role", [
            'role' => User::ROLE_ADMIN,
        ])->assertOk()->assertJsonPath('data.role', User::ROLE_ADMIN);
    }

    public function test_admin_cannot_remove_their_own_admin_role(): void
    {
        $admin = User::create([
            'name' => 'Admin',
            'email' => 'admin@example.com',
            'password' => 'strong-password-123',
            'role' => User::ROLE_ADMIN,
        ]);

        $this->actingAs($admin)
            ->patchJson("/api/v1/admin/users/{$admin->id}/role", [
                'role' => User::ROLE_ARTIST,
            ])->assertUnprocessable();
    }
}
