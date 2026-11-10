<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\ShowcaseDatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use RuntimeException;
use Tests\TestCase;

class ShowcaseDatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_showcase_seeder_refuses_to_run_outside_production(): void
    {
        $this->expectException(RuntimeException::class);

        $this->seed(ShowcaseDatabaseSeeder::class);
    }

    public function test_production_showcase_uses_existing_admin_and_preserves_existing_demo_accounts(): void
    {
        Storage::fake('local');
        app()->detectEnvironment(fn (): string => 'production');
        config([
            'showcase.seeding_enabled' => true,
            'showcase.password' => str_repeat('RademanShowcaseSecret-', 2),
        ]);

        $admin = User::query()->create([
            'name' => 'Production administrator',
            'email' => 'owner@example.com',
            'password' => Hash::make('a-separate-admin-password'),
            'role' => User::ROLE_ADMIN,
            'email_verified_at' => now(),
        ]);

        $this->seed(ShowcaseDatabaseSeeder::class);

        $artist = User::query()->where('email', 'artist@rademan.test')->firstOrFail();
        $artist->update(['name' => 'Manually edited showcase artist']);

        $this->seed(ShowcaseDatabaseSeeder::class);

        $this->assertDatabaseHas('users', ['id' => $admin->id, 'email' => 'owner@example.com']);
        $this->assertDatabaseMissing('users', ['email' => 'admin@rademan.test']);
        $this->assertSame('Manually edited showcase artist', $artist->fresh()->name);
        $this->assertTrue(Hash::check(
            str_repeat('RademanShowcaseSecret-', 2),
            $artist->fresh()->password,
        ));
        $this->assertDatabaseHas('artist_profiles', ['slug' => 'arman-rezaei']);
        $this->assertDatabaseHas('artworks', ['slug' => 'demo-01-01']);
        $this->assertDatabaseHas('curated_collections', ['slug' => 'demo-curated-selection']);
        $this->assertDatabaseHas('featured_artist_selections', ['artist_profile_id' => $artist->artistProfile->id]);
    }

    public function test_production_showcase_refuses_reserved_email_role_collisions_before_writing(): void
    {
        app()->detectEnvironment(fn (): string => 'production');
        config([
            'showcase.seeding_enabled' => true,
            'showcase.password' => str_repeat('RademanShowcaseSecret-', 2),
        ]);

        User::query()->create([
            'name' => 'Unexpected account',
            'email' => 'artist@rademan.test',
            'password' => Hash::make('unrelated-secret'),
            'role' => User::ROLE_BUYER,
        ]);

        try {
            app(\Database\Seeders\DemoDatabaseSeeder::class)->runForShowcase();
            $this->fail('Expected a reserved-account collision to abort seeding.');
        } catch (RuntimeException $exception) {
            $this->assertStringContainsString('account collision', $exception->getMessage());
        }

        $this->assertDatabaseCount('categories', 0);
    }
}
