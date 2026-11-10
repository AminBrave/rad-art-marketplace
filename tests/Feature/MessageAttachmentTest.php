<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class MessageAttachmentTest extends TestCase
{
    use RefreshDatabase;

    public function test_sender_can_upload_private_pdf_and_both_participants_can_download_it(): void
    {
        Storage::fake('local');
        [$buyer, $artist, $conversation, $message, $outsider] = $this->fixture();

        $upload = $this->actingAs($buyer)
            ->postJson("/api/v1/conversations/{$conversation->id}/messages/{$message->id}/attachments", [
                'file' => UploadedFile::fake()->createWithContent('reference.pdf', "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF"),
            ])
            ->assertCreated()
            ->assertJsonPath('data.name', 'reference.pdf')
            ->assertJsonPath('data.mime_type', 'application/pdf');

        $attachment = MessageAttachment::query()->firstOrFail();
        Storage::disk('local')->assertExists($attachment->storage_path);
        $this->assertStringNotContainsString('storage_path', $upload->getContent());

        $this->actingAs($outsider)
            ->get("/api/v1/conversations/{$conversation->id}/messages/{$message->id}/attachments/{$attachment->id}")
            ->assertNotFound();

        $this->actingAs($artist)
            ->get("/api/v1/conversations/{$conversation->id}/messages/{$message->id}/attachments/{$attachment->id}")
            ->assertOk()
            ->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    public function test_only_the_message_sender_can_upload_and_unsupported_files_are_rejected(): void
    {
        Storage::fake('local');
        [$buyer, $artist, $conversation, $message] = $this->fixture();

        $this->actingAs($artist)
            ->postJson("/api/v1/conversations/{$conversation->id}/messages/{$message->id}/attachments", [
                'file' => UploadedFile::fake()->createWithContent('other.pdf', "%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\n%%EOF"),
            ])
            ->assertForbidden();

        $this->actingAs($buyer)
            ->postJson("/api/v1/conversations/{$conversation->id}/messages/{$message->id}/attachments", [
                'file' => UploadedFile::fake()->createWithContent('payload.exe', 'MZ executable content'),
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('file');
    }

    private function fixture(): array
    {
        $buyer = $this->user('attachment-buyer@example.test', User::ROLE_BUYER);
        $artist = $this->user('attachment-artist@example.test', User::ROLE_ARTIST);
        $outsider = $this->user('attachment-outsider@example.test', User::ROLE_BUYER);
        $conversation = Conversation::query()->create([
            'pair_key' => $buyer->id.':'.$artist->id,
            'buyer_user_id' => $buyer->id,
            'artist_user_id' => $artist->id,
            'last_message_at' => now(),
        ]);
        $message = Message::query()->create([
            'conversation_id' => $conversation->id,
            'sender_user_id' => $buyer->id,
            'body' => 'فایل پیوست',
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
