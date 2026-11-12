<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Artwork;
use App\Models\Category;
use App\Models\Conversation;
use App\Models\MessageAttachment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class ConversationTest extends TestCase
{
    use RefreshDatabase;

    public function test_artist_can_reply_and_buyer_can_read_and_mark_the_reply_as_read(): void
    {
        [$buyer, $artist, $conversation] = $this->participantsWithConversation();

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

    public function test_incremental_message_fetch_returns_only_messages_after_the_cursor(): void
    {
        [$buyer, $artist, $conversation] = $this->participantsWithConversation();
        $firstMessage = $conversation->messages()->firstOrFail();

        $this->actingAs($artist)
            ->postJson('/api/v1/conversations/'.$conversation->id.'/messages', [
                'body' => 'پیام جدید برای دریافت افزایشی',
                'client_message_id' => 'incremental-message-1',
            ])
            ->assertCreated();

        $newMessage = $conversation->messages()->where('client_message_id', 'incremental-message-1')->firstOrFail();

        $incremental = $this->actingAs($buyer)
            ->getJson('/api/v1/conversations/'.$conversation->id.'/messages?after_id='.$firstMessage->id)
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.body', 'پیام جدید برای دریافت افزایشی')
            ->assertJsonPath('current_page', 1)
            ->assertJsonStructure(['sync_cursor']);
        $syncCursor = now()->subMinute()->toISOString(); // Keep the timestamp-overlap assertion deterministic across database precision.

        $this->patchJson('/api/v1/conversations/'.$conversation->id.'/messages/'.$firstMessage->id, [
            'body' => 'پیام قدیمی ویرایش شد',
        ])->assertOk();

        $this->getJson('/api/v1/conversations/'.$conversation->id.'/messages?after_id='.$newMessage->id.'&updated_after='.urlencode($syncCursor))
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('data.0.id', $firstMessage->id)
            ->assertJsonPath('data.0.body', 'پیام قدیمی ویرایش شد');

        $this->getJson('/api/v1/conversations/'.$conversation->id.'/messages?after_id=invalid')
            ->assertUnprocessable();
    }

    public function test_conversation_history_can_be_loaded_in_older_pages_without_losing_order(): void
    {
        [$buyer, $artist, $conversation] = $this->participantsWithConversation();
        $initialMessage = $conversation->messages()->firstOrFail();

        for ($index = 1; $index <= 34; $index++) {
            $conversation->messages()->create([
                'sender_user_id' => $artist->id,
                'body' => 'پیام تاریخی '.$index,
                'delivered_at' => now()->addSeconds($index),
            ]);
        }

        $firstPage = $this->actingAs($buyer)
            ->getJson('/api/v1/conversations/'.$conversation->id.'/messages')
            ->assertOk()
            ->assertJsonCount(30, 'data')
            ->assertJsonPath('current_page', 1)
            ->assertJsonPath('last_page', 2);

        $secondPage = $this->getJson('/api/v1/conversations/'.$conversation->id.'/messages?page=2')
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('current_page', 2);

        $this->assertSame($initialMessage->id, $secondPage->json('data.0.id'));
        $this->assertSame($secondPage->json('data.4.id') + 1, $firstPage->json('data.0.id'));
        $this->assertSame(
            collect($firstPage->json('data'))->pluck('id')->sort()->values()->all(),
            collect($firstPage->json('data'))->pluck('id')->values()->all(),
        );
    }

    public function test_older_message_cursor_remains_stable_when_new_messages_arrive(): void
    {
        [$buyer, $artist, $conversation] = $this->participantsWithConversation();

        for ($index = 1; $index <= 34; $index++) {
            $conversation->messages()->create([
                'sender_user_id' => $artist->id,
                'body' => 'پیام تاریخی '.$index,
                'delivered_at' => now(),
            ]);
        }

        $latestPage = $this->actingAs($buyer)
            ->getJson('/api/v1/conversations/'.$conversation->id.'/messages')
            ->assertOk()
            ->assertJsonCount(30, 'data');
        $beforeId = $latestPage->json('data.0.id');

        $this->actingAs($artist)
            ->postJson('/api/v1/conversations/'.$conversation->id.'/messages', [
                'body' => 'پیامی که هنگام مرور تاریخچه رسید',
                'client_message_id' => 'during-history-load',
            ])->assertCreated();

        $olderPage = $this->actingAs($buyer)
            ->getJson('/api/v1/conversations/'.$conversation->id.'/messages?before_id='.$beforeId)
            ->assertOk()
            ->assertJsonCount(5, 'data')
            ->assertJsonPath('current_page', 1)
            ->assertJsonPath('last_page', 1);

        $this->assertSame($beforeId - 5, $olderPage->json('data.0.id'));
        $this->assertSame($beforeId - 1, $olderPage->json('data.4.id'));
        $this->assertSame(
            collect($olderPage->json('data'))->pluck('id')->sort()->values()->all(),
            collect($olderPage->json('data'))->pluck('id')->values()->all(),
        );
    }

    public function test_message_sending_is_idempotent_for_a_client_message_id(): void
    {
        [$buyer, , $conversation] = $this->participantsWithConversation();
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
        [$buyer, , $conversation] = $this->participantsWithConversation();
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
        [$buyer, , $conversation] = $this->participantsWithConversation();
        [, , $otherConversation] = $this->participantsWithConversation('other-buyer@example.test', 'other-artist@example.test');
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
        [$buyer, $artist, $conversation] = $this->participantsWithConversation();
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

        $this->actingAs($artist)
            ->getJson('/api/v1/conversations/'.$conversation->id.'/messages')
            ->assertOk()
            ->assertJsonPath('data.0.id', $message->id)
            ->assertJsonPath('data.0.body', null)
            ->assertJsonPath('data.0.deleted_at', $deleted->json('data.deleted_at'));
    }

    public function test_participants_can_add_and_remove_idempotent_message_reactions(): void
    {
        [$buyer, $artist, $conversation] = $this->participantsWithConversation();
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
        [$buyer, , $conversation] = $this->participantsWithConversation();
        $original = $conversation->messages()->firstOrFail();

        $this->actingAs($buyer)
            ->postJson('/api/v1/conversations/'.$conversation->id.'/messages', [
                'body' => 'پاسخ به پیام قبلی',
                'reply_to_id' => $original->id,
                'client_message_id' => 'reply-context-1',
            ])
            ->assertCreated()
            ->assertJsonPath('data.reply_to.id', $original->id)
            ->assertJsonPath('data.reply_to.body', 'مایلم درباره جزئیات این اثر اطلاعات بیشتری دریافت کنم.');
    }

    public function test_buyer_can_start_direct_conversation_from_approved_artwork_and_keep_artwork_context(): void
    {
        [$buyer, $artist] = $this->participants();
        $profile = $artist->artistProfile()->firstOrFail();
        $category = Category::query()->create([
            'name' => 'نقاشی زمینه گفتگوی مستقیم',
            'slug' => 'direct-artwork-context-painting',
            'is_active' => true,
        ]);
        $artwork = $profile->artworks()->create([
            'category_id' => $category->id,
            'slug' => 'approved-artwork-context',
            'title' => 'اثر آزمایشی',
            'description' => 'توضیح اثر',
            'medium' => 'رنگ روغن',
            'dimensions' => '۵۰ × ۷۰',
            'year' => 2025,
            'price' => 1000000,
            'availability' => 'available',
            'status' => Artwork::STATUS_APPROVED,
            'image_path' => 'artworks/approved-artwork-context.jpg',
        ]);

        $response = $this->actingAs($buyer)->postJson('/api/v1/conversations/direct', [
            'artist_slug' => $profile->slug,
            'artwork_slug' => $artwork->slug,
        ])->assertCreated()->assertJsonStructure(['data' => ['id']]);

        $conversationId = (int) $response->json('data.id');
        $this->assertDatabaseHas('conversations', [
            'id' => $conversationId,
            'buyer_user_id' => $buyer->id,
            'artist_user_id' => $artist->id,
        ]);
        $this->assertDatabaseHas('conversation_contexts', [
            'conversation_id' => $conversationId,
            'artwork_id' => $artwork->id,
            'added_by_user_id' => $buyer->id,
        ]);

        $this->getJson('/api/v1/conversations/'.$conversationId)
            ->assertOk()
            ->assertJsonPath('data.contexts.0.artwork.slug', $artwork->slug)
            ->assertJsonPath('data.contexts.0.artwork.title', $artwork->title);

        $this->actingAs($artist)->getJson('/api/v1/artist/conversations')
            ->assertOk()
            ->assertJsonPath('data.0.contexts.0.artwork.slug', $artwork->slug);
    }

    public function test_buyer_can_send_an_artwork_reply_card_that_the_artist_receives_with_full_context(): void
    {
        [$buyer, $artist] = $this->participants('artwork-reply-buyer@example.test', 'artwork-reply-artist@example.test');
        $profile = $artist->artistProfile()->firstOrFail();
        $category = Category::query()->create(['name' => 'نقاشی ارجاع پیام', 'slug' => 'artwork-reply-painting', 'is_active' => true]);
        $artwork = $profile->artworks()->create([
            'category_id' => $category->id,
            'slug' => 'message-artwork-reference',
            'title' => 'پرتره در نور عصر',
            'description' => 'شرح اثر',
            'medium' => 'رنگ روغن',
            'dimensions' => '۶۰ × ۸۰',
            'year' => 2025,
            'price' => 2500000,
            'availability' => 'available',
            'status' => Artwork::STATUS_APPROVED,
            'image_path' => 'artworks/message-artwork-reference.jpg',
        ]);

        $conversationResponse = $this->actingAs($buyer)->postJson('/api/v1/conversations/direct', [
            'artist_slug' => $profile->slug,
            'artwork_slug' => $artwork->slug,
        ])->assertCreated();
        $conversationId = (int) $conversationResponse->json('data.id');

        $sent = $this->postJson('/api/v1/conversations/'.$conversationId.'/messages', [
            'body' => 'سلام، درباره این اثر و جزئیات اجرای آن سؤال دارم.',
            'artwork_id' => $artwork->id,
            'client_message_id' => 'artwork-reply-message-1',
        ])->assertCreated()
            ->assertJsonPath('data.body', 'سلام، درباره این اثر و جزئیات اجرای آن سؤال دارم.')
            ->assertJsonPath('data.artwork.id', $artwork->id)
            ->assertJsonPath('data.artwork.slug', $artwork->slug)
            ->assertJsonPath('data.artwork.title', $artwork->title)
            ->assertJsonPath('data.artwork.image_url', '/api/v1/artworks/'.$artwork->slug.'/image')
            ->assertJsonPath('data.artwork.category', $category->name)
            ->assertJsonPath('data.artwork.medium', $artwork->medium)
            ->assertJsonPath('data.artwork.dimensions', $artwork->dimensions);

        $this->assertDatabaseHas('messages', [
            'conversation_id' => $conversationId,
            'sender_user_id' => $buyer->id,
            'artwork_id' => $artwork->id,
            'client_message_id' => 'artwork-reply-message-1',
        ]);

        $this->actingAs($artist)
            ->getJson('/api/v1/conversations/'.$conversationId.'/messages')
            ->assertOk()
            ->assertJsonPath('data.0.id', $sent->json('data.id'))
            ->assertJsonPath('data.0.artwork.id', $artwork->id)
            ->assertJsonPath('data.0.artwork.title', $artwork->title)
            ->assertJsonPath('data.0.body', 'سلام، درباره این اثر و جزئیات اجرای آن سؤال دارم.');

        $otherArtist = $this->makeUser('unrelated-artwork-artist@example.test', User::ROLE_ARTIST);
        $otherProfile = $otherArtist->artistProfile()->create([
            'slug' => 'unrelated-artwork-artist',
            'display_name' => 'هنرمند دیگر',
            'is_public' => true,
        ]);
        $otherArtwork = $otherProfile->artworks()->create([
            'category_id' => $category->id,
            'slug' => 'unrelated-artwork',
            'title' => 'اثر هنرمند دیگر',
            'status' => Artwork::STATUS_APPROVED,
            'image_path' => 'artworks/unrelated-artwork.jpg',
        ]);
        $this->actingAs($buyer)
            ->postJson('/api/v1/conversations/'.$conversationId.'/messages', [
                'body' => 'ارجاع غیرمجاز به اثر هنرمند دیگر',
                'artwork_id' => $otherArtwork->id,
                'client_message_id' => 'invalid-artwork-reference',
            ])->assertUnprocessable();

        $this->actingAs($artist)
            ->postJson('/api/v1/conversations/'.$conversationId.'/messages', [
                'body' => 'سلام، با کمال میل جزئیات این اثر را توضیح می‌دهم.',
                'client_message_id' => 'artist-artwork-reply-1',
            ])
            ->assertCreated()
            ->assertJsonPath('data.artwork', null);
    }

    public function test_direct_artwork_conversation_rejects_non_buyers_and_unapproved_artworks(): void
    {
        [$buyer, $artist] = $this->participants('buyer-direct@example.test', 'artist-direct@example.test');
        $profile = $artist->artistProfile()->firstOrFail();

        $this->actingAs($artist)->postJson('/api/v1/conversations/direct', [
            'artist_slug' => $profile->slug,
        ])->assertForbidden();

        $category = Category::query()->create(['name' => 'مجسمه ارجاع مستقیم', 'slug' => 'direct-pending-sculpture', 'is_active' => true]);
        $artwork = $profile->artworks()->create([
            'category_id' => $category->id,
            'slug' => 'pending-artwork-context',
            'title' => 'اثر در انتظار',
            'availability' => 'available',
            'status' => Artwork::STATUS_PENDING_REVIEW,
            'image_path' => 'artworks/pending-artwork-context.jpg',
        ]);

        $this->actingAs($buyer)->postJson('/api/v1/conversations/direct', [
            'artist_slug' => $profile->slug,
            'artwork_slug' => $artwork->slug,
        ])->assertNotFound();
    }

    public function test_other_conversation_participant_can_preview_and_download_private_image_attachments(): void
    {
        Storage::fake('local');

        [$buyer, $artist, $conversation] = $this->participantsWithConversation();
        $message = $conversation->messages()->firstOrFail();
        $path = 'message-attachments/'.$conversation->id.'/preview-test.jpg';
        Storage::disk('local')->put($path, 'private-image-bytes');

        $attachment = MessageAttachment::query()->create([
            'message_id' => $message->id,
            'uploaded_by_user_id' => $buyer->id,
            'storage_path' => $path,
            'original_name' => 'اثر.jpg',
            'mime_type' => 'image/jpeg',
            'size_bytes' => 19,
        ]);

        $base = '/api/v1/conversations/'.$conversation->id.'/messages/'.$message->id.'/attachments/'.$attachment->id;

        $this->actingAs($artist)
            ->get($base.'/preview')
            ->assertOk()
            ->assertHeader('Content-Type', 'image/jpeg')
            ->assertHeader('Content-Disposition');

        $this->get($base)
            ->assertOk()
            ->assertHeader('Content-Disposition');

        $outsider = $this->makeUser('outsider@example.test', User::ROLE_BUYER);
        $this->actingAs($outsider)->get($base)->assertNotFound();
        $this->get($base.'/preview')->assertNotFound();
    }

    private function participants(
        string $buyerEmail = 'buyer@example.test',
        string $artistEmail = 'artist@example.test'
    ): array {
        $buyer = $this->makeUser($buyerEmail, User::ROLE_BUYER);
        $artist = $this->makeUser($artistEmail, User::ROLE_ARTIST);
        $artist->artistProfile()->create([
            'slug' => 'profile-'.str_replace(['@', '.'], '-', $artistEmail),
            'display_name' => 'هنرمند آزمایشی',
            'is_public' => true,
        ]);

        return [$buyer, $artist];
    }

    private function participantsWithConversation(
        string $buyerEmail = 'buyer@example.test',
        string $artistEmail = 'artist@example.test'
    ): array {
        [$buyer, $artist] = $this->participants($buyerEmail, $artistEmail);
        $conversation = Conversation::query()->create([
            'pair_key' => $buyer->id.':'.$artist->id,
            'buyer_user_id' => $buyer->id,
            'artist_user_id' => $artist->id,
        ]);
        $message = $conversation->messages()->create([
            'sender_user_id' => $buyer->id,
            'client_message_id' => 'initial-'.$buyer->id.'-'.$artist->id,
            'body' => 'مایلم درباره جزئیات این اثر اطلاعات بیشتری دریافت کنم.',
            'delivered_at' => now(),
        ]);
        $conversation->forceFill(['last_message_at' => $message->created_at])->save();

        return [$buyer, $artist, $conversation];
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
