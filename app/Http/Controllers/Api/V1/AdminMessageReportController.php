<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Actions\Messaging\RemoveMessage;
use App\Http\Controllers\Controller;
use App\Models\Message;
use App\Models\MessageModerationAudit;
use App\Models\MessageReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminMessageReportController extends Controller
{
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

    public function adminUpdate(Request $request, MessageReport $report, RemoveMessage $removeMessage): JsonResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'string', Rule::in(['reviewed', 'dismissed', 'remove_message'])],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($report, $validated, $request, $removeMessage): void {
            $locked = MessageReport::query()->lockForUpdate()->findOrFail($report->id);
            $action = $validated['action'];
            if ($action === 'remove_message' && $locked->message) {
                $message = Message::withTrashed()->find($locked->message_id);
                if ($message && ! $message->trashed()) {
                    $removeMessage->handle($message);
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
}
