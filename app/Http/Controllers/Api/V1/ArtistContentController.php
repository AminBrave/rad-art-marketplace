<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Resources\ArtistContentResource;
use App\Models\ArtistContent;
use App\Models\Artwork;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class ArtistContentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $this->authorize('viewAny', ArtistContent::class);

        $filters = $request->validate([
            'content_type' => ['sometimes', 'string', 'max:32'],
            'source' => ['sometimes', 'string', 'max:32'],
            'publication_status' => ['sometimes', Rule::in([
                ArtistContent::PUBLICATION_DRAFT,
                ArtistContent::PUBLICATION_PUBLISHED,
                ArtistContent::PUBLICATION_ARCHIVED,
            ])],
            'per_page' => ['sometimes', 'integer', 'min:1', 'max:48'],
        ]);

        $profile = $request->user()->artistProfile()->firstOrFail();
        $contents = $profile->contents()
            ->with('artwork')
            ->when(isset($filters['content_type']), fn ($query) => $query->where('content_type', $filters['content_type']))
            ->when(isset($filters['source']), fn ($query) => $query->where('source', $filters['source']))
            ->when(isset($filters['publication_status']), fn ($query) => $query->where('publication_status', $filters['publication_status']))
            ->orderByDesc('created_at')
            ->orderByDesc('id')
            ->paginate($filters['per_page'] ?? 12)
            ->through(fn (ArtistContent $content): array => (new ArtistContentResource($content))->resolve($request));

        return response()->json($contents);
    }

    public function approve(ArtistContent $content): JsonResponse
    {
        $this->authorize('update', $content);

        if ($content->source !== ArtistContent::SOURCE_NATIVE) {
            abort(409, 'محتوای واردشده تا زمان تکمیل بررسی اتصال منبع قابل تأیید نیست.');
        }

        DB::transaction(function () use ($content): void {
            $locked = ArtistContent::query()->lockForUpdate()->findOrFail($content->id);

            if ($locked->artist_approved_at === null) {
                $locked->forceFill(['artist_approved_at' => now()])->save();
            }
        });

        $content->refresh()->load('artwork');

        return response()->json([
            'message' => 'تأیید هنرمند برای این محتوا ثبت شد.',
            'data' => (new ArtistContentResource($content))->resolve(request()),
        ]);
    }

    public function publish(Request $request, ArtistContent $content): JsonResponse
    {
        $this->authorize('update', $content);

        if ($content->source !== ArtistContent::SOURCE_NATIVE) {
            abort(409, 'انتشار محتوای واردشده تا زمان تکمیل بررسی اتصال منبع در دسترس نیست.');
        }

        DB::transaction(function () use ($request, $content): void {
            $locked = ArtistContent::query()->lockForUpdate()->with(['artwork' => fn ($query) => $query->lockForUpdate()])->findOrFail($content->id);
            $profile = $request->user()->artistProfile()->lockForUpdate()->firstOrFail();

            if (! $profile->is_public) {
                abort(409, 'برای انتشار محتوا ابتدا نمایان‌بودن پروفایل هنرمند را فعال کنید.');
            }

            if ($locked->artist_approved_at === null) {
                abort(409, 'پیش از انتشار، تأیید هنرمند برای محتوا الزامی است.');
            }

            if ($locked->content_type === 'artwork' && ! $locked->artwork) {
                abort(409, 'محتوای اثر هنری باید به یک اثر ثبت‌شده متصل باشد.');
            }

            if ($locked->artwork && $locked->artwork->status !== Artwork::STATUS_APPROVED) {
                abort(409, 'اثر هنری تا تأیید مدیر قابل انتشار نیست.');
            }

            $locked->forceFill([
                'publication_status' => ArtistContent::PUBLICATION_PUBLISHED,
            ])->save();
        });

        $content->refresh()->load('artwork');

        return response()->json([
            'message' => 'محتوا منتشر شد.',
            'data' => (new ArtistContentResource($content))->resolve($request),
        ]);
    }

    public function unpublish(Request $request, ArtistContent $content): JsonResponse
    {
        $this->authorize('update', $content);

        DB::transaction(function () use ($content): void {
            $locked = ArtistContent::query()->lockForUpdate()->findOrFail($content->id);
            $locked->forceFill([
                'publication_status' => ArtistContent::PUBLICATION_DRAFT,
            ])->save();

            DB::table('artist_collections')
                ->whereIn('id', DB::table('artist_collection_items')
                    ->select('artist_collection_id')
                    ->where('artist_content_id', $locked->id))
                ->where('visibility', 'public')
                ->update([
                    'visibility' => 'private',
                    'published_at' => null,
                    'updated_at' => now(),
                ]);
        });

        $content->refresh()->load('artwork');

        return response()->json([
            'message' => 'محتوا از انتشار خارج شد.',
            'data' => (new ArtistContentResource($content))->resolve($request),
        ]);
    }
}
