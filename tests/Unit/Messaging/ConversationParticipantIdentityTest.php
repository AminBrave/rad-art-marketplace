<?php

declare(strict_types=1);

namespace Tests\Unit\Messaging;

use App\Models\Conversation;
use App\Models\User;
use PHPUnit\Framework\TestCase;

final class ConversationParticipantIdentityTest extends TestCase
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
}
