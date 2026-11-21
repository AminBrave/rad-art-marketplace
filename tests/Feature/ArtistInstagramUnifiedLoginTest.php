<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ArtistProfile;
use App\Models\InstagramConnection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Client\Request as ClientRequest;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class ArtistInstagramUnifiedLoginTest extends TestCase
{
    use RefreshDatabase;

    public function test_artist_login_uses_the_meta_configuration_id_and_state_without_a_scope_list(): void
    {
        [$artist, $profile] = $this->artistWithProfile('instagram-connect@example.com');
        $this->configureMeta();

        $response = $this->actingAs($artist)->get('/dashboard/artist/instagram/connect');

        $response->assertRedirect();
        parse_str((string) parse_url($response->headers->get('Location'), PHP_URL_QUERY), $query);

        $this->assertSame('meta-app-id', $query['client_id']);
        $this->assertSame('meta-config-id', $query['config_id']);
        $this->assertSame('code', $query['response_type']);
        $this->assertSame('true', $query['override_default_response_type']);
        $this->assertArrayNotHasKey('scope', $query);
        $this->assertSame($profile->id, session('instagram_oauth.artist_profile_id'));
        $this->assertSame($query['state'], session('instagram_oauth.state'));
    }

    public function test_callback_stores_an_encrypted_token_and_only_non_binary_media_metadata(): void
    {
        [$artist, $profile] = $this->artistWithProfile('instagram-callback@example.com');
        $this->configureMeta();

        Http::fakeSequence()
            ->push(['access_token' => 'business-system-user-token', 'expires_in' => 5184000])
            ->push(['id' => 'meta-business-user'])
            ->push(['data' => [['id' => '17841400000000001', 'username' => 'rademan_artist']]])
            ->push(['data' => [[
                'id' => '17900000000000001',
                'media_type' => 'IMAGE',
                'timestamp' => '2026-11-20T10:00:00+0000',
                'permalink' => 'https://www.instagram.com/p/example/',
                'media_url' => 'https://cdn.example/private-image.jpg',
                'caption' => 'This caption is not retained.',
            ]]]);

        $response = $this->actingAs($artist)
            ->withSession(['instagram_oauth' => [
                'state' => 'valid-one-time-state',
                'artist_profile_id' => $profile->id,
            ]])
            ->get('/dashboard/artist/instagram/callback?code=one-time-code&state=valid-one-time-state');

        $response->assertRedirect('/dashboard/artist/content')
            ->assertSessionHas('status');

        $connection = InstagramConnection::query()->where('artist_profile_id', $profile->id)->firstOrFail();

        $this->assertSame('business-system-user-token', $connection->access_token);
        $this->assertSame('meta-business-user', $connection->meta_user_id);
        $this->assertSame('17841400000000001', $connection->accounts[0]['id']);
        $this->assertSame('rademan_artist', $connection->accounts[0]['username']);
        $this->assertSame('17900000000000001', $connection->media_snapshot[0]['items'][0]['id']);
        $this->assertArrayNotHasKey('media_url', $connection->media_snapshot[0]['items'][0]);
        $this->assertArrayNotHasKey('caption', $connection->media_snapshot[0]['items'][0]);
        $this->assertNotSame(
            'business-system-user-token',
            DB::table('artist_instagram_connections')->where('id', $connection->id)->value('access_token')
        );
        $this->assertSame('connected', $connection->status);
        $this->assertNotNull($connection->token_expires_at);
        $this->assertNull($connection->toArray()['access_token'] ?? null);

        Http::assertSent(fn (ClientRequest $request): bool => str_contains($request->url(), '/17841400000000001/media')
            && $request->hasHeader('Authorization', 'Bearer business-system-user-token')
            && ! str_contains($request->url(), 'media_url'));
    }

    public function test_callback_rejects_a_mismatched_state_before_contacting_meta(): void
    {
        [$artist, $profile] = $this->artistWithProfile('instagram-state@example.com');
        Http::fake();

        $this->actingAs($artist)
            ->withSession(['instagram_oauth' => [
                'state' => 'expected-state',
                'artist_profile_id' => $profile->id,
            ]])
            ->get('/dashboard/artist/instagram/callback?code=one-time-code&state=attacker-state')
            ->assertRedirect('/dashboard/artist/content')
            ->assertSessionHas('error');

        Http::assertNothingSent();
        $this->assertDatabaseCount('artist_instagram_connections', 0);
    }

    public function test_non_artist_roles_cannot_start_an_instagram_connection(): void
    {
        $buyer = User::query()->create([
            'name' => 'Buyer',
            'email' => 'instagram-buyer@example.com',
            'password' => 'strong-password-123',
            'role' => User::ROLE_BUYER,
        ]);

        $this->actingAs($buyer)
            ->get('/dashboard/artist/instagram/connect')
            ->assertForbidden();
    }

    private function configureMeta(): void
    {
        config([
            'services.instagram.app_id' => 'meta-app-id',
            'services.instagram.app_secret' => 'meta-app-secret',
            'services.instagram.config_id' => 'meta-config-id',
            'services.instagram.redirect_uri' => 'https://rademan.example/dashboard/artist/instagram/callback',
            'services.instagram.graph_version' => 'v27.0',
        ]);
    }

    private function artistWithProfile(string $email): array
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
}
