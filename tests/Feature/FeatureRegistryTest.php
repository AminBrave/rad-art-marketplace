<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Tests\TestCase;

final class FeatureRegistryTest extends TestCase
{
    use RefreshDatabase;

    public function test_inquiries_are_disabled_at_the_server_boundary_by_default(): void
    {
        self::assertFalse(config('features.inquiries'));

        self::assertFalse(Route::has('api.v1.artists.inquiries.store'));
        self::assertFalse(Route::has('api.v1.buyer.inquiries.index'));
        self::assertFalse(Route::has('api.v1.buyer.inquiries.show'));
        self::assertFalse(Route::has('api.v1.artist.inquiries.index'));
        self::assertFalse(Route::has('api.v1.artist.inquiries.show'));
        self::assertFalse(Route::has('api.v1.artist.inquiries.update'));
        self::assertFalse(Route::has('api.v1.conversations.start'));

        $this->getJson('/api/v1/buyer/inquiries')->assertNotFound();
        $this->getJson('/api/v1/artist/inquiries')->assertNotFound();
    }

    public function test_direct_messaging_routes_remain_registered_when_inquiries_are_disabled(): void
    {
        self::assertTrue(config('features.messaging'));
        self::assertTrue(Route::has('api.v1.conversations.direct'));
        self::assertTrue(Route::has('api.v1.conversations.show'));
        self::assertTrue(Route::has('api.v1.conversations.messages.store'));
        self::assertTrue(Route::has('api.v1.buyer.conversations.index'));
        self::assertTrue(Route::has('api.v1.artist.conversations.index'));
    }
}
