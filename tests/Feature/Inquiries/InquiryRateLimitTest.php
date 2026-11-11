<?php

declare(strict_types=1);

namespace Tests\Feature\Inquiries;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class InquiryRateLimitTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['features.inquiries' => true]);
    }

    public function test_buyer_inquiry_submission_is_limited_to_five_requests_per_minute(): void
    {
        $artist = User::query()->create([
            'name' => 'هنرمند محدودیت درخواست',
            'email' => 'inquiry-limit-artist@example.test',
            'password' => 'strong-password-123',
            'role' => User::ROLE_ARTIST,
        ]);
        $profile = $artist->artistProfile()->create([
            'slug' => 'inquiry-limit-artist',
            'display_name' => 'هنرمند محدودیت درخواست',
            'is_public' => true,
        ]);
        $buyer = User::query()->create([
            'name' => 'خریدار محدودیت درخواست',
            'email' => 'inquiry-limit-buyer@example.test',
            'password' => 'strong-password-123',
            'role' => User::ROLE_BUYER,
        ]);

        $this->actingAs($buyer);

        $payload = [
            'subject' => 'پرسش درباره اثر',
            'message' => 'سلام، درباره جزئیات اثر و شرایط تهیه آن پرسشی دارم.',
        ];

        for ($attempt = 1; $attempt <= 5; $attempt++) {
            $this->postJson('/api/v1/artists/'.$profile->slug.'/inquiries', $payload)
                ->assertCreated();
        }

        $this->postJson('/api/v1/artists/'.$profile->slug.'/inquiries', $payload)
            ->assertTooManyRequests();

        self::assertDatabaseCount('artist_inquiries', 5);
    }
}
