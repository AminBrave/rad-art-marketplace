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
