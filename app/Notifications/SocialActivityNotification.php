<?php

declare(strict_types=1);

namespace App\Notifications;

use Illuminate\Notifications\Notification;

class SocialActivityNotification extends Notification
{
    /**
     * @param array<string, int|string|null> $data
     */
    public function __construct(
        public readonly string $kind,
        public readonly string $preferenceKey,
        public readonly array $data,
        string $eventKey,
    ) {
        $hex = substr(hash('sha256', $kind.':'.$eventKey), 0, 32);
        $hex[12] = '5';
        $hex[16] = dechex((hexdec($hex[16]) & 0x3) | 0x8);
        $this->id = substr($hex, 0, 8).'-'.substr($hex, 8, 4).'-'.substr($hex, 12, 4).'-'.substr($hex, 16, 4).'-'.substr($hex, 20, 12);
    }

    /**
     * @return array<int, string>
     */
    public function via($notifiable): array
    {
        return ($notifiable->socialNotificationPreferences()[$this->preferenceKey] ?? false)
            ? ['database']
            : [];
    }

    /**
     * @return array<string, int|string|null>
     */
    public function toDatabase($notifiable): array
    {
        return [
            'kind' => $this->kind,
            ...$this->data,
        ];
    }
}
