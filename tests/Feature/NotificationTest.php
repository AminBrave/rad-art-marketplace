<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\User;
use App\Notifications\MessageReceivedNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
use Tests\TestCase;

final class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_notification_feed_is_private_and_read_actions_update_the_unread_count(): void
    {
        $buyer = $this->user('notification-buyer@example.test', User::ROLE_BUYER);
        $artist = $this->user('notification-artist@example.test', User::ROLE_ARTIST);
        $outsider = $this->user('notification-outsider@example.test', User::ROLE_BUYER);
        $conversation = Conversation::query()->create([
            'pair_key' => $buyer->id.':'.$artist->id,
            'buyer_user_id' => $buyer->id,
            'artist_user_id' => $artist->id,
            'last_message_at' => now(),
        ]);
        $notification = $this->notification($buyer, $conversation, 101, null);
        $this->notification($buyer, $conversation, 102, now()->subMinute());
        $otherNotification = $this->notification($outsider, $conversation, 103, null);

        $this->getJson('/api/v1/notifications')->assertUnauthorized();

        $this->actingAs($buyer)
            ->getJson('/api/v1/notifications')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('unread_count', 1)
            ->assertJsonPath('data.0.sender_name', 'فرستنده آزمایشی');

        $this->patchJson('/api/v1/notifications/'.$notification->id.'/read')->assertOk();
        $this->getJson('/api/v1/notifications')->assertOk()->assertJsonPath('unread_count', 0);

        $this->patchJson('/api/v1/notifications/'.$otherNotification->id.'/read')->assertNotFound();

        $this->notification($buyer, $conversation, 104, null);
        $this->patchJson('/api/v1/notifications/read-all')
            ->assertOk()
            ->assertJsonPath('data.updated_notifications', 1);

        $this->getJson('/api/v1/notifications')->assertOk()->assertJsonPath('unread_count', 0);
    }

    public function test_sending_messages_notifies_only_an_unmuted_recipient_with_notifications_enabled(): void
    {
        $buyer = $this->user('notification-sender@example.test', User::ROLE_BUYER);
        $artist = $this->user('notification-recipient@example.test', User::ROLE_ARTIST);
        $conversation = Conversation::query()->create([
            'pair_key' => $buyer->id.':'.$artist->id,
            'buyer_user_id' => $buyer->id,
            'artist_user_id' => $artist->id,
            'last_message_at' => now(),
        ]);

        $this->actingAs($buyer)
            ->postJson('/api/v1/conversations/'.$conversation->id.'/messages', [
                'body' => 'پیام دارای اعلان',
                'client_message_id' => 'notification-enabled-1',
            ])
            ->assertCreated();

        $this->assertDatabaseHas('notifications', [
            'notifiable_id' => $artist->id,
            'type' => MessageReceivedNotification::class,
        ]);

        $artist->forceFill(['notification_preferences' => ['in_app_messages' => false]])->save();
        $this->postJson('/api/v1/conversations/'.$conversation->id.'/messages', [
            'body' => 'اعلان این پیام غیرفعال است',
            'client_message_id' => 'notification-disabled-1',
        ])->assertCreated();
        $this->assertDatabaseCount('notifications', 1);

        $artist->forceFill(['notification_preferences' => ['in_app_messages' => true]])->save();
        $conversation->forceFill(['artist_muted_at' => now()])->save();
        $this->postJson('/api/v1/conversations/'.$conversation->id.'/messages', [
            'body' => 'گفتگوی بی‌صدا نباید اعلان بسازد',
            'client_message_id' => 'notification-muted-1',
        ])->assertCreated();
        $this->assertDatabaseCount('notifications', 1);
    }

    public function test_message_notification_preferences_keep_email_disabled(): void
    {
        $buyer = $this->user('notification-preferences@example.test', User::ROLE_BUYER);

        $this->actingAs($buyer)
            ->getJson('/api/v1/notifications/preferences')
            ->assertOk()
            ->assertJsonPath('data.in_app_messages', true)
            ->assertJsonPath('data.email_messages', false)
            ->assertJsonPath('data.email_available', false);

        $this->patchJson('/api/v1/notifications/preferences', ['in_app_messages' => false])
            ->assertOk()
            ->assertJsonPath('data.in_app_messages', false)
            ->assertJsonPath('data.email_messages', false)
            ->assertJsonPath('data.email_available', false);

        $this->assertFalse($buyer->fresh()->messageNotificationPreferences()['in_app_messages']);
    }

    private function notification(User $recipient, Conversation $conversation, int $messageId, mixed $readAt): DatabaseNotification
    {
        return DatabaseNotification::query()->create([
            'id' => sprintf('00000000-0000-4000-8000-%012d', $messageId),
            'type' => MessageReceivedNotification::class,
            'notifiable_type' => User::class,
            'notifiable_id' => $recipient->id,
            'data' => [
                'kind' => 'message_received',
                'conversation_id' => $conversation->id,
                'message_id' => $messageId,
                'sender_name' => 'فرستنده آزمایشی',
            ],
            'read_at' => $readAt,
        ]);
    }

    private function user(string $email, string $role): User
    {
        return User::query()->create([
            'name' => 'کاربر اعلان',
            'email' => $email,
            'password' => 'strong-password-123',
            'role' => $role,
        ]);
    }
}
