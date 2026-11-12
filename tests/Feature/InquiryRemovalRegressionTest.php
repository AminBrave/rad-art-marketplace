<?php

declare(strict_types=1);

namespace Tests\Feature;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Schema;
use Tests\TestCase;

final class InquiryRemovalRegressionTest extends TestCase
{
    use RefreshDatabase;

    public function test_legacy_inquiry_schema_and_routes_are_removed_while_direct_messaging_remains(): void
    {
        self::assertFalse(Schema::hasTable('artist_inquiries'));
        self::assertFalse(Schema::hasColumn('conversations', 'inquiry_id'));
        self::assertFalse(Schema::hasColumn('conversation_contexts', 'inquiry_id'));

        self::assertFalse(Route::has('api.v1.artists.inquiries.store'));
        self::assertFalse(Route::has('api.v1.buyer.inquiries.index'));
        self::assertFalse(Route::has('api.v1.buyer.inquiries.show'));
        self::assertFalse(Route::has('api.v1.artist.inquiries.index'));
        self::assertFalse(Route::has('api.v1.artist.inquiries.show'));
        self::assertFalse(Route::has('api.v1.artist.inquiries.update'));
        self::assertFalse(Route::has('api.v1.conversations.start'));

        self::assertTrue(Route::has('api.v1.conversations.direct'));
        self::assertTrue(Route::has('api.v1.conversations.show'));
        self::assertTrue(Route::has('api.v1.conversations.messages.store'));
        self::assertTrue(Route::has('api.v1.buyer.conversations.index'));
        self::assertTrue(Route::has('api.v1.artist.conversations.index'));
    }
}
