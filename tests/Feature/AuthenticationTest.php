<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_app_shell_bootstraps_a_resolved_guest_state_without_a_second_auth_request(): void
    {
        $this->get('/dashboard/artist')
            ->assertOk()
            ->assertSee('id="rad-auth-bootstrap"', false)
            ->assertSee('>null</script>', false)
            ->assertHeader('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
    }

    public function test_authenticated_app_shell_embeds_the_minimal_current_user_payload_and_is_not_cacheable(): void
    {
        $user = User::create([
            'name' => 'Bootstrap Artist',
            'email' => 'bootstrap@example.com',
            'password' => 'strong-password-123',
            'role' => User::ROLE_ARTIST,
        ]);

        $this->actingAs($user)->get('/dashboard/artist')
            ->assertOk()
            ->assertSee('id="rad-auth-bootstrap"', false)
            ->assertSee('\\u0022id\\u0022:'.$user->id, false)
            ->assertSee('\\u0022name\\u0022:\\u0022Bootstrap Artist\\u0022', false)
            ->assertSee('\\u0022email\\u0022:\\u0022bootstrap@example.com\\u0022', false)
            ->assertSee('\\u0022role\\u0022:\\u0022artist\\u0022', false)
            ->assertHeader('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
    }

    public function test_dynamic_spa_not_found_shell_is_private_and_not_cacheable(): void
    {
        $this->get('/artworks/nonexistent-artwork-slug')
            ->assertNotFound()
            ->assertSee('id="rad-auth-bootstrap"', false)
            ->assertHeader('Cache-Control', 'private, no-store, max-age=0, must-revalidate');
    }

    public function test_guest_authentication_bootstrap_returns_a_guest_state_without_unauthorized_response(): void
    {
        $this->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertExactJson(['data' => null]);
    }

    public function test_registration_creates_an_artist_and_rotates_the_session(): void
    {
        $this->withSession(['pre_registration_marker' => 'present']);
        $beforeRegistration = session()->getId();

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'هنرمند آزمایشی',
            'email' => 'artist@example.com',
            'password' => 'strong-password-123',
            'password_confirmation' => 'strong-password-123',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.role', User::ROLE_ARTIST)
            ->assertJsonPath('data.email', 'artist@example.com');

        $this->assertDatabaseHas('users', [
            'email' => 'artist@example.com',
            'role' => User::ROLE_ARTIST,
        ]);

        $this->assertAuthenticated();
        $this->assertNotSame($beforeRegistration, session()->getId());
    }

    public function test_buyer_can_register_without_receiving_artist_permissions(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'خریدار آزمایشی',
            'email' => 'buyer@example.com',
            'password' => 'strong-password-123',
            'password_confirmation' => 'strong-password-123',
            'role' => User::ROLE_BUYER,
        ])->assertCreated()->assertJsonPath('data.role', User::ROLE_BUYER);

        $this->assertDatabaseHas('users', ['email' => 'buyer@example.com', 'role' => User::ROLE_BUYER]);
        $this->getJson('/api/v1/artist/artworks')->assertForbidden();
    }

    public function test_public_registration_cannot_assign_the_admin_role(): void
    {
        $this->postJson('/api/v1/auth/register', [
            'name' => 'کاربر آزمایشی',
            'email' => 'admin-attempt@example.com',
            'password' => 'strong-password-123',
            'password_confirmation' => 'strong-password-123',
            'role' => User::ROLE_ADMIN,
        ])->assertUnprocessable()->assertJsonValidationErrors('role');

        $this->assertDatabaseMissing('users', ['email' => 'admin-attempt@example.com']);
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
        $this->getJson('/api/v1/auth/me')->assertOk()->assertExactJson(['data' => null]);
        $this->assertGuest();
    }

    public function test_login_rotates_the_session_id_and_logout_invalidates_the_authenticated_session(): void
    {
        $user = User::create([
            'name' => 'Session Artist',
            'email' => 'session-artist@example.com',
            'password' => 'strong-password-123',
            'role' => User::ROLE_ARTIST,
        ]);

        $this->withSession(['pre_authentication_marker' => 'present']);
        $beforeLogin = session()->getId();

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'strong-password-123',
        ])->assertOk();

        $afterLogin = session()->getId();
        $this->assertNotSame($beforeLogin, $afterLogin);
        $this->assertAuthenticated();

        $this->postJson('/api/v1/auth/logout')->assertOk();

        $this->assertNotSame($afterLogin, session()->getId());
        $this->assertGuest();
        $this->getJson('/api/v1/auth/me')->assertOk()->assertExactJson(['data' => null]);
    }

    public function test_guest_login_attempts_are_rate_limited(): void
    {
        for ($attempt = 1; $attempt <= 10; $attempt++) {
            $this->postJson('/api/v1/auth/login', [
                'email' => 'rate-limit@example.com',
                'password' => 'incorrect-password',
            ])->assertUnprocessable();
        }

        $this->postJson('/api/v1/auth/login', [
            'email' => 'rate-limit@example.com',
            'password' => 'incorrect-password',
        ])->assertTooManyRequests();
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
