<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Artwork;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminArtworkModerationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['sometimes', 'string', Rule::in([
                Artwork::STATUS_PENDING_REVIEW,
                Artwork::STATUS_APPROVED,
                Artwork::STATUS_REJECTED,
                Artwork::STATUS_CHANGES_REQUESTED,
            ])],
        ]);

        $artworks = Artwork::query()
            ->with(['category', 'artistProfile'])
            ->when($validated['status'] ?? null, fn ($query, $status) => $query->where('status', $status))
            ->latest()
            ->paginate(20)
            ->through(fn (Artwork $artwork): array => $this->payload($artwork));

        return response()->json($artworks);
    }

    public function update(Request $request, Artwork $artwork): JsonResponse
    {
        $validated = $request->validate([
            'action' => ['required', 'string', Rule::in(['approve', 'reject', 'request_changes'])],
            'note' => ['nullable', 'string', 'max:2000', 'required_if:action,reject,request_changes'],
        ]);

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

        $updated = Artwork::query()
            ->whereKey($artwork->getKey())
            ->where('status', Artwork::STATUS_PENDING_REVIEW)
            ->update([
                'status' => $status,
                'rejection_note' => $validated['note'] ?? null,
                'reviewed_by' => $request->user()->id,
                'reviewed_at' => now(),
            ]);

        if ($updated !== 1) {
            return response()->json([
                'message' => 'این اثر هم‌زمان توسط مدیر دیگری بررسی شده است.',
            ], 422);
        }

        return response()->json([
            'message' => match ($validated['action']) {
                'approve' => 'اثر تأیید و در کاتالوگ عمومی منتشر شد.',
                'reject' => 'اثر رد شد.',
                'request_changes' => 'درخواست اصلاح برای هنرمند ثبت شد.',
            },
            'data' => $this->payload($artwork->refresh()->load(['category', 'artistProfile'])),
        ]);
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
