<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageReport;
use App\Models\User;
use App\Models\UserBlock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class MessageSafetyController extends Controller
{
    public function status(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();
        abort_unless($this->isParticipant($user, $conversation), 404);
        $otherId = (int) $conversation->buyer_user_id === (int) $user->id
            ? (int) $conversation->artist_user_id
            : (int) $conversation->buyer_user_id;

        return response()->json(['data' => [
            'blocked_by_me' => UserBlock::query()->where('blocker_user_id', $user->id)->where('blocked_user_id', $otherId)->exists(),
            'blocked_by_other' => UserBlock::query()->where('blocker_user_id', $otherId)->where('blocked_user_id', $user->id)->exists(),
        ]]);
    }

    public function reportConversation(Request $request, Conversation $conversation): JsonResponse
    {
        return $this->createReport($request, $conversation, null);
    }

    public function reportMessage(Request $request, Conversation $conversation, Message $message): JsonResponse
    {
        return $this->createReport($request, $conversation, $message);
    }

    private function createReport(Request $request, Conversation $conversation, ?Message $message): JsonResponse
    {
        $user = $request->user();
        abort_unless($this->isParticipant($user, $conversation), 404);
        if ($message) {
            abort_unless((int) $message->conversation_id === (int) $conversation->id, 404);
            abort_if($message->trashed(), 404);
        }

        $validated = $request->validate([
            'reason' => ['required', 'string', Rule::in(['spam', 'harassment', 'inappropriate', 'scam', 'other'])],
            'details' => ['nullable', 'string', 'max:1000'],
        ]);

        $report = MessageReport::query()->firstOrCreate(
            [
                'reporter_user_id' => $user->id,
                'subject_key' => $message ? 'message:'.$message->id : 'conversation:'.$conversation->id,
            ],
            [
                'conversation_id' => $conversation->id,
                'message_id' => $message?->id,
                'reason' => $validated['reason'],
                'status' => 'open',
                'details' => isset($validated['details']) ? trim($validated['details']) : null,
            ],
        );

        return response()->json(['data' => ['id' => $report->id, 'status' => $report->status]], $report->wasRecentlyCreated ? 201 : 200);
    }

    public function block(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();
        abort_unless($this->isParticipant($user, $conversation), 404);
        $otherId = (int) $conversation->buyer_user_id === (int) $user->id
            ? (int) $conversation->artist_user_id
            : (int) $conversation->buyer_user_id;

        UserBlock::query()->firstOrCreate([
            'blocker_user_id' => $user->id,
            'blocked_user_id' => $otherId,
        ]);

        return response()->json(['message' => 'این کاربر مسدود شد.']);
    }

    public function unblock(Request $request, Conversation $conversation): JsonResponse
    {
        $user = $request->user();
        abort_unless($this->isParticipant($user, $conversation), 404);
        $otherId = (int) $conversation->buyer_user_id === (int) $user->id
            ? (int) $conversation->artist_user_id
            : (int) $conversation->buyer_user_id;

        UserBlock::query()->where('blocker_user_id', $user->id)->where('blocked_user_id', $otherId)->delete();

        return response()->json(['message' => 'مسدودسازی برداشته شد.']);
    }





    private function isParticipant(User $user, Conversation $conversation): bool
    {
        return (int) $conversation->buyer_user_id === (int) $user->id
            || (int) $conversation->artist_user_id === (int) $user->id;
    }
}
