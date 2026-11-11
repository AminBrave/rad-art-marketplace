<?php

declare(strict_types=1);

namespace Tests\Unit\Messaging;

use App\Models\Conversation;
use App\Models\User;
use PHPUnit\Framework\TestCase;

final class ConversationTest extends TestCase
{
    public function test_participant_id_is_returned_only_for_the_buyer_or_artist(): void
    {
        $conversation = new Conversation([
            'buyer_user_id' => 10,
            'artist_user_id' => 20,
        ]);

        $buyer = (new User)->forceFill(['id' => 10]);
        $artist = (new User)->forceFill(['id' => 20]);
        $outsider = (new User)->forceFill(['id' => 30]);

        self::assertSame(10, $conversation->participantIdFor($buyer));
        self::assertSame(20, $conversation->participantIdFor($artist));
        self::assertNull($conversation->participantIdFor($outsider));
    }

    public function test_archived_timestamp_is_selected_for_the_current_participant(): void
    {
        $buyerArchivedAt = '2026-11-01 10:00:00';
        $artistArchivedAt = '2026-11-02 11:00:00';
        $conversation = new Conversation([
            'buyer_user_id' => 10,
            'artist_user_id' => 20,
            'buyer_archived_at' => $buyerArchivedAt,
            'artist_archived_at' => $artistArchivedAt,
        ]);

        $buyer = (new User)->forceFill(['id' => 10]);
        $artist = (new User)->forceFill(['id' => 20]);

        self::assertSame($buyerArchivedAt, $conversation->archivedAtFor($buyer)?->toDateTimeString());
        self::assertSame($artistArchivedAt, $conversation->archivedAtFor($artist)?->toDateTimeString());
    }
}
