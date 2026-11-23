<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Artwork;
use App\Models\ArtworkComment;
use App\Models\ArtworkCommentReport;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ArtworkInteractionController extends Controller
{
    public function like(Request $request, Artwork $artwork): JsonResponse
    {
        $this->ensurePublicArtwork($artwork);

        DB::table('artwork_likes')->insertOrIgnore([
            'artwork_id' => $artwork->id,
            'user_id' => $request->user()->id,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'data' => [
                'liked' => true,
                'likes_count' => $artwork->likes()->count(),
            ],
        ]);
    }

    public function unlike(Request $request, Artwork $artwork): JsonResponse
    {
        $this->ensurePublicArtwork($artwork);

        $artwork->likes()->where('user_id', $request->user()->id)->delete();

        return response()->json([
            'data' => [
                'liked' => false,
                'likes_count' => $artwork->likes()->count(),
            ],
        ]);
    }

    public function comments(Request $request, Artwork $artwork): JsonResponse
    {
        $this->ensurePublicArtwork($artwork);

        $comments = ArtworkComment::query()
            ->withTrashed()
            ->where('artwork_id', $artwork->id)
            ->whereNull('parent_id')
            ->with([
                'user:id,role',
                'user.artistProfile:id,user_id,display_name,is_public',
                'replies' => fn ($query) => $query->withTrashed()->with([
                    'user:id,role',
                    'user.artistProfile:id,user_id,display_name,is_public',
                ]),
            ])
            ->oldest()
            ->paginate(20);

        return response()->json([
            'data' => $comments->getCollection()
                ->map(fn (ArtworkComment $comment): array => $this->commentPayload($comment, $request->user()))
                ->values(),
            'current_page' => $comments->currentPage(),
            'last_page' => $comments->lastPage(),
            'per_page' => $comments->perPage(),
            'total' => $comments->total(),
        ]);
    }

    public function storeComment(Request $request, Artwork $artwork): JsonResponse
    {
        $this->ensurePublicArtwork($artwork);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
            'parent_id' => ['nullable', 'integer'],
        ]);

        $body = trim($validated['body']);
        if ($body === '') {
            return response()->json([
                'message' => 'متن دیدگاه نمی‌تواند خالی باشد.',
                'errors' => ['body' => ['متن دیدگاه نمی‌تواند خالی باشد.']],
            ], 422);
        }

        $parent = null;
        if (! empty($validated['parent_id'])) {
            $parent = ArtworkComment::query()
                ->where('artwork_id', $artwork->id)
                ->whereNull('parent_id')
                ->find($validated['parent_id']);

            if (! $parent) {
                return response()->json([
                    'message' => 'پاسخ باید به یک دیدگاه اصلی از همین اثر متصل باشد.',
                    'errors' => ['parent_id' => ['دیدگاه والد معتبر نیست.']],
                ], 422);
            }
        }

        $comment = ArtworkComment::query()->create([
            'artwork_id' => $artwork->id,
            'user_id' => $request->user()->id,
            'parent_id' => $parent?->id,
            'body' => $body,
        ]);

        $comment->load(['user:id,role', 'user.artistProfile:id,user_id,display_name,is_public']);

        return response()->json([
            'message' => 'دیدگاه ثبت شد.',
            'data' => $this->commentPayload($comment, $request->user()),
        ], 201);
    }

    public function destroyComment(Request $request, Artwork $artwork, ArtworkComment $comment): JsonResponse
    {
        abort_unless($comment->artwork_id === $artwork->id, 404);
        abort_unless($comment->user_id === $request->user()->id, 403);

        if (! $comment->trashed()) {
            $comment->delete();
        }

        return response()->json(['message' => 'دیدگاه حذف شد.']);
    }

    public function reportComment(Request $request, Artwork $artwork, ArtworkComment $comment): JsonResponse
    {
        $this->ensurePublicArtwork($artwork);
        abort_unless($comment->artwork_id === $artwork->id && ! $comment->trashed(), 404);
        abort_unless($comment->user_id !== $request->user()->id, 403);

        $validated = $request->validate([
            'reason' => ['required', 'string', 'in:spam,harassment,copyright,other'],
            'details' => ['nullable', 'string', 'max:1000'],
        ]);

        $report = ArtworkCommentReport::query()->updateOrCreate(
            [
                'comment_id' => $comment->id,
                'reporter_user_id' => $request->user()->id,
            ],
            [
                'reason' => $validated['reason'],
                'details' => isset($validated['details']) ? trim($validated['details']) : null,
                'status' => 'open',
                'reviewed_by_user_id' => null,
                'reviewed_at' => null,
            ],
        );

        return response()->json([
            'message' => 'گزارش شما ثبت شد.',
            'data' => ['id' => $report->id, 'status' => $report->status],
        ], 201);
    }

    private function ensurePublicArtwork(Artwork $artwork): void
    {
        abort_unless(
            $artwork->status === Artwork::STATUS_APPROVED
                && $artwork->artistProfile()->where('is_public', true)->exists(),
            404,
        );
    }

    /**
     * @return array<string, mixed>
     */
    private function commentPayload(ArtworkComment $comment, ?User $viewer): array
    {
        return [
            'id' => $comment->id,
            'parent_id' => $comment->parent_id,
            'body' => $comment->trashed() ? null : $comment->body,
            'is_deleted' => $comment->trashed(),
            'created_at' => $comment->created_at?->toISOString(),
            'user' => $comment->user ? ['name' => $this->publicAuthorName($comment->user)] : null,
            'is_mine' => $viewer !== null && $comment->user_id === $viewer->id,
            'replies' => $comment->relationLoaded('replies')
                ? $comment->replies->map(fn (ArtworkComment $reply): array => [
                    'id' => $reply->id,
                    'parent_id' => $reply->parent_id,
                    'body' => $reply->trashed() ? null : $reply->body,
                    'is_deleted' => $reply->trashed(),
                    'created_at' => $reply->created_at?->toISOString(),
                    'user' => $reply->user ? ['name' => $this->publicAuthorName($reply->user)] : null,
                    'is_mine' => $viewer !== null && $reply->user_id === $viewer->id,
                ])->values()
                : [],
        ];
    }

    private function publicAuthorName(User $user): string
    {
        if ($user->isArtist() && $user->artistProfile?->is_public) {
            return (string) $user->artistProfile->display_name;
        }

        return $user->isBuyer() ? 'خریدار' : 'هنرمند';
    }
}
