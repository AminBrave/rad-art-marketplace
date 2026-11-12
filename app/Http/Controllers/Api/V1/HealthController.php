<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Throwable;

class HealthController
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'service' => 'rad-art-marketplace-api',
            'version' => 'v1',
            'browser_test_ready' => $this->browserTestEnvironmentIsReady(),
        ]);
    }

    private function browserTestEnvironmentIsReady(): bool
    {
        if (
            ! app()->environment(['local', 'testing'])
            || env('RAD_ART_BROWSER_TEST_MODE') !== '1'
            || config('database.default') !== 'sqlite'
            || basename((string) config('database.connections.sqlite.database')) !== 'browser-testing.sqlite'
        ) {
            return false;
        }

        try {
            return Schema::hasTable('users')
                && DB::table('users')->where('email', 'admin@rademan.test')->exists();
        } catch (Throwable) {
            return false;
        }
    }
}
