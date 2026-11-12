<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Http\JsonResponse;

class HealthController
{
    public function __invoke(): JsonResponse
    {
        return response()->json([
            'status' => 'ok',
            'service' => 'rad-art-marketplace-api',
            'version' => 'v1',
            'browser_test_ready' => app()->environment(['local', 'testing'])
                && env('RAD_ART_BROWSER_TEST_MODE') === '1'
                && config('database.default') === 'sqlite'
                && basename((string) config('database.connections.sqlite.database')) === 'browser-testing.sqlite',
        ]);
    }
}
