<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\Instagram\UnifiedLoginClient;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Throwable;

class ArtistInstagramConnectionController extends Controller
{
    public function connect(Request $request, UnifiedLoginClient $instagram): RedirectResponse
    {
        $profile = $request->user()->artistProfile()->firstOrFail();
        $state = Str::random(48);

        try {
            $url = $instagram->authorizationUrl($state);
        } catch (Throwable) {
            abort(503, 'اتصال اینستاگرام هنوز در محیط برنامه پیکربندی نشده است.');
        }

        $request->session()->put('instagram_oauth', [
            'state' => $state,
            'artist_profile_id' => $profile->id,
        ]);

        return redirect()->away($url);
    }

    public function callback(Request $request, UnifiedLoginClient $instagram): RedirectResponse
    {
        $destination = redirect('/dashboard/artist/content');
        $pending = $request->session()->pull('instagram_oauth');
        $profile = $request->user()->artistProfile()->first();

        if (! is_array($pending)
            || ! is_string($pending['state'] ?? null)
            || ! is_string($request->query('state'))
            || ! hash_equals($pending['state'], $request->query('state'))
            || ! $profile
            || (int) ($pending['artist_profile_id'] ?? 0) !== $profile->id) {
            return $destination->with('error', 'درخواست اتصال اینستاگرام معتبر نیست. دوباره تلاش کنید.');
        }

        if ($request->filled('error')) {
            return $destination->with('error', 'اتصال اینستاگرام در متا لغو شد یا مجوز لازم داده نشد.');
        }

        $code = $request->query('code');

        if (! is_string($code) || $code === '') {
            return $destination->with('error', 'کد تأیید اینستاگرام دریافت نشد. دوباره تلاش کنید.');
        }

        try {
            $result = $instagram->exchangeAndProbe($code);
            $connection = $profile->instagramConnection()->first() ?? new \App\Models\InstagramConnection();
            $connection->forceFill([
                'artist_profile_id' => $profile->id,
                'configuration_id' => config('services.instagram.config_id'),
                'meta_user_id' => $result['meta_user_id'],
                'access_token' => $result['access_token'],
                'token_expires_at' => $result['token_expires_at'],
                'accounts' => $result['accounts'],
                'media_snapshot' => $result['media_snapshot'],
                'last_media_probe_at' => now(),
                'status' => 'connected',
            ])->save();
        } catch (Throwable) {
            return $destination->with('error', 'اتصال برقرار نشد یا دسترسی خواندن حساب و رسانه‌ها تأیید نشد. تنظیمات متا و دسترسی حساب را بررسی کنید.');
        }

        $accountCount = count($result['accounts']);
        $mediaCount = array_sum(array_map(
            fn (array $snapshot): int => count($snapshot['items'] ?? []),
            $result['media_snapshot']
        ));

        return $destination->with(
            'status',
            "اتصال آزمایشی اینستاگرام موفق بود: {$accountCount} حساب و {$mediaCount} مورد فراداده رسانه بررسی شد. هیچ فایل رسانه‌ای وارد یا ذخیره نشد."
        );
    }
}
