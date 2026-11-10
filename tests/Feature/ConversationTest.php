<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ArtistInquiry;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class ConversationTest extends TestCase
{
    use RefreshDatabase;

    public function test_buyer_can_open_a_private_conversation_from_their_inquiry(): void
    {
        [$buyer, $artist, $inquiry] = $this->participantsWithInquiry();

        $this->actingAs($buyer)
            ->postJson('/api/v1/inquiries/'.$inquiry->id.'/conversation')
            ->assertOk()
            ->assertJsonPath('data.inquiry_id', $inquiry->id)
            ->assertJsonPath('data.last_message.body', $inquiry->message)
            ->assertJsonPath('data.participant.name', $artist->name);

        $this->assertDatabaseHas('conversations', [
            'inquiry_id' => $inquiry->id,
            'buyer_user_id' => $buyer->id,
            'artist_user_id' => $artist->id,
        ]);
        $this->assertDatabaseCount('messages', 1);
    }

    public function test_artist_can_reply_and_buyer_can_read_and_mark_the_reply_as_read(): void
    {
        [$buyer, $artist, $inquiry] = $this->participantsWithInquiry();
        $conversation = $this->openConversationAsBuyer($buyer, $inquiry);

        $this->actingAs($artist)
            ->postJson('/api/v1/conversations/'.$conversation->id.'/messages', [
                'body' => 'با سپاس، اطلاعات تکمیلی اثر را ارسال می‌کنم.',
                'client_message_id' => 'artist-reply-1',
            ])
            ->assertCreated()
            ->assertJsonPath('data.sender_id', $artist->id)
            ->assertJsonPath('data.body', 'با سپاس، اطلاعات تکمیلی اثر را ارسال می‌کنم.');

        $this->actingAs($buyer)
            ->getJson('/api/v1/conversations/'.$conversation->id.'/messages')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.1.sender_id', $artist->id)
            ->assertJsonPath('data.1.read_at', null);

        $this->actingAs($buyer)
            ->patchJson('/api/v1/conversations/'.$conversation->id.'/read')
            ->assertOk()
            ->assertJsonPath('data.updated_messages', 1);

        $this->assertNotNull($conversation->messages()->where('sender_user_id', $artist->id)->firstOrFail()->fresh()->read_at);
    }

    public function test_message_sending_is_idempotent_for_a_client_message_id(): void
    {
        [$buyer, , $inquiry] = $this->participantsWithInquiry();
        $conversation = $this->openConversationAsBuyer($buyer, $inquiry);
        $payload = ['body' => 'پیام آزمایشی برای جلوگیری از ارسال تکراری.', 'client_message_id' => 'retry-001'];

        $this->actingAs($buyer)
            ->postJson('/api/v1/conversations/'.$conversation->id.'/messages', $payload)
            ->assertCreated();

        $this->postJson('/api/v1/conversations/'.$conversation->id.'/messages', $payload)
            ->assertOk()
            ->assertJsonPath('data.body', $payload['body']);

        $this->assertDatabaseCount('messages', 2);
    }

    public function test_non_participants_cannot_read_or_mutate_a_conversation(): void
    {
        [$buyer, , $inquiry] = $this->participantsWithInquiry();
        $conversation = $this->openConversationAsBuyer($buyer, $inquiry);
        $outsider = $this->makeUser('outsider@example.test', User::ROLE_BUYER);

        $this->actingAs($outsider)
            ->getJson('/api/v1/conversations/'.$conversation->id)
            ->assertNotFound();

        $this->postJson('/api/v1/conversations/'.$conversation->id.'/messages', [
            'body' => 'این پیام نباید ارسال شود.',
        ])->assertNotFound();

        $this->patchJson('/api/v1/conversations/'.$conversation->id.'/read')
            ->assertNotFound();
    }

    public function test_users_cannot_reply_to_a_message_from_another_conversation(): void
    {
        [$buyer, , $inquiry] = $this->participantsWithInquiry();
        [, , $otherInquiry] = $this->participantsWithInquiry('other-buyer@example.test', 'other-artist@example.test');
        $conversation = $this->openConversationAsBuyer($buyer, $inquiry);
        $otherConversation = $this->openConversationAsBuyer($otherInquiry->sender, $otherInquiry);
        $otherMessage = $otherConversation->messages()->firstOrFail();

        $this->actingAs($buyer)
            ->postJson('/api/v1/conversations/'.$conversation->id.'/messages', [
                'body' => 'پاسخ نامعتبر',
                'reply_to_id' => $otherMessage->id,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('reply_to_id');
    }


    public function test_message_sender_can_edit_and_delete_own_message_without_retaining_deleted_body(): void
    {
        [$buyer, $artist, $inquiry] = $this->participantsWithInquiry();
        $conversation = $this->openConversationAsBuyer($buyer, $inquiry);
        $message = $conversation->messages()->firstOrFail();

        $edited = $this->actingAs($buyer)
            ->patchJson('/api/v1/conversations/'.$conversation->id.'/messages/'.$message->id, [
                'body' => 'متن ویرایش‌شده پیام اولیه',
            ])
            ->assertOk()
            ->assertJsonPath('data.body', 'متن ویرایش‌شده پیام اولیه');
        $this->assertNotNull($edited->json('data.edited_at'));

        $this->actingAs($artist)
            ->patchJson('/api/v1/conversations/'.$conversation->id.'/messages/'.$message->id, [
                'body' => 'تغییر غیرمجاز',
            ])
            ->assertNotFound();

        $deleted = $this->actingAs($buyer)
            ->deleteJson('/api/v1/conversations/'.$conversation->id.'/messages/'.$message->id)
            ->assertOk()
            ->assertJsonPath('data.body', null);
        $this->assertNotNull($deleted->json('data.deleted_at'));

        $this->assertDatabaseHas('messages', [
            'id' => $message->id,
            'body' => '',
        ]);
        $this->assertSoftDeleted('messages', ['id' => $message->id]);
    }

    public function test_participants_can_add_and_remove_idempotent_message_reactions(): void
    {
        [$buyer, $artist, $inquiry] = $this->participantsWithInquiry();
        $conversation = $this->openConversationAsBuyer($buyer, $inquiry);
        $message = $conversation->messages()->firstOrFail();

        $payload = ['emoji' => '❤️', 'action' => 'add'];

        $this->actingAs($artist)
            ->postJson('/api/v1/conversations/'.$conversation->id.'/messages/'.$message->id.'/reactions', $payload)
            ->assertOk()
            ->assertJsonPath('data.reactions.0.emoji', '❤️')
            ->assertJsonPath('data.reactions.0.count', 1)
            ->assertJsonPath('data.reactions.0.reacted_by_me', true);

        $this->postJson('/api/v1/conversations/'.$conversation->id.'/messages/'.$message->id.'/reactions', $payload)
            ->assertOk()
            ->assertJsonPath('data.reactions.0.count', 1);

        $this->assertDatabaseCount('message_reactions', 1);

        $this->postJson('/api/v1/conversations/'.$conversation->id.'/messages/'.$message->id.'/reactions', [
            'emoji' => '❤️',
            'action' => 'remove',
        ])->assertOk()->assertJsonCount(0, 'data.reactions');

        $this->assertDatabaseCount('message_reactions', 0);
    }

    public function test_message_reply_returns_quoted_message_context(): void
    {
        [$buyer, , $inquiry] = $this->participantsWithInquiry();
        $conversation = $this->openConversationAsBuyer($buyer, $inquiry);
        $original = $conversation->messages()->firstOrFail();

        $this->actingAs($buyer)
            ->postJson('/api/v1/conversations/'.$conversation->id.'/messages', [
                'body' => 'پاسخ به پیام قبلی',
                'reply_to_id' => $original->id,
                'client_message_id' => 'reply-context-1',
            ])
            ->assertCreated()
            ->assertJsonPath('data.reply_to.id', $original->id)
            ->assertJsonPath('data.reply_to.body', $inquiry->message);
    }
\n    private function participantsWithInquiry(
        string $buyerEmail = 'buyer@example.test',
        string $artistEmail = 'artist@example.test'
    ): array {
        $buyer = $this->makeUser($buyerEmail, User::ROLE_BUYER);
        $artist = $this->makeUser($artistEmail, User::ROLE_ARTIST);
        $profile = $artist->artistProfile()->create([
            'slug' => 'profile-'.str_replace(['@', '.'], '-', $artistEmail),
            'display_name' => 'هنرمند آزمایشی',
            'is_public' => true,
        ]);
        $inquiry = ArtistInquiry::query()->create([
            'artist_profile_id' => $profile->id,
            'sender_user_id' => $buyer->id,
            'subject' => 'پرسش درباره اثر',
            'message' => 'مایلم درباره جزئیات این اثر اطلاعات بیشتری دریافت کنم.',
            'status' => ArtistInquiry::STATUS_NEW,
        ]);

        return [$buyer, $artist, $inquiry];
    }

    private function openConversationAsBuyer(User $buyer, ArtistInquiry $inquiry): Conversation
    {
        $this->actingAs($buyer)
            ->postJson('/api/v1/inquiries/'.$inquiry->id.'/conversation')
            ->assertOk();

        return Conversation::query()->where('inquiry_id', $inquiry->id)->firstOrFail();
    }

    private function makeUser(string $email, string $role): User
    {
        return User::query()->create([
            'name' => 'آزمایش کاربر',
            'email' => $email,
            'password' => Hash::make('password'),
            'role' => $role,
        ]);
    }
}
