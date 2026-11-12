<?php

declare(strict_types=1);

namespace Tests\Feature;

use Tests\TestCase;

final class FrontendRoutingTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }

    public function test_nested_frontend_routes_serve_the_react_entry_view(): void
    {
        foreach ([
            '/login',
            '/register',
            '/dashboard',
            '/dashboard/artist',
            '/dashboard/buyer',
            '/admin',
            '/artworks',
            '/artists',
            '/collections',
            '/dashboard/artist/profile',
            '/dashboard/artist/artworks',
            '/admin/users',
            '/admin/artworks',
            '/about',
            '/contact',
            '/help',
        ] as $path) {
            $this->get($path)
                ->assertOk()
                ->assertViewIs('app');
        }
    }

    public function test_api_routes_are_not_captured_by_the_frontend_fallback(): void
    {
        $this->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertExactJson(['data' => null]);
    }
}
