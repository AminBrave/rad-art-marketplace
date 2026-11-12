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

        $this->actingAs($buyer)
            ->deleteJson("/api/v1/conversations/{$conversation->id}/messages/{$message->id}")
            ->assertOk();
        Storage::disk('local')->assertMissing($attachment->storage_path);
        $this->assertDatabaseMissing('message_attachments', ['id' => $attachment->id]);
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

    public function test_guests_cannot_upload_or_download_private_attachments(): void
    {
        Storage::fake('local');
        [$buyer, , $conversation, $message] = $this->fixture();
        $base = "/api/v1/conversations/{$conversation->id}/messages/{$message->id}/attachments";

        $this->postJson($base, [
            'file' => UploadedFile::fake()->createWithContent('guest.pdf', "%PDF-1.4\n%%EOF"),
        ])->assertUnauthorized();

        $path = 'message-attachments/'.$conversation->id.'/guest-private.pdf';
        Storage::disk('local')->put($path, "%PDF-1.4\n%%EOF");
        $attachment = MessageAttachment::query()->create([
            'message_id' => $message->id,
            'uploaded_by_user_id' => $buyer->id,
            'storage_path' => $path,
            'original_name' => 'private.pdf',
            'mime_type' => 'application/pdf',
            'size_bytes' => 12,
        ]);

        $this->getJson($base.'/'.$attachment->id)->assertUnauthorized();
    }

    public function test_attachment_routes_enforce_message_binding_and_pdf_is_not_previewable(): void
    {
        Storage::fake('local');
        [$buyer, , $conversation, $message] = $this->fixture();
        $otherMessage = $conversation->messages()->create([
            'sender_user_id' => $buyer->id,
            'body' => 'پیام دیگر',
            'delivered_at' => now(),
        ]);
        $path = 'message-attachments/'.$conversation->id.'/document.pdf';
        Storage::disk('local')->put($path, "%PDF-1.4\n%%EOF");
        $attachment = MessageAttachment::query()->create([
            'message_id' => $message->id,
            'uploaded_by_user_id' => $buyer->id,
            'storage_path' => $path,
            'original_name' => 'document.pdf',
            'mime_type' => 'application/pdf',
            'size_bytes' => 12,
        ]);

        $mismatchedBase = "/api/v1/conversations/{$conversation->id}/messages/{$otherMessage->id}/attachments/{$attachment->id}";
        $this->actingAs($buyer)->get($mismatchedBase)->assertNotFound();
        $this->get($mismatchedBase.'/preview')->assertNotFound();

        $validBase = "/api/v1/conversations/{$conversation->id}/messages/{$message->id}/attachments/{$attachment->id}";
        $this->get($validBase.'/preview')->assertNotFound();
        $this->get($validBase)
            ->assertOk()
            ->assertHeader('Cache-Control', 'no-store, private')
            ->assertHeader('X-Content-Type-Options', 'nosniff');
    }

    public function test_a_message_cannot_receive_more_than_five_attachments(): void
    {
        Storage::fake('local');
        [$buyer, , $conversation, $message] = $this->fixture();
        $url = "/api/v1/conversations/{$conversation->id}/messages/{$message->id}/attachments";

        foreach (range(1, 5) as $index) {
            $this->actingAs($buyer)
                ->postJson($url, [
                    'file' => UploadedFile::fake()->createWithContent("reference-{$index}.pdf", "%PDF-1.4\n%%EOF"),
                ])
                ->assertCreated();
        }

        $this->postJson($url, [
            'file' => UploadedFile::fake()->createWithContent('reference-6.pdf', "%PDF-1.4\n%%EOF"),
        ])->assertUnprocessable();

        $this->assertDatabaseCount('message_attachments', 5);
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
