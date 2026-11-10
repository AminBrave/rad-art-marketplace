<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageModerationAudit;
use App\Models\MessageReport;
use App\Models\User;
use App\Models\UserBlock;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
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

    public function adminIndex(Request $request): JsonResponse
    {
        $reports = MessageReport::query()->with(['reporter:id,name', 'conversation:id,buyer_user_id,artist_user_id', 'message:id,body,deleted_at'])
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $reports->getCollection()->map(fn (MessageReport $report): array => [
                'id' => $report->id,
                'reason' => $report->reason,
                'details' => $report->details,
                'status' => $report->status,
                'created_at' => $report->created_at?->toISOString(),
                'reporter' => ['id' => $report->reporter?->id, 'name' => $report->reporter?->name],
                'conversation_id' => $report->conversation_id,
                'message' => $report->message ? [
                    'id' => $report->message->id,
                    'body' => $report->message->trashed() ? null : $report->message->body,
                    'deleted_at' => $report->message->deleted_at?->toISOString(),
                ] : null,
            ])->values(),
            'current_page' => $reports->currentPage(),
            'last_page' => $reports->lastPage(),
            'per_page' => $reports->perPage(),
            'total' => $reports->total(),
        ]);
    }

    public function adminUpdate(Request $request, MessageReport $report): JsonResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'string', Rule::in(['reviewed', 'dismissed', 'remove_message'])],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($report, $validated, $request): void {
            $locked = MessageReport::query()->lockForUpdate()->findOrFail($report->id);
            $action = $validated['action'];
            if ($action === 'remove_message' && $locked->message) {
                $message = Message::withTrashed()->find($locked->message_id);
                if ($message && ! $message->trashed()) {
                    $message->reactions()->delete();
                    $message->attachments()->get()->each(function ($attachment): void {
                        Storage::disk('local')->delete($attachment->storage_path);
                        $attachment->delete();
                    });
                    $message->forceFill(['body' => ''])->save();
                    $message->delete();
                }
            }
            $locked->forceFill([
                'status' => $action === 'dismissed' ? 'dismissed' : 'reviewed',
                'reviewed_by_user_id' => $request->user()->id,
                'reviewed_at' => now(),
            ])->save();
            MessageModerationAudit::query()->create([
                'report_id' => $locked->id,
                'admin_user_id' => $request->user()->id,
                'action' => $action,
                'note' => isset($validated['note']) ? trim($validated['note']) : null,
            ]);
        });

        return response()->json(['message' => 'گزارش بررسی شد.']);
    }

    private function isParticipant(User $user, Conversation $conversation): bool
    {
        return (int) $conversation->buyer_user_id === (int) $user->id
            || (int) $conversation->artist_user_id === (int) $user->id;
    }
}
