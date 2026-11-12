<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ArtistProfile;
use App\Models\Artwork;
use App\Models\Category;
use App\Models\Conversation;
use App\Models\User;
use Database\Seeders\DemoDatabaseSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
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
        $this->assertGreaterThan(0, DB::table('conversations')->count());
        $this->assertGreaterThan(0, DB::table('messages')->whereNotNull('artwork_id')->count());
        $this->assertGreaterThan(0, DB::table('conversation_contexts')->whereNotNull('artwork_id')->count());
        $this->assertGreaterThan(0, DB::table('message_reactions')->count());
        $this->assertGreaterThan(0, DB::table('message_attachments')->count());
        $this->assertGreaterThan(0, DB::table('notifications')->count());
        $this->assertGreaterThan(0, DB::table('message_reports')->count());
        $this->assertGreaterThan(0, DB::table('message_moderation_audits')->count());
        $this->assertGreaterThan(0, DB::table('user_blocks')->count());
        $this->assertGreaterThan(0, DB::table('conversations')->whereNotNull('buyer_archived_at')->count());
        $this->assertGreaterThan(0, DB::table('conversations')->whereNotNull('artist_archived_at')->count());
        $this->assertGreaterThan(0, DB::table('conversations')->whereNotNull('buyer_muted_at')->count());
        $this->assertGreaterThan(0, DB::table('conversations')->whereNotNull('artist_muted_at')->count());
        $this->assertGreaterThan(0, DB::table('messages')->whereNull('read_at')->count());
        $this->assertGreaterThan(0, DB::table('messages')->whereNotNull('read_at')->count());
        $sample = Artwork::query()->where('slug', 'demo-01-01')->firstOrFail();
        Storage::disk('local')->assertExists($sample->image_path);
        $missingImage = Artwork::query()->where('slug', 'demo-broken-image')->firstOrFail();
        Storage::disk('local')->assertMissing($missingImage->image_path);
    }

    public function test_seeded_accounts_support_admin_pagination(): void
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

    public function test_seeded_empty_buyer_has_no_conversations(): void
    {
        Storage::fake('local');
        $this->seed(DemoDatabaseSeeder::class);

        $emptyBuyer = User::query()->where('email', 'buyer-empty@rademan.test')->firstOrFail();
        $this->assertSame(0, DB::table('conversations')->where('buyer_user_id', $emptyBuyer->id)->count());

        $privateStarter = User::query()->where('email', 'new-artist-01@rademan.test')->firstOrFail();
        $this->actingAs($privateStarter)->getJson('/api/v1/artist-profile/me')
            ->assertOk()->assertJsonPath('data.is_public', false)->assertJsonPath('data.bio', null);
        $this->getJson('/api/v1/artists/new-artist-private-preview')
            ->assertOk()->assertJsonPath('data.is_public', false);

        $publicStarter = User::query()->where('email', 'new-artist-02@rademan.test')->firstOrFail();
        $this->actingAs($publicStarter)->getJson('/api/v1/artist/artworks')
            ->assertOk()->assertJsonCount(0, 'data')->assertJsonPath('total', 0);

        $this->get('/api/v1/artworks/demo-broken-image/image')->assertNotFound();
    }

    public function test_demo_seeder_removes_empty_buyer_demo_threads_without_touching_unrelated_threads(): void
    {
        Storage::fake('local');
        $emptyBuyer = User::query()->create([
            'name' => 'خریدار بدون گفتگو',
            'email' => 'buyer-empty@rademan.test',
            'password' => 'Demo@12345',
            'role' => User::ROLE_BUYER,
        ]);
        $artist = User::query()->create([
            'name' => 'هنرمند نمونه',
            'email' => 'artist@rademan.test',
            'password' => 'Demo@12345',
            'role' => User::ROLE_ARTIST,
        ]);
        $externalArtist = User::query()->create([
            'name' => 'هنرمند خارج از داده نمایشی',
            'email' => 'external-artist@example.test',
            'password' => 'strong-password-123',
            'role' => User::ROLE_ARTIST,
        ]);
        $retiredThread = Conversation::query()->create([
            'pair_key' => $emptyBuyer->id.':'.$artist->id,
            'buyer_user_id' => $emptyBuyer->id,
            'artist_user_id' => $artist->id,
        ]);
        $unrelatedThread = Conversation::query()->create([
            'pair_key' => $emptyBuyer->id.':'.$externalArtist->id,
            'buyer_user_id' => $emptyBuyer->id,
            'artist_user_id' => $externalArtist->id,
        ]);

        app(DemoDatabaseSeeder::class)->run();

        $this->assertDatabaseMissing('conversations', ['id' => $retiredThread->id]);
        $this->assertDatabaseHas('conversations', ['id' => $unrelatedThread->id]);
    }

    public function test_demo_seeder_is_repeatable_without_duplicate_records(): void
    {
        Storage::fake('local');
        $this->seed(DemoDatabaseSeeder::class);
        $tables = ['users', 'artist_profiles', 'categories', 'artworks', 'conversations', 'messages', 'conversation_contexts', 'message_reactions', 'message_attachments', 'notifications', 'message_reports', 'message_moderation_audits', 'user_blocks', 'curated_collections', 'featured_artist_selections', 'editorial_audits'];
        $counts = array_map(fn (string $table): int => DB::table($table)->count(), $tables);

        $this->seed(DemoDatabaseSeeder::class);

        $this->assertSame($counts, array_map(fn (string $table): int => DB::table($table)->count(), $tables));
    }
}
