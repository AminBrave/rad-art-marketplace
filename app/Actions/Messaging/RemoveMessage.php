<?php

declare(strict_types=1);

namespace App\Actions\Messaging;

use App\Models\Message;
use Illuminate\Support\Facades\Storage;

class RemoveMessage
{
    /**
     * Remove message content and related data while retaining its tombstone.
     *
     * The caller owns the surrounding transaction.
     */
    public function handle(Message $message): void
    {
        $message->reactions()->delete();

        $message->attachments()->get()->each(function ($attachment): void {
            Storage::disk('local')->delete($attachment->storage_path);
            $attachment->delete();
        });

        $message->forceFill(['body' => ''])->save();
        $message->delete();
    }
}
