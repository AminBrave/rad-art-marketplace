<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageReport;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MessageSafetyTest extends TestCase
{
    use RefreshDatabase;

    public function test_participant_can_report_a_message_and_outsider_cannot(): void
    {
        [$buyer, , $conversation, $message, $outsider] = $this->fixture();

        $this->actingAs($buyer)
            ->postJson("/api/v1/conversations/{$conversation->id}/messages/{$message->id}/report", [
                'reason' => 'harassment',
                'details' => 'محتوای نامناسب',
            ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'open');

        $this->assertDatabaseHas('message_reports', [
            'conversation_id' => $conversation->id,
            'message_id' => $message->id,
            'reporter_user_id' => $buyer->id,
            'reason' => 'harassment',
            'status' => 'open',
        ]);
        $this->postJson("/api/v1/conversations/{$conversation->id}/messages/{$message->id}/report", [
            'reason' => 'harassment',
        ])->assertOk();
        $this->assertDatabaseCount('message_reports', 1);

        $this->actingAs($outsider)
            ->postJson("/api/v1/conversations/{$conversation->id}/messages/{$message->id}/report", [
                'reason' => 'spam',
            ])
            ->assertNotFound();
    }

    public function test_blocking_prevents_both_participants_from_sending_until_unblocked(): void
    {
        [$buyer, $artist, $conversation] = $this->fixture();

        $this->actingAs($buyer)
            ->postJson("/api/v1/conversations/{$conversation->id}/block")
            ->assertOk();

        $artist->artistProfile()->create([
            'slug' => 'blocked-artist-profile',
            'display_name' => 'هنرمند مسدود',
            'is_public' => true,
        ]);
        $this->actingAs($buyer)
            ->postJson('/api/v1/conversations/direct', ['artist_slug' => 'blocked-artist-profile'])
            ->assertForbidden();

        $this->actingAs($artist)
            ->postJson("/api/v1/conversations/{$conversation->id}/messages", [
                'body' => 'این پیام باید مسدود شود.',
                'client_message_id' => 'blocked-message-1',
            ])
            ->assertForbidden();

        $this->actingAs($buyer)
            ->deleteJson("/api/v1/conversations/{$conversation->id}/block")
            ->assertOk();

        $this->postJson("/api/v1/conversations/{$conversation->id}/messages", [
            'body' => 'پس از رفع مسدودسازی',
            'client_message_id' => 'unblocked-message-1',
        ])->assertCreated();

        $this->assertDatabaseCount('messages', 2);
    }

    public function test_admin_can_review_report_and_remove_reported_message_with_audit_record(): void
    {
        [$buyer, , $conversation, $message] = $this->fixture();
        $admin = $this->user('safety-admin@example.test', User::ROLE_ADMIN);
        $report = MessageReport::query()->create([
            'conversation_id' => $conversation->id,
            'message_id' => $message->id,
            'reporter_user_id' => $buyer->id,
            'reason' => 'scam',
            'details' => 'گزارش آزمایشی',
        ]);

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/message-reports')
            ->assertOk()
            ->assertJsonPath('data.0.id', $report->id)
            ->assertJsonPath('data.0.message.body', 'پیام آزمایشی');

        $this->patchJson("/api/v1/admin/message-reports/{$report->id}", [
            'action' => 'remove_message',
            'note' => 'نقض سیاست محتوایی',
        ])->assertOk();

        $this->assertSoftDeleted('messages', ['id' => $message->id]);
        $this->assertDatabaseHas('messages', ['id' => $message->id, 'body' => '']);
        $this->assertDatabaseHas('message_reports', [
            'id' => $report->id,
            'status' => 'reviewed',
            'reviewed_by_user_id' => $admin->id,
        ]);
        $this->assertDatabaseHas('message_moderation_audits', [
            'report_id' => $report->id,
            'admin_user_id' => $admin->id,
            'action' => 'remove_message',
        ]);
    }

    private function fixture(): array
    {
        $buyer = $this->user('safety-buyer@example.test', User::ROLE_BUYER);
        $artist = $this->user('safety-artist@example.test', User::ROLE_ARTIST);
        $outsider = $this->user('safety-outsider@example.test', User::ROLE_BUYER);
        $conversation = Conversation::query()->create([
            'pair_key' => $buyer->id.':'.$artist->id,
            'buyer_user_id' => $buyer->id,
            'artist_user_id' => $artist->id,
            'last_message_at' => now(),
        ]);
        $message = Message::query()->create([
            'conversation_id' => $conversation->id,
            'sender_user_id' => $buyer->id,
            'body' => 'پیام آزمایشی',
            'delivered_at' => now(),
        ]);

        return [$buyer, $artist, $conversation, $message, $outsider];
    }

    private function user(string $email, string $role): User
    {
        return User::query()->create([
            'name' => 'کاربر آزمایشی',
            'email' => $email,
            'password' => Hash::make('password'),
            'role' => $role,
        ]);
    }
}
