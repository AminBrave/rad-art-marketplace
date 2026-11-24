<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ArtworkComment;
use App\Models\ArtworkCommentModerationAudit;
use App\Models\ArtworkCommentReport;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminArtworkCommentReportController extends Controller
{
    public function index(): JsonResponse
    {
        $reports = ArtworkCommentReport::query()
            ->with([
                'reporter:id,name',
                'comment' => fn ($query) => $query->withTrashed()->with([
                    'user:id,name',
                    'artwork:id,slug,title,title_en',
                ]),
            ])
            ->latest()
            ->paginate(20);

        return response()->json([
            'data' => $reports->getCollection()->map(
                fn (ArtworkCommentReport $report): array => [
                    'id' => $report->id,
                    'reason' => $report->reason,
                    'details' => $report->details,
                    'status' => $report->status,
                    'created_at' => $report->created_at?->toISOString(),
                    'reporter' => $report->reporter ? [
                        'id' => $report->reporter->id,
                        'name' => $report->reporter->name,
                    ] : null,
                    'comment' => $report->comment ? [
                        'id' => $report->comment->id,
                        'body' => $report->comment->trashed() ? null : $report->comment->body,
                        'is_deleted' => $report->comment->trashed(),
                        'author' => $report->comment->user?->name,
                        'artwork' => $report->comment->artwork ? [
                            'slug' => $report->comment->artwork->slug,
                            'title' => $report->comment->artwork->title,
                            'title_en' => $report->comment->artwork->title_en,
                        ] : null,
                    ] : null,
                ],
            )->values(),
            'current_page' => $reports->currentPage(),
            'last_page' => $reports->lastPage(),
            'per_page' => $reports->perPage(),
            'total' => $reports->total(),
        ]);
    }

    public function update(Request $request, ArtworkCommentReport $report): JsonResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'string', Rule::in(['reviewed', 'dismissed', 'remove_comment'])],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        DB::transaction(function () use ($report, $validated, $request): void {
            $locked = ArtworkCommentReport::query()->lockForUpdate()->findOrFail($report->id);
            if ($validated['action'] === 'remove_comment') {
                $comment = ArtworkComment::withTrashed()->find($locked->comment_id);
                if ($comment && ! $comment->trashed()) {
                    $comment->delete();
                }
            }

            $locked->forceFill([
                'status' => $validated['action'] === 'dismissed' ? 'dismissed' : 'reviewed',
                'reviewed_by_user_id' => $request->user()->id,
                'reviewed_at' => now(),
            ])->save();

            ArtworkCommentModerationAudit::query()->create([
                'report_id' => $locked->id,
                'admin_user_id' => $request->user()->id,
                'action' => $validated['action'],
                'note' => isset($validated['note']) ? trim($validated['note']) : null,
            ]);
        });

        return response()->json(['message' => 'گزارش دیدگاه بررسی شد.']);
    }
}
