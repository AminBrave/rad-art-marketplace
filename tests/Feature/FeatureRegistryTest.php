<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ArtistInquiry;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

final class FeatureRegistryTest extends TestCase
{
    use RefreshDatabase;

    public function test_inquiries_are_disabled_at_the_server_boundary_by_default(): void
    {
        self::assertFalse(config('features.inquiries'));

        self::assertTrue(Route::has('api.v1.artists.inquiries.store'));
        self::assertTrue(Route::has('api.v1.buyer.inquiries.index'));
        self::assertTrue(Route::has('api.v1.buyer.inquiries.show'));
        self::assertTrue(Route::has('api.v1.artist.inquiries.index'));
        self::assertTrue(Route::has('api.v1.artist.inquiries.show'));
        self::assertTrue(Route::has('api.v1.artist.inquiries.update'));
        self::assertTrue(Route::has('api.v1.conversations.start'));

        $buyer = User::query()->create(['name' => 'Feature buyer', 'email' => 'feature-buyer@example.test', 'password' => 'strong-password-123', 'role' => User::ROLE_BUYER]);
        $artist = User::query()->create(['name' => 'Feature artist', 'email' => 'feature-artist@example.test', 'password' => 'strong-password-123', 'role' => User::ROLE_ARTIST]);
        $profile = $artist->artistProfile()->create([
            'slug' => 'feature-artist',
            'display_name' => 'Feature artist',
            'is_public' => true,
        ]);
        $inquiry = ArtistInquiry::query()->create([
            'artist_profile_id' => $profile->id,
            'sender_user_id' => $buyer->id,
            'subject' => 'Feature gate test',
            'message' => 'This inquiry is retained but unavailable.',
            'status' => ArtistInquiry::STATUS_NEW,
        ]);

        $this->actingAs($buyer)->getJson('/api/v1/buyer/inquiries')->assertNotFound();
        $this->actingAs($buyer)->getJson('/api/v1/buyer/inquiries/'.$inquiry->id)->assertNotFound();
        $this->actingAs($artist)->getJson('/api/v1/artist/inquiries')->assertNotFound();
        $this->actingAs($artist)->getJson('/api/v1/artist/inquiries/'.$inquiry->id)->assertNotFound();
        $this->actingAs($artist)->patchJson('/api/v1/artist/inquiries/'.$inquiry->id, ['status' => ArtistInquiry::STATUS_READ])->assertNotFound();
        $this->actingAs($buyer)->postJson('/api/v1/artists/'.$profile->slug.'/inquiries', [])->assertNotFound();
        $this->actingAs($buyer)->postJson('/api/v1/inquiries/'.$inquiry->id.'/conversation')->assertNotFound();
    }

    public function test_direct_messaging_routes_remain_registered_when_inquiries_are_disabled(): void
    {
        self::assertTrue(Route::has('api.v1.conversations.direct'));
        self::assertTrue(Route::has('api.v1.conversations.show'));
        self::assertTrue(Route::has('api.v1.conversations.messages.store'));
        self::assertTrue(Route::has('api.v1.buyer.conversations.index'));
        self::assertTrue(Route::has('api.v1.artist.conversations.index'));
    }
}
