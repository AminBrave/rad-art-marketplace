<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Models\Conversation;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\Response;

class EnsureConversationNotBlocked
{
    public function handle(Request $request, Closure $next): Response
    {
        $conversation = $request->route('conversation');
        $user = $request->user();

        if ($conversation instanceof Conversation && $user) {
            $otherId = (int) $conversation->buyer_user_id === (int) $user->id
                ? (int) $conversation->artist_user_id
                : (int) $conversation->buyer_user_id;

            $blocked = DB::table('user_blocks')->where(function ($query) use ($user, $otherId): void {
                $query->where('blocker_user_id', $user->id)->where('blocked_user_id', $otherId);
            })->orWhere(function ($query) use ($user, $otherId): void {
                $query->where('blocker_user_id', $otherId)->where('blocked_user_id', $user->id);
            })->exists();

            abort_if($blocked, 403, 'ارسال پیام در این گفتگو امکان‌پذیر نیست.');
        }

        return $next($request);
    }
}
