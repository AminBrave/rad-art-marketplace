<?php

namespace Tests\Feature;

use Tests\TestCase;

class HealthEndpointTest extends TestCase
{
    public function test_versioned_api_health_endpoint_returns_ok(): void
    {
        $this->getJson('/api/v1/health')
            ->assertOk()
            ->assertJson([
                'status' => 'ok',
                'service' => 'rad-art-marketplace-api',
                'version' => 'v1',
                'browser_test_ready' => false,
            ]);
    }
}
