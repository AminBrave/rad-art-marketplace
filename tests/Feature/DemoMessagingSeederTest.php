<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ArtistProfile;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Database\Seeders\DemoDatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DemoMessagingSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_seed_creates_conversations_between_every_buyer_and_public_artist(): void
    {
        $this->seed(DemoDatabaseSeeder::class);

        $buyers = User::query()
            ->where('role', User::ROLE_BUYER)
            ->where('email', '!=', 'buyer-empty@rademan.test')
            ->get();
        $emptyBuyer = User::query()->where('email', 'buyer-empty@rademan.test')->firstOrFail();
        $publicArtists = ArtistProfile::query()->where('is_public', true)->with('user')->get();

        $this->assertCount(4, $buyers);
        $this->assertSame(0, Conversation::query()->where('buyer_user_id', $emptyBuyer->id)->count());
        $this->assertCount(14, $publicArtists);
        $this->assertDatabaseCount('conversations', $buyers->count() * $publicArtists->count());
        $this->assertGreaterThanOrEqual($buyers->count() * $publicArtists->count() * 2, Message::query()->count());

        foreach ($buyers as $buyer) {
            foreach ($publicArtists as $profile) {
                $artist = $profile->user;
                $conversation = Conversation::query()
                    ->where('pair_key', $buyer->id.':'.$artist->id)
                    ->first();

                $this->assertNotNull($conversation, "Missing conversation for buyer {$buyer->id} and artist {$artist->id}.");
                $this->assertGreaterThanOrEqual(2, $conversation->messages()->count());
                $this->assertSame($buyer->id, $conversation->messages()->oldest('id')->firstOrFail()->sender_user_id);
                $this->assertSame($artist->id, $conversation->messages()->latest('id')->firstOrFail()->sender_user_id);
            }
        }
    }

    public function test_demo_messaging_seed_is_idempotent(): void
    {
        $this->seed(DemoDatabaseSeeder::class);
        $conversationCount = Conversation::query()->count();
        $messageCount = Message::query()->count();

        $this->seed(DemoDatabaseSeeder::class);

        $this->assertSame($conversationCount, Conversation::query()->count());
        $this->assertSame($messageCount, Message::query()->count());
    }
}
