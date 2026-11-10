<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ConversationInboxSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_buyer_can_search_filter_archive_and_mute_only_their_conversation_view(): void
    {
        [$buyer, $artist, $conversation, $message] = $this->fixture();

        $this->actingAs($buyer)
            ->getJson('/api/v1/buyer/conversations?search=Artist%20Inbox')
            ->assertOk()
            ->assertJsonPath('data.0.id', $conversation->id);

        $this->getJson('/api/v1/buyer/conversations?search=not-a-match')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->patchJson("/api/v1/conversations/{$conversation->id}/settings", [
            'archived' => true,
            'muted' => true,
        ])->assertOk()
            ->assertJsonPath('data.archived', true)
            ->assertJsonPath('data.muted', true);

        $this->getJson('/api/v1/buyer/conversations')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->getJson('/api/v1/buyer/conversations?filter=archived')
            ->assertOk()
            ->assertJsonPath('data.0.id', $conversation->id)
            ->assertJsonPath('data.0.archived', true)
            ->assertJsonPath('data.0.muted', true);

        $this->actingAs($artist)
            ->getJson('/api/v1/artist/conversations')
            ->assertOk()
            ->assertJsonPath('data.0.id', $conversation->id)
            ->assertJsonPath('data.0.archived', false)
            ->assertJsonPath('data.0.muted', false);

        $this->actingAs($buyer)
            ->getJson('/api/v1/buyer/conversations?filter=unread')
            ->assertOk()
            ->assertJsonCount(0, 'data');
    }

    public function test_unread_filter_only_returns_conversations_with_unread_messages(): void
    {
        [$buyer, $artist, $conversation] = $this->fixture();

        $this->actingAs($artist)->postJson("/api/v1/conversations/{$conversation->id}/messages", [
            'body' => 'پیام خوانده‌نشده',
            'client_message_id' => 'inbox-unread-1',
        ])->assertCreated();

        $this->actingAs($buyer)
            ->getJson('/api/v1/buyer/conversations?filter=unread')
            ->assertOk()
            ->assertJsonPath('data.0.id', $conversation->id)
            ->assertJsonPath('data.0.unread_count', 1);
    }

    private function fixture(): array
    {
        $buyer = $this->user('inbox-buyer@example.test', User::ROLE_BUYER, 'Buyer Inbox');
        $artist = $this->user('inbox-artist@example.test', User::ROLE_ARTIST, 'Artist Inbox');
        $conversation = Conversation::query()->create([
            'pair_key' => $buyer->id.':'.$artist->id,
            'buyer_user_id' => $buyer->id,
            'artist_user_id' => $artist->id,
            'last_message_at' => now(),
        ]);
        $message = Message::query()->create([
            'conversation_id' => $conversation->id,
            'sender_user_id' => $buyer->id,
            'body' => 'پیام اولیه',
            'delivered_at' => now(),
        ]);

        return [$buyer, $artist, $conversation, $message];
    }

    private function user(string $email, string $role, string $name): User
    {
        return User::query()->create([
            'name' => $name,
            'email' => $email,
            'password' => Hash::make('password'),
            'role' => $role,
        ]);
    }
}
