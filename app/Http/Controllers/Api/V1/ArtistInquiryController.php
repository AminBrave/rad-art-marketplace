<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ArtistInquiry;
use App\Models\ArtistProfile;
use App\Models\Artwork;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ArtistInquiryController extends Controller
{
    public function store(Request $request, ArtistProfile $artistProfile): JsonResponse
    {
        abort_unless($artistProfile->is_public, 404);
        abort_if((int) $artistProfile->user_id === (int) $request->user()->id, 403);

        $validated = $request->validate([
            'subject' => ['required', 'string', 'min:4', 'max:160'],
            'message' => ['required', 'string', 'min:20', 'max:3000'],
            'artwork_id' => ['nullable', 'integer', 'exists:artworks,id'],
            'honeypot' => ['nullable', 'prohibited'],
        ]);

        $artwork = null;

        if (! empty($validated['artwork_id'])) {
            $artwork = Artwork::query()
                ->whereKey($validated['artwork_id'])
                ->where('artist_profile_id', $artistProfile->id)
                ->where('status', Artwork::STATUS_APPROVED)
                ->firstOrFail();
        }

        $inquiry = ArtistInquiry::query()->create([
            'artist_profile_id' => $artistProfile->id,
            'sender_user_id' => $request->user()->id,
            'artwork_id' => $artwork?->id,
            'subject' => $validated['subject'],
            'message' => $validated['message'],
            'status' => ArtistInquiry::STATUS_NEW,
        ]);

        return response()->json([
            'message' => 'پیام شما با موفقیت برای هنرمند ارسال شد.',
            'data' => $this->payload($inquiry->load(['artistProfile', 'artwork']), false),
        ], 201);
    }

    public function buyerIndex(Request $request): JsonResponse
    {
        $inquiries = ArtistInquiry::query()
            ->where('sender_user_id', $request->user()->id)
            ->with(['artistProfile', 'artwork'])
            ->latest()
            ->paginate(10)
            ->through(fn (ArtistInquiry $inquiry): array => $this->payload($inquiry, false));

        return response()->json($inquiries);
    }

    public function buyerShow(Request $request, ArtistInquiry $inquiry): JsonResponse
    {
        abort_unless((int) $inquiry->sender_user_id === (int) $request->user()->id, 404);

        return response()->json([
            'data' => $this->payload($inquiry->load(['artistProfile', 'artwork']), false),
        ]);
    }

    public function artistIndex(Request $request): JsonResponse
    {
        $profile = $request->user()->artistProfile()->firstOrFail();
        $inquiries = $profile->inquiries()
            ->with(['sender', 'artwork'])
            ->latest()
            ->paginate(10)
            ->through(fn (ArtistInquiry $inquiry): array => $this->payload($inquiry, true));

        return response()->json($inquiries);
    }

    public function artistShow(Request $request, ArtistInquiry $inquiry): JsonResponse
    {
        $profile = $request->user()->artistProfile()->firstOrFail();
        abort_unless((int) $inquiry->artist_profile_id === (int) $profile->id, 404);

        return response()->json([
            'data' => $this->payload($inquiry->load(['sender', 'artwork', 'artistProfile']), true),
        ]);
    }

    public function updateForArtist(Request $request, ArtistInquiry $inquiry): JsonResponse
    {
        $profile = $request->user()->artistProfile()->firstOrFail();
        abort_unless($inquiry->artist_profile_id === $profile->id, 404);

        $validated = $request->validate([
            'status' => ['required', Rule::in([ArtistInquiry::STATUS_READ, ArtistInquiry::STATUS_ARCHIVED])],
        ]);

        $inquiry->update([
            'status' => $validated['status'],
            'read_at' => $validated['status'] === ArtistInquiry::STATUS_READ
                ? ($inquiry->read_at ?? now())
                : $inquiry->read_at,
        ]);

        return response()->json([
            'message' => 'وضعیت پیام به‌روزرسانی شد.',
            'data' => $this->payload($inquiry->refresh()->load(['sender', 'artwork', 'artistProfile']), true),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    private function payload(ArtistInquiry $inquiry, bool $forArtist): array
    {
        $payload = [
            'id' => $inquiry->id,
            'subject' => $inquiry->subject,
            'message' => $inquiry->message,
            'status' => $inquiry->status,
            'read_at' => $inquiry->read_at?->toISOString(),
            'created_at' => $inquiry->created_at?->toISOString(),
            'artist' => [
                'display_name' => $inquiry->artistProfile->display_name,
                'slug' => $inquiry->artistProfile->slug,
            ],
            'artwork' => $inquiry->artwork ? [
                'title' => $inquiry->artwork->title,
                'slug' => $inquiry->artwork->slug,
            ] : null,
        ];

        if ($forArtist) {
            $payload['buyer'] = [
                'name' => $inquiry->sender->name,
            ];
        }

        return $payload;
    }
}
