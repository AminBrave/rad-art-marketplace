<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ArtistProfile;
use App\Models\Artwork;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DirectConversationController extends Controller
{
    public function start(Request $request): JsonResponse
    {
        $buyer = $request->user();
        abort_unless($buyer && $buyer->role === User::ROLE_BUYER, 403);

        $data = $request->validate([
            'artist_slug' => ['required', 'string', 'max:180'],
            'artwork_slug' => ['nullable', 'string', 'max:180'],
        ]);

        $profile = ArtistProfile::query()
            ->where('slug', $data['artist_slug'])
            ->where('is_public', true)
            ->whereHas('user', fn ($q) => $q->where('role', User::ROLE_ARTIST))
            ->firstOrFail();

        $artwork = null;
        if (! empty($data['artwork_slug'])) {
            $artwork = Artwork::query()
                ->where('slug', $data['artwork_slug'])
                ->where('artist_profile_id', $profile->id)
                ->where('status', Artwork::STATUS_APPROVED)
                ->firstOrFail();
        }

        $artistId = (int) $profile->user_id;
        abort_if($artistId === (int) $buyer->id, 422, 'امکان شروع گفتگو با حساب خودتان وجود ندارد.');

        $conversation = DB::transaction(function () use ($buyer, $artistId, $artwork): Conversation {
            $pairKey = $buyer->id.':'.$artistId;
            $conversation = Conversation::query()->where('pair_key', $pairKey)->lockForUpdate()->first();

            if (! $conversation) {
                $conversation = Conversation::query()->create([
                    'inquiry_id' => null,
                    'pair_key' => $pairKey,
                    'buyer_user_id' => $buyer->id,
                    'artist_user_id' => $artistId,
                    'last_message_at' => now(),
                ]);
            }

            if ($artwork) {
                DB::table('conversation_contexts')->updateOrInsert([
                    'conversation_id' => $conversation->id,
                    'artwork_id' => $artwork->id,
                    'inquiry_id' => null,
                ], [
                    'added_by_user_id' => $buyer->id,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }

            return $conversation;
        });

        return response()->json(['data' => ['id' => $conversation->id]], 201);
    }
}
