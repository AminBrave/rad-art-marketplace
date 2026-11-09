<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ArtistInquiry;
use App\Models\ArtistProfile;
use App\Models\Artwork;
use App\Models\Category;
use App\Models\User;
use Database\Seeders\DemoDatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

class DemoDatabaseSeederTest extends TestCase
{
    use RefreshDatabase;

    public function test_demo_seeder_covers_roles_states_pagination_and_private_images(): void
    {
        Storage::fake('local');
        $this->seed(DemoDatabaseSeeder::class);

        $this->assertDatabaseHas('users', ['email' => 'admin@rademan.test', 'role' => User::ROLE_ADMIN]);
        $this->assertDatabaseHas('users', ['email' => 'artist@rademan.test', 'role' => User::ROLE_ARTIST]);
        $this->assertDatabaseHas('users', ['email' => 'buyer@rademan.test', 'role' => User::ROLE_BUYER]);
        $this->assertTrue(Hash::check('Demo@12345', User::query()->where('email', 'admin@rademan.test')->value('password')));

        $this->assertSame(22, User::query()->count());
        $this->assertSame(14, ArtistProfile::query()->count());
        $this->assertSame(13, ArtistProfile::query()->where('is_public', true)->count());
        $this->assertSame(6, Category::query()->where('is_active', true)->count());
        $this->assertSame(1, Category::query()->where('is_active', false)->count());
        $this->assertSame(70, Artwork::query()->count());
        $mainArtistId = ArtistProfile::query()->where('slug', 'arman-rezaei')->value('id');
        $this->assertSame(15, Artwork::query()->where('artist_profile_id', $mainArtistId)->where('status', Artwork::STATUS_APPROVED)->count());

        foreach ([Artwork::STATUS_PENDING_REVIEW, Artwork::STATUS_APPROVED, Artwork::STATUS_REJECTED, Artwork::STATUS_CHANGES_REQUESTED] as $status) {
            $this->assertDatabaseHas('artworks', ['status' => $status]);
        }
        foreach (['available', 'sold', 'not_for_sale'] as $availability) {
            $this->assertDatabaseHas('artworks', ['availability' => $availability]);
        }
        foreach ([ArtistInquiry::STATUS_NEW, ArtistInquiry::STATUS_READ, ArtistInquiry::STATUS_ARCHIVED] as $status) {
            $this->assertDatabaseHas('artist_inquiries', ['status' => $status]);
        }

        $this->assertSame(48, ArtistInquiry::query()->count());
        $this->assertGreaterThan(0, ArtistInquiry::query()->whereNull('artwork_id')->count());
        $this->assertGreaterThan(0, ArtistInquiry::query()->whereNotNull('artwork_id')->count());
        $sample = Artwork::query()->where('slug', 'demo-01-01')->firstOrFail();
        Storage::disk('local')->assertExists($sample->image_path);
    }


    public function test_seeded_accounts_exercise_admin_and_buyer_pagination(): void
    {
        Storage::fake('local');
        $this->seed(DemoDatabaseSeeder::class);

        $admin = User::query()->where('email', 'admin@rademan.test')->firstOrFail();
        $this->actingAs($admin)->getJson('/api/v1/admin/users')
            ->assertOk()
            ->assertJsonCount(20, 'data')
            ->assertJsonPath('total', 22)
            ->assertJsonPath('current_page', 1);
        $this->actingAs($admin)->getJson('/api/v1/admin/users?page=2')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('current_page', 2);

        $buyer = User::query()->where('email', 'buyer@rademan.test')->firstOrFail();
        $this->actingAs($buyer)->getJson('/api/v1/buyer/inquiries')
            ->assertOk()
            ->assertJsonCount(10, 'data')
            ->assertJsonPath('total', 12);
        $this->actingAs($buyer)->getJson('/api/v1/buyer/inquiries?page=2')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('current_page', 2);
    }

    public function test_demo_seeder_is_repeatable_without_duplicate_records(): void
    {
        Storage::fake('local');
        $this->seed(DemoDatabaseSeeder::class);
        $counts = [User::count(), ArtistProfile::count(), Category::count(), Artwork::count(), ArtistInquiry::count()];

        $this->seed(DemoDatabaseSeeder::class);

        $this->assertSame($counts, [User::count(), ArtistProfile::count(), Category::count(), Artwork::count(), ArtistInquiry::count()]);
    }
}
