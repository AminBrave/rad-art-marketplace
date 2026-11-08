<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_creates_an_artist_and_authenticates_them(): void
    {
        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'هنرمند آزمایشی',
            'email' => 'artist@example.com',
            'password' => 'strong-password-123',
            'password_confirmation' => 'strong-password-123',
            'role' => 'admin',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.role', User::ROLE_ARTIST)
            ->assertJsonPath('data.email', 'artist@example.com');

        $this->assertDatabaseHas('users', [
            'email' => 'artist@example.com',
            'role' => User::ROLE_ARTIST,
        ]);

        $this->assertAuthenticated();
    }

    public function test_registration_requires_a_confirmed_strong_password(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'هنرمند',
            'email' => 'artist@example.com',
            'password' => 'short',
            'password_confirmation' => 'different',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['password']);
    }

    public function test_user_can_login_fetch_their_profile_and_logout(): void
    {
        $user = User::create([
            'name' => 'Artist',
            'email' => 'artist@example.com',
            'password' => 'strong-password-123',
            'role' => User::ROLE_ARTIST,
        ]);

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'strong-password-123',
        ])->assertOk()->assertJsonPath('data.id', $user->id);

        $this->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('data.role', User::ROLE_ARTIST);

        $this->postJson('/api/v1/auth/logout')->assertOk();
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
        $this->assertGuest();
    }

    public function test_invalid_credentials_are_rejected(): void
    {
        $this->postJson('/api/v1/auth/login', [
            'email' => 'missing@example.com',
            'password' => 'wrong-password',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['email']);
    }
}
