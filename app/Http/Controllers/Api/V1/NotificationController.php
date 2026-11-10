<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Notifications\MessageReceivedNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Notifications\DatabaseNotification;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $paginator = $user->notifications()
            ->where('type', MessageReceivedNotification::class)
            ->latest()
            ->paginate(20);

        $data = $paginator->getCollection()->map(
            fn (DatabaseNotification $notification): array => [
                'id' => $notification->id,
                'kind' => $notification->data['kind'] ?? 'message_received',
                'conversation_id' => (int) ($notification->data['conversation_id'] ?? 0),
                'message_id' => (int) ($notification->data['message_id'] ?? 0),
                'sender_name' => (string) ($notification->data['sender_name'] ?? 'کاربر'),
                'read_at' => $notification->read_at?->toISOString(),
                'created_at' => $notification->created_at?->toISOString(),
            ]
        )->values();

        return response()->json([
            'data' => $data,
            'current_page' => $paginator->currentPage(),
            'last_page' => $paginator->lastPage(),
            'per_page' => $paginator->perPage(),
            'total' => $paginator->total(),
            'unread_count' => $user->unreadNotifications()
                ->where('type', MessageReceivedNotification::class)
                ->count(),
        ]);
    }

    public function markRead(Request $request, string $notification): JsonResponse
    {
        $item = $request->user()->notifications()
            ->whereKey($notification)
            ->where('type', MessageReceivedNotification::class)
            ->firstOrFail();
        $item->markAsRead();

        return response()->json(['message' => 'اعلان خوانده شد.']);
    }

    public function markAllRead(Request $request): JsonResponse
    {
        $updated = $request->user()->unreadNotifications()
            ->where('type', MessageReceivedNotification::class)
            ->update(['read_at' => now()]);

        return response()->json(['data' => ['updated_notifications' => $updated]]);
    }

    public function preferences(Request $request): JsonResponse
    {
        return response()->json([
            'data' => [
                ...$request->user()->messageNotificationPreferences(),
                'email_available' => false,
            ],
        ]);
    }

    public function updatePreferences(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'in_app_messages' => ['required', 'boolean'],
        ]);

        $preferences = array_replace(
            $request->user()->messageNotificationPreferences(),
            [
                'in_app_messages' => (bool) $validated['in_app_messages'],
                // Email stays disabled until the deployment has a verified queue worker and mail setup.
                'email_messages' => false,
            ],
        );

        $request->user()->forceFill(['notification_preferences' => $preferences])->save();

        return response()->json([
            'data' => [
                ...$preferences,
                'email_available' => false,
            ],
        ]);
    }
}
