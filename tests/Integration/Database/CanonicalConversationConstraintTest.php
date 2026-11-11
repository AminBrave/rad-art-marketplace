<?php

declare(strict_types=1);

namespace Tests\Integration\Database;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

final class CanonicalConversationConstraintTest extends TestCase
{
    use RefreshDatabase;

    public function test_database_rejects_a_second_canonical_conversation_for_the_same_buyer_artist_pair(): void
    {
        $buyer = User::query()->create([
            'name' => 'Buyer',
            'email' => 'canonical-buyer@example.test',
            'password' => 'strong-password-123',
            'role' => User::ROLE_BUYER,
        ]);
        $artist = User::query()->create([
            'name' => 'Artist',
            'email' => 'canonical-artist@example.test',
            'password' => 'strong-password-123',
            'role' => User::ROLE_ARTIST,
        ]);

        Conversation::query()->create([
            'pair_key' => $buyer->id.':'.$artist->id,
            'buyer_user_id' => $buyer->id,
            'artist_user_id' => $artist->id,
        ]);

        $this->expectException(QueryException::class);

        Conversation::query()->create([
            'pair_key' => $buyer->id.':'.$artist->id,
            'buyer_user_id' => $buyer->id,
            'artist_user_id' => $artist->id,
        ]);
    }
}
