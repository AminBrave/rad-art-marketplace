<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageAttachment;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpFoundation\StreamedResponse;

class MessageAttachmentController extends Controller
{
    public function store(Request $request, Conversation $conversation, Message $message): JsonResponse
    {
        $user = $request->user();
        abort_unless($this->isParticipant($user, $conversation), 404);
        abort_unless((int) $message->conversation_id === (int) $conversation->id, 404);
        abort_unless((int) $message->sender_user_id === (int) $user->id, 403);
        abort_if($message->trashed(), 404);

        $request->validate([
            'file' => [
                'required',
                'file',
                'max:10240',
                'mimes:jpg,jpeg,png,webp,pdf',
                'mimetypes:image/jpeg,image/png,image/webp,application/pdf',
            ],
        ]);

        $file = $request->file('file');
        if (! $file || ! $file->isValid()) {
            throw ValidationException::withMessages(['file' => 'بارگذاری فایل معتبر نیست.']);
        }

        $originalName = Str::of($file->getClientOriginalName())
            ->replaceMatches('/[^\pL\pN._ -]/u', '')
            ->trim()
            ->limit(180, '')
            ->toString();
        $originalName = $originalName !== '' ? $originalName : 'attachment';
        $path = $file->store('message-attachments/'.$conversation->id, 'local');

        $attachment = MessageAttachment::query()->create([
            'message_id' => $message->id,
            'uploaded_by_user_id' => $user->id,
            'storage_path' => $path,
            'original_name' => $originalName,
            'mime_type' => $file->getMimeType() ?: 'application/octet-stream',
            'size_bytes' => (int) $file->getSize(),
        ]);

        return response()->json(['data' => $this->payload($attachment)], 201);
    }

    public function download(Request $request, Conversation $conversation, Message $message, MessageAttachment $attachment): StreamedResponse
    {
        abort_unless($this->isParticipant($request->user(), $conversation), 404);
        abort_unless((int) $message->conversation_id === (int) $conversation->id, 404);
        abort_unless((int) $attachment->message_id === (int) $message->id, 404);
        abort_if($message->trashed(), 404);

        abort_unless(Storage::disk('local')->exists($attachment->storage_path), 404);

        return Storage::disk('local')->download(
            $attachment->storage_path,
            $attachment->original_name,
            [
                'Content-Type' => $attachment->mime_type,
                'X-Content-Type-Options' => 'nosniff',
                'Cache-Control' => 'private, no-store',
            ],
        );
    }

    public function payload(MessageAttachment $attachment): array
    {
        return [
            'id' => $attachment->id,
            'name' => $attachment->original_name,
            'mime_type' => $attachment->mime_type,
            'size_bytes' => $attachment->size_bytes,
        ];
    }

    private function isParticipant(User $user, Conversation $conversation): bool
    {
        return (int) $conversation->buyer_user_id === (int) $user->id
            || (int) $conversation->artist_user_id === (int) $user->id;
    }
}
