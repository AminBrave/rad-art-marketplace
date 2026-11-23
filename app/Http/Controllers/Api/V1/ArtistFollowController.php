<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ArtistProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ArtistFollowController extends Controller
{
    public function follow(Request $request, ArtistProfile $artistProfile): JsonResponse
    {
        $this->ensurePublicProfile($artistProfile);
        abort_unless($artistProfile->user_id !== $request->user()->id, 422);

        DB::transaction(function () use ($request, $artistProfile): void {
            $created = DB::table('artist_follows')->insertOrIgnore([
                'artist_profile_id' => $artistProfile->id,
                'follower_user_id' => $request->user()->id,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            if ($created === 1) {
                $followId = (int) DB::table('artist_follows')
                    ->where('artist_profile_id', $artistProfile->id)
                    ->where('follower_user_id', $request->user()->id)
                    ->value('id');
                event('artist.followed', [$artistProfile, $request->user(), $followId]);
            }
        });

        return response()->json([
            'data' => [
                'is_following' => true,
                'followers_count' => $artistProfile->followers()->count(),
            ],
        ]);
    }

    public function unfollow(Request $request, ArtistProfile $artistProfile): JsonResponse
    {
        $this->ensurePublicProfile($artistProfile);

        $artistProfile->followers()
            ->where('follower_user_id', $request->user()->id)
            ->delete();

        return response()->json([
            'data' => [
                'is_following' => false,
                'followers_count' => $artistProfile->followers()->count(),
            ],
        ]);
    }

    private function ensurePublicProfile(ArtistProfile $artistProfile): void
    {
        abort_unless($artistProfile->is_public, 404);
    }
}
