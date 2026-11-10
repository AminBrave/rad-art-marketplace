<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MessageNotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_new_message_creates_one_private_notification_for_the_other_participant(): void
    {
        [$buyer, $artist, $conversation] = $this->conversation();

        $payload = ['body' => 'متن خصوصی پیام', 'client_message_id' => 'notify-once-1'];

        $this->actingAs($buyer)
            ->postJson('/api/v1/conversations/'.$conversation->id.'/messages', $payload)
            ->assertCreated();

        $this->postJson('/api/v1/conversations/'.$conversation->id.'/messages', $payload)
            ->assertOk();

        $this->assertDatabaseCount('notifications', 1);
        $this->assertSame(1, $artist->notifications()->count());
        $this->assertSame(0, $buyer->notifications()->count());

        $notification = $artist->notifications()->firstOrFail();
        $this->assertSame('message_received', $notification->data['kind']);
        $this->assertSame($conversation->id, $notification->data['conversation_id']);
        $this->assertSame('خریدار آزمایشی', $notification->data['sender_name']);
        $this->assertArrayNotHasKey('body', $notification->data);
        $this->assertArrayNotHasKey('email', $notification->data);
    }

    public function test_notification_list_and_read_actions_are_scoped_to_the_recipient(): void
    {
        [$buyer, $artist, $conversation, $outsider] = $this->conversation();

        $this->actingAs($buyer)->postJson('/api/v1/conversations/'.$conversation->id.'/messages', [
            'body' => 'پیام برای هنرمند',
            'client_message_id' => 'notify-scope-1',
        ])->assertCreated();

        $notification = $artist->notifications()->firstOrFail();

        $this->actingAs($artist)
            ->getJson('/api/v1/notifications')
            ->assertOk()
            ->assertJsonPath('unread_count', 1)
            ->assertJsonPath('data.0.conversation_id', $conversation->id)
            ->assertJsonPath('data.0.sender_name', 'خریدار آزمایشی');

        $this->actingAs($buyer)
            ->getJson('/api/v1/notifications')
            ->assertOk()
            ->assertJsonPath('unread_count', 0)
            ->assertJsonCount(0, 'data');

        $this->actingAs($outsider)
            ->patchJson('/api/v1/notifications/'.$notification->id.'/read')
            ->assertNotFound();

        $this->actingAs($artist)
            ->patchJson('/api/v1/notifications/'.$notification->id.'/read')
            ->assertOk();

        $this->getJson('/api/v1/notifications')
            ->assertOk()
            ->assertJsonPath('unread_count', 0);
    }

    public function test_in_app_preference_can_disable_notifications_and_email_remains_unavailable(): void
    {
        [$buyer, $artist, $conversation] = $this->conversation();

        $this->actingAs($buyer)
            ->patchJson('/api/v1/notifications/preferences', ['in_app_messages' => false])
            ->assertOk()
            ->assertJsonPath('data.in_app_messages', false)
            ->assertJsonPath('data.email_messages', false)
            ->assertJsonPath('data.email_available', false);

        $this->actingAs($artist)->postJson('/api/v1/conversations/'.$conversation->id.'/messages', [
            'body' => 'پیام پس از خاموش‌کردن اعلان',
            'client_message_id' => 'notify-disabled-1',
        ])->assertCreated();

        $this->actingAs($buyer)
            ->getJson('/api/v1/notifications')
            ->assertOk()
            ->assertJsonPath('unread_count', 0)
            ->assertJsonCount(0, 'data');
    }

    public function test_muted_conversation_suppresses_in_app_message_notifications_for_that_participant(): void
    {
        [$buyer, $artist, $conversation] = $this->conversation();

        $this->actingAs($artist)
            ->patchJson('/api/v1/conversations/'.$conversation->id.'/settings', ['muted' => true])
            ->assertOk()
            ->assertJsonPath('data.muted', true);

        $this->actingAs($buyer)
            ->postJson('/api/v1/conversations/'.$conversation->id.'/messages', [
                'body' => 'پیام در گفتگوی بی‌صدا',
                'client_message_id' => 'notify-muted-1',
            ])
            ->assertCreated();

        $this->assertDatabaseCount('notifications', 0);
        $this->assertSame(0, $artist->notifications()->count());
    }

    public function test_mark_all_read_only_updates_the_current_users_message_notifications(): void
    {
        [$buyer, $artist, $conversation] = $this->conversation();

        $this->actingAs($buyer)->postJson('/api/v1/conversations/'.$conversation->id.'/messages', [
            'body' => 'پیام اول',
            'client_message_id' => 'notify-all-1',
        ])->assertCreated();

        $this->actingAs($buyer)->postJson('/api/v1/conversations/'.$conversation->id.'/messages', [
            'body' => 'پیام دوم',
            'client_message_id' => 'notify-all-2',
        ])->assertCreated();

        $this->actingAs($artist)
            ->patchJson('/api/v1/notifications/read-all')
            ->assertOk()
            ->assertJsonPath('data.updated_notifications', 2);

        $this->getJson('/api/v1/notifications')
            ->assertOk()
            ->assertJsonPath('unread_count', 0);

        $this->assertSame(0, $buyer->unreadNotifications()->count());
    }

    private function conversation(): array
    {
        $buyer = User::query()->create([
            'name' => 'خریدار آزمایشی',
            'email' => 'notification-buyer@example.test',
            'password' => Hash::make('password'),
            'role' => User::ROLE_BUYER,
        ]);
        $artist = User::query()->create([
            'name' => 'هنرمند آزمایشی',
            'email' => 'notification-artist@example.test',
            'password' => Hash::make('password'),
            'role' => User::ROLE_ARTIST,
        ]);
        $outsider = User::query()->create([
            'name' => 'کاربر دیگر',
            'email' => 'notification-outsider@example.test',
            'password' => Hash::make('password'),
            'role' => User::ROLE_BUYER,
        ]);

        $conversation = Conversation::query()->create([
            'pair_key' => $buyer->id.':'.$artist->id,
            'buyer_user_id' => $buyer->id,
            'artist_user_id' => $artist->id,
            'last_message_at' => now(),
        ]);

        return [$buyer, $artist, $conversation, $outsider];
    }
}
