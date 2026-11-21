<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ArtistContent;
use App\Models\Artwork;
use App\Models\EditorialAudit;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminArtworkModerationController extends Controller
{
    private const MODERATION_STATUSES = [
        Artwork::STATUS_PENDING_REVIEW,
        Artwork::STATUS_APPROVED,
        Artwork::STATUS_REJECTED,
        Artwork::STATUS_CHANGES_REQUESTED,
    ];

    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['sometimes', 'string', Rule::in(self::MODERATION_STATUSES)],
        ]);

        $perPage = min(max($request->integer('per_page', 20), 1), 20);

        $artworks = Artwork::query()
            ->with(['category', 'artistProfile'])
            ->when($validated['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->latest()
            ->paginate($perPage)
            ->through(fn (Artwork $artwork): array => $this->payload($artwork));

        return response()->json($artworks);
    }

    /**
     * Admin view of the source-aware library. Provider snapshots, identifiers,
     * captions, permalinks and internal media paths are deliberately excluded.
     */
    public function contents(Request $request): JsonResponse
    {
        $this->authorize('adminViewAny', ArtistContent::class);

        $validated = $request->validate([
            'moderation_status' => ['sometimes', 'string', Rule::in([...self::MODERATION_STATUSES, 'unavailable'])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:20'],
        ]);

        $status = $validated['moderation_status'] ?? null;
        $contents = ArtistContent::query()
            ->with(['artistProfile', 'artwork.category'])
            ->when($status === 'unavailable', fn ($query) => $query->where(function ($nested): void {
                $nested->where('source', '!=', ArtistContent::SOURCE_NATIVE)
                    ->orWhereDoesntHave('artwork');
            }))
            ->when($status !== null && $status !== 'unavailable', fn ($query) => $query
                ->where('source', ArtistContent::SOURCE_NATIVE)
                ->whereHas('artwork', fn ($artworks) => $artworks->where('status', $status)))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($validated['per_page'] ?? 20)
            ->through(fn (ArtistContent $content): array => $this->contentPayload($content));

        return response()->json($contents);
    }

    public function update(Request $request, Artwork $artwork): JsonResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'string', Rule::in(['approve', 'reject', 'request_changes'])],
            'note' => ['nullable', 'string', 'max:2000', 'required_if:action,reject,request_changes'],
        ]);

        return $this->moderateArtwork($request, $artwork, $validated, 'Artwork', $artwork->id);
    }

    public function moderateContent(Request $request, ArtistContent $content): JsonResponse
    {
        $this->authorize('moderate', $content);

        $validated = $request->validate([
            'action' => ['required', 'string', Rule::in(['approve', 'reject', 'request_changes'])],
            'note' => ['nullable', 'string', 'max:2000', 'required_if:action,reject,request_changes'],
        ]);

        if ($content->source !== ArtistContent::SOURCE_NATIVE) {
            abort(409, 'محتوای منبع خارجی تا زمان تکمیل مجوزهای منبع قابل بررسی نیست.');
        }

        $artwork = $content->artwork()->first();

        if (! $artwork) {
            abort(409, 'این محتوا هنوز به یک اثر قابل بررسی متصل نیست.');
        }

        return $this->moderateArtwork($request, $artwork, $validated, 'ArtistContent', $content->id, $content);
    }

    /**
     * @param array{action: string, note?: string|null} $validated
     */
    private function moderateArtwork(
        Request $request,
        Artwork $artwork,
        array $validated,
        string $subjectType,
        int $subjectId,
        ?ArtistContent $content = null,
    ): JsonResponse {
        if ($artwork->status !== Artwork::STATUS_PENDING_REVIEW) {
            return response()->json([
                'message' => 'فقط آثاری که در صف بررسی هستند قابل تصمیم‌گیری‌اند.',
            ], 422);
        }

        $status = match ($validated['action']) {
            'approve' => Artwork::STATUS_APPROVED,
            'reject' => Artwork::STATUS_REJECTED,
            'request_changes' => Artwork::STATUS_CHANGES_REQUESTED,
        };

        $updated = DB::transaction(function () use ($request, $artwork, $validated, $status, $subjectType, $subjectId): int {
            $count = Artwork::query()
                ->whereKey($artwork->getKey())
                ->where('status', Artwork::STATUS_PENDING_REVIEW)
                ->update([
                    'status' => $status,
                    'rejection_note' => $validated['note'] ?? null,
                    'reviewed_by' => $request->user()->id,
                    'reviewed_at' => now(),
                ]);

            if ($count === 1) {
                EditorialAudit::create([
                    'actor_id' => $request->user()->id,
                    'action' => strtolower($subjectType).'.moderated',
                    'subject_type' => $subjectType,
                    'subject_id' => $subjectId,
                    'metadata' => [
                        'decision' => $validated['action'],
                        'from_status' => Artwork::STATUS_PENDING_REVIEW,
                        'to_status' => $status,
                        'note_provided' => filled($validated['note'] ?? null),
                    ],
                ]);
            }

            return $count;
        });

        if ($updated !== 1) {
            return response()->json([
                'message' => 'این اثر هم‌زمان توسط مدیر دیگری بررسی شده است.',
            ], 422);
        }

        $freshArtwork = $artwork->fresh()->load(['category', 'artistProfile']);

        $data = $content
            ? $this->contentPayload($content->fresh()->load(['artistProfile', 'artwork.category']))
            : $this->payload($freshArtwork);

        return response()->json([
            'message' => match ($validated['action']) {
                'approve' => 'اثر تأیید شد.',
                'reject' => 'اثر رد شد.',
                'request_changes' => 'درخواست اصلاح برای هنرمند ثبت شد.',
            },
            'data' => $data,
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function contentPayload(ArtistContent $content): array
    {
        $artwork = $content->artwork;
        $available = $content->source === ArtistContent::SOURCE_NATIVE && $artwork !== null;

        return [
            'id' => $content->id,
            'title' => $content->title ?: $artwork?->title,
            'description' => $content->description ?: $artwork?->description,
            'source' => $content->source,
            'content_type' => $content->content_type,
            'publication_status' => $content->publication_status,
            'artist_approved_at' => $content->artist_approved_at?->toISOString(),
            'moderation_status' => $available ? $artwork->status : 'unavailable',
            'rejection_note' => $available ? $artwork->rejection_note : null,
            'image_url' => $available ? route('api.v1.artworks.image', $artwork->slug) : null,
            'category' => $available && $artwork->category ? [
                'name' => $artwork->category->name,
            ] : null,
            'artist' => [
                'display_name' => $content->artistProfile?->display_name,
            ],
            'created_at' => $content->created_at?->toISOString(),
        ];
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(Artwork $artwork): array
    {
        return [
            'id' => $artwork->id,
            'slug' => $artwork->slug,
            'title' => $artwork->title,
            'description' => $artwork->description,
            'medium' => $artwork->medium,
            'dimensions' => $artwork->dimensions,
            'year' => $artwork->year,
            'price' => $artwork->price,
            'availability' => $artwork->availability,
            'status' => $artwork->status,
            'rejection_note' => $artwork->rejection_note,
            'image_url' => route('api.v1.artworks.image', $artwork->slug),
            'category' => ['id' => $artwork->category->id, 'name' => $artwork->category->name, 'slug' => $artwork->category->slug],
            'artist' => [
                'display_name' => $artwork->artistProfile->display_name,
                'slug' => $artwork->artistProfile->slug,
            ],
            'created_at' => $artwork->created_at?->toISOString(),
            'reviewed_at' => $artwork->reviewed_at?->toISOString(),
        ];
    }
}
