<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Notifications\MessageReceivedNotification;
use App\Notifications\SocialActivityNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $types = $this->notificationTypes();
        $paginator = $user->notifications()
            ->whereIn('type', $types)
            ->latest()
            ->paginate(20);

        $data = $paginator->getCollection()->map(
            fn (DatabaseNotification $notification): array => $this->notificationPayload($notification, $user->role),
        )->values();

        return response()->json([
            'data' => $data,
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'unread_count' => $user->unreadNotifications()->whereIn('type', $types)->count(),
        ]);
    }

    public function markRead(Request $request, string $notification): JsonResponse
    {
        $item = $request->user()->notifications()
            ->whereKey($notification)
            ->whereIn('type', $this->notificationTypes())
            ->firstOrFail();
        $item->markAsRead();

        return response()->json(['message' => 'اعلان خوانده شد.']);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $updated = $request->user()->unreadNotifications()
            ->whereIn('type', $this->notificationTypes())
            ->update(['read_at' => now()]);

        return response()->json(['data' => ['updated_notifications' => $updated]]);
    }

    public function preferences(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                ...$request->user()->notificationPreferences(),
                'email_available' => false,
            ],
        ]);
    }

    public function updatePreferences(Request $request): JsonResponse
    {
        $keys = [
            'in_app_messages',
            'in_app_follows',
            'in_app_artwork_likes',
            'in_app_artwork_comments',
            'in_app_comment_replies',
        ];
        $rules = [];
        foreach ($keys as $key) {
            $rules[$key] = ['sometimes', 'boolean'];
        }
        $validated = $request->validate($rules);
        if ($validated === []) {
            return response()->json([
                'message' => 'حداقل یک تنظیم اعلان باید ارسال شود.',
                'errors' => ['preferences' => ['تنظیمی برای به‌روزرسانی ارسال نشده است.']],
            ], 422);
        }

        $preferences = array_replace(
            $request->user()->notificationPreferences(),
            array_map('boolval', $validated),
            ['email_messages' => false],
        );

        $request->user()->forceFill(['notification_preferences' => $preferences])->save();

        return response()->json([
            'data' => [
                ...$preferences,
                'email_available' => false,
            ],
        ]);
    }

    /**
     * @return array<int, class-string>
     */
    private function notificationTypes(): array
    {
        return [
            MessageReceivedNotification::class,
            SocialActivityNotification::class,
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function notificationPayload(DatabaseNotification $notification, string $role): array
    {
        $data = $notification->data;
        $kind = (string) ($data['kind'] ?? 'message_received');
        $conversationId = (int) ($data['conversation_id'] ?? 0);

        $actorNameEn = (string) ($data['actor_name_en'] ?? $data['actor_name'] ?? 'A user');
        $senderNameEn = (string) ($data['sender_name_en'] ?? $data['sender_name'] ?? 'A user');
        $titleEn = match ($kind) {
            'artist_followed' => $actorNameEn.' followed you',
            'artwork_liked' => $actorNameEn.' liked your artwork',
            'artwork_commented' => $actorNameEn.' commented on your artwork',
            'artwork_comment_replied' => $actorNameEn.' replied to a comment',
            default => $senderNameEn.' sent you a new message',
        };

        $title = match ($kind) {
            'artist_followed' => (string) ($data['actor_name'] ?? 'یک کاربر').' شما را دنبال کرد',
            'artwork_liked' => (string) ($data['actor_name'] ?? 'یک کاربر').' اثر شما را پسندید',
            'artwork_commented' => (string) ($data['actor_name'] ?? 'یک کاربر').' درباره اثر شما دیدگاه نوشت',
            'artwork_comment_replied' => (string) ($data['actor_name'] ?? 'یک کاربر').' به دیدگاه پاسخ داد',
            default => (string) ($data['sender_name'] ?? 'کاربر').' پیام جدیدی فرستاد',
        };

        $defaultTarget = $kind === 'message_received'
            ? ($role === 'artist' ? '/dashboard/artist/messages' : '/dashboard/buyer/messages').'?conversation='.$conversationId
            : null;

        return [
            'id' => $notification->id,
            'kind' => $kind,
            'title' => $title,
            'title_en' => $titleEn,
            'target_url' => $data['target_url'] ?? $defaultTarget,
            'conversation_id' => isset($data['conversation_id']) ? $conversationId : null,
            'message_id' => isset($data['message_id']) ? (int) $data['message_id'] : null,
            'sender_name' => isset($data['sender_name']) ? (string) $data['sender_name'] : null,
            'actor_name' => isset($data['actor_name']) ? (string) $data['actor_name'] : null,
            'artist_slug' => isset($data['artist_slug']) ? (string) $data['artist_slug'] : null,
            'artist_name' => isset($data['artist_name']) ? (string) $data['artist_name'] : null,
            'artist_name_en' => isset($data['artist_name_en']) ? (string) $data['artist_name_en'] : null,
            'artwork_slug' => isset($data['artwork_slug']) ? (string) $data['artwork_slug'] : null,
            'artwork_title' => isset($data['artwork_title']) ? (string) $data['artwork_title'] : null,
            'artwork_title_en' => isset($data['artwork_title_en']) ? (string) $data['artwork_title_en'] : null,
            'comment_id' => isset($data['comment_id']) ? (int) $data['comment_id'] : null,
            'comment_preview' => isset($data['comment_preview']) ? (string) $data['comment_preview'] : null,
            'read_at' => $notification->read_at?->toISOString(),
            'created_at' => $notification->created_at?->toISOString(),
        ];
    }
}
