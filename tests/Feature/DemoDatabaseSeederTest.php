<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ArtistInquiry;
use App\Models\ArtistProfile;
use App\Models\Artwork;
use App\Models\Category;
use App\Models\CuratedCollection;
use App\Models\EditorialAudit;
use App\Models\FeaturedArtistSelection;
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

        $this->assertSame(23, User::query()->count());
        $this->assertSame(16, ArtistProfile::query()->count());
        $this->assertSame(14, ArtistProfile::query()->where('is_public', true)->count());
        $this->assertSame(6, Category::query()->where('is_active', true)->count());
        $this->assertSame(1, Category::query()->where('is_active', false)->count());
        $this->assertSame(71, Artwork::query()->count());
        $mainArtistId = ArtistProfile::query()->where('slug', 'arman-rezaei')->value('id');
        $this->assertSame(16, Artwork::query()->where('artist_profile_id', $mainArtistId)->where('status', Artwork::STATUS_APPROVED)->count());

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
        $missingImage = Artwork::query()->where('slug', 'demo-broken-image')->firstOrFail();
        Storage::disk('local')->assertMissing($missingImage->image_path);
    }

    public function test_seeded_inquiry_records_are_preserved_but_buyer_api_is_disabled(): void
    {
        Storage::fake('local');
        $this->seed(DemoDatabaseSeeder::class);

        $admin = User::query()->where('email', 'admin@rademan.test')->firstOrFail();
        $this->actingAs($admin)->getJson('/api/v1/admin/users')
            ->assertOk()
            ->assertJsonCount(20, 'data')
            ->assertJsonPath('total', 23)
            ->assertJsonPath('current_page', 1);
        $this->actingAs($admin)->getJson('/api/v1/admin/users?page=2')
            ->assertOk()
            ->assertJsonCount(3, 'data')
            ->assertJsonPath('current_page', 2);

        $buyer = User::query()->where('email', 'buyer@rademan.test')->firstOrFail();
        $this->assertSame(12, ArtistInquiry::query()->where('sender_user_id', $buyer->id)->count());
        $this->actingAs($buyer)->getJson('/api/v1/buyer/inquiries')->assertNotFound();
        $this->actingAs($buyer)->getJson('/api/v1/buyer/inquiries?page=2')->assertNotFound();
    }

    public function test_seeded_editorial_variations_are_filtered_from_public_endpoints(): void
    {
        Storage::fake('local');
        $this->seed(DemoDatabaseSeeder::class);

        $this->getJson('/api/v1/collections')
            ->assertOk()
            ->assertJsonFragment(['slug' => 'demo-curated-selection'])
            ->assertJsonFragment(['slug' => 'demo-curated-mixed-visibility'])
            ->assertJsonFragment(['slug' => 'demo-curated-empty'])
            ->assertJsonMissing(['slug' => 'demo-curated-draft'])
            ->assertJsonMissing(['slug' => 'demo-curated-upcoming']);

        $this->getJson('/api/v1/collections/demo-curated-mixed-visibility')
            ->assertOk()->assertJsonCount(1, 'data.artworks');
        $this->getJson('/api/v1/collections/demo-curated-draft')->assertNotFound();
        $this->getJson('/api/v1/collections/demo-curated-upcoming')->assertNotFound();
        $this->getJson('/api/v1/featured-artists')->assertOk()->assertJsonCount(2, 'data');

        $admin = User::query()->where('email', 'admin@rademan.test')->firstOrFail();
        $this->actingAs($admin)->getJson('/api/v1/admin/editorial/collections')
            ->assertOk()->assertJsonPath('total', 5);
        $this->actingAs($admin)->getJson('/api/v1/admin/editorial/featured-artists')
            ->assertOk()->assertJsonCount(6, 'data');
    }

    public function test_seeded_empty_accounts_keep_inquiry_api_disabled(): void
    {
        Storage::fake('local');
        $this->seed(DemoDatabaseSeeder::class);

        $emptyBuyer = User::query()->where('email', 'buyer-empty@rademan.test')->firstOrFail();
        $this->actingAs($emptyBuyer)->getJson('/api/v1/buyer/inquiries')->assertNotFound();

        $privateStarter = User::query()->where('email', 'new-artist-01@rademan.test')->firstOrFail();
        $this->actingAs($privateStarter)->getJson('/api/v1/artist-profile/me')
            ->assertOk()->assertJsonPath('data.is_public', false)->assertJsonPath('data.bio', null);
        $this->getJson('/api/v1/artists/new-artist-private-preview')
            ->assertOk()->assertJsonPath('data.is_public', false);

        $publicStarter = User::query()->where('email', 'new-artist-02@rademan.test')->firstOrFail();
        $this->actingAs($publicStarter)->getJson('/api/v1/artist/artworks')
            ->assertOk()->assertJsonCount(0, 'data')->assertJsonPath('total', 0);
        $this->actingAs($publicStarter)->getJson('/api/v1/artist/inquiries')->assertNotFound();

        $this->get('/api/v1/artworks/demo-broken-image/image')->assertNotFound();
    }

    public function test_demo_seeder_is_repeatable_without_duplicate_records(): void
    {
        Storage::fake('local');
        $this->seed(DemoDatabaseSeeder::class);
        $counts = [User::count(), ArtistProfile::count(), Category::count(), Artwork::count(), ArtistInquiry::count(), CuratedCollection::count(), FeaturedArtistSelection::count(), EditorialAudit::count()];

        $this->seed(DemoDatabaseSeeder::class);

        $this->assertSame($counts, [User::count(), ArtistProfile::count(), Category::count(), Artwork::count(), ArtistInquiry::count(), CuratedCollection::count(), FeaturedArtistSelection::count(), EditorialAudit::count()]);
    }
}
