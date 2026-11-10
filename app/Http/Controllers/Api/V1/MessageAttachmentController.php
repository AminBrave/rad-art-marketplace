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

        abort_if($message->attachments()->count() >= 5, 422, 'برای هر پیام حداکثر پنج پیوست مجاز است.');

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

        if (str_starts_with((string) $file->getMimeType(), 'image/')) {
            $dimensions = getimagesize($file->getRealPath());
            if (! $dimensions || $dimensions[0] < 1 || $dimensions[1] < 1 || $dimensions[0] > 6000 || $dimensions[1] > 6000) {
                throw ValidationException::withMessages(['file' => 'ابعاد تصویر پیوست معتبر نیست.']);
            }
        }

        $originalName = Str::of($file->getClientOriginalName())
            ->replaceMatches('/[^\pL\pN._ -]/u', '')
            ->trim()
            ->limit(180, '')
            ->toString();
        $originalName = $originalName !== '' ? $originalName : 'attachment';
        $path = $file->store('message-attachments/'.$conversation->id, 'local');
        if (! is_string($path) || $path === '') {
            throw ValidationException::withMessages(['file' => 'ذخیره فایل پیوست انجام نشد. دوباره تلاش کنید.']);
        }

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
