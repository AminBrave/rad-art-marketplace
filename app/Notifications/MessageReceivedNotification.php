<?php

declare(strict_types=1);

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class MessageReceivedNotification extends Notification implements ShouldQueue
{
    use Queueable;
    public function __construct(
        public readonly int $conversationId,
        public readonly int $messageId,
        public readonly string $senderName,
    ) {
        $this->afterCommit();
    }

    /**
     * @return array<int, string>
     */
    public function via($notifiable): array
    {
        return $notifiable->messageNotificationPreferences()['in_app_messages'] ? ['database'] : [];
    }

    /**
     * @return array<string, int|string>
     */
    public function toDatabase($notifiable): array
    {
        return [
            'kind' => 'message_received',
            'conversation_id' => $this->conversationId,
            'message_id' => $this->messageId,
            'sender_name' => $this->senderName,
        ];
    }
}
