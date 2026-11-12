<?php

declare(strict_types=1);

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        RateLimiter::for('auth-guest', function (Request $request): array {
            $email = mb_strtolower(trim((string) $request->input('email')));
            $identityKey = hash('sha256', $email);

            if ($this->app->environment('local')) {
                return [
                    Limit::perMinute(120)->by('auth-identity:'.$request->ip().':'.$identityKey),
                    Limit::perHour(1200)->by('auth-email:'.$identityKey),
                    Limit::perMinute(1200)->by('auth-ip:'.$request->ip()),
                ];
            }

            return [
                Limit::perMinute(10)->by('auth-identity:'.$request->ip().':'.$identityKey),
                Limit::perHour(20)->by('auth-email:'.$identityKey),
                Limit::perMinute(300)->by('auth-ip:'.$request->ip()),
            ];
        });
    }
}
