<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ArtistProfile;
use App\Models\Artwork;
use App\Models\Category;
use App\Models\CuratedCollection;
use App\Models\FeaturedArtistSelection;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EditorialTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        return User::create(['name' => 'Editor', 'email' => 'editor@example.com', 'password' => 'strong-password-123', 'role' => User::ROLE_ADMIN]);
    }

    private function artist(string $email = 'artist@example.com', bool $public = true): ArtistProfile
    {
        $user = User::create(['name' => 'Artist', 'email' => $email, 'password' => 'strong-password-123', 'role' => User::ROLE_ARTIST]);

        return $user->artistProfile()->create(['slug' => 'artist-'.str_replace(['@', '.'], '-', $email), 'display_name' => 'Artist '.$email, 'bio' => 'Artist biography', 'is_public' => $public]);
    }

    private function artwork(ArtistProfile $artist, string $slug, string $status = Artwork::STATUS_APPROVED): Artwork
    {
        $category = Category::firstOrCreate(['slug' => 'painting'], ['name' => 'Painting', 'is_active' => true]);

        return $artist->artworks()->create([
            'category_id' => $category->id, 'slug' => $slug, 'title' => $slug,
            'image_path' => 'artworks/'.$slug.'.jpg', 'status' => $status, 'availability' => 'available',
        ]);
    }

    public function test_admin_can_create_publish_and_unpublish_ordered_collection_of_public_approved_works(): void
    {
        $admin = $this->admin();
        $artist = $this->artist();
        $first = $this->artwork($artist, 'first-work');
        $second = $this->artwork($artist, 'second-work');

        $created = $this->actingAs($admin)->postJson('/api/v1/admin/editorial/collections', [
            'title' => 'A New Perspective', 'intro' => 'An editorial introduction',
            'artwork_ids' => [$second->id, $first->id], 'publish' => true,
        ])->assertCreated()->assertJsonPath('data.status', 'published');

        $slug = $created->json('data.slug');
        $this->getJson('/api/v1/collections')->assertOk()->assertJsonPath('data.0.slug', $slug);
        $this->getJson('/api/v1/collections/'.$slug)->assertOk()
            ->assertJsonPath('data.artworks.0.id', $second->id)
            ->assertJsonPath('data.artworks.1.id', $first->id);

        $id = $created->json('data.id');
        $this->actingAs($admin)->patchJson('/api/v1/admin/editorial/collections/'.$id.'/publication', ['publish' => false])->assertOk();
        $this->getJson('/api/v1/collections/'.$slug)->assertNotFound();
    }

    public function test_public_endpoints_never_expose_draft_or_unapproved_or_private_artist_artworks(): void
    {
        $admin = $this->admin();
        $publicArtist = $this->artist();
        $privateArtist = $this->artist('private@example.com', false);
        $approved = $this->artwork($publicArtist, 'approved-public');
        $pending = $this->artwork($publicArtist, 'pending-public', Artwork::STATUS_PENDING_REVIEW);
        $private = $this->artwork($privateArtist, 'approved-private');

        $draft = $this->actingAs($admin)->postJson('/api/v1/admin/editorial/collections', [
            'title' => 'Private Draft', 'artwork_ids' => [],
        ])->assertCreated();
        $this->getJson('/api/v1/collections/'.$draft->json('data.slug'))->assertNotFound();

        $this->actingAs($admin)->postJson('/api/v1/admin/editorial/collections', [
            'title' => 'Invalid Editorial', 'artwork_ids' => [$pending->id],
        ])->assertUnprocessable();
        $this->actingAs($admin)->postJson('/api/v1/admin/editorial/collections', [
            'title' => 'Private Artist Work', 'artwork_ids' => [$private->id],
        ])->assertUnprocessable();

        $collection = CuratedCollection::create(['slug' => 'public-after-moderation', 'title' => 'Public', 'status' => 'published', 'published_at' => now()]);
        $collection->artworks()->attach([$approved->id, $pending->id, $private->id]);
        $this->getJson('/api/v1/collections/public-after-moderation')->assertOk()
            ->assertJsonCount(1, 'data.artworks')
            ->assertJsonPath('data.artworks.0.id', $approved->id);
    }

    public function test_only_admin_can_manage_editorial_content(): void
    {
        $artist = User::create(['name' => 'Artist', 'email' => 'role-artist@example.com', 'password' => 'strong-password-123', 'role' => User::ROLE_ARTIST]);
        $this->getJson('/api/v1/admin/editorial/collections')->assertUnauthorized();
        $this->actingAs($artist)->getJson('/api/v1/admin/editorial/collections')->assertForbidden();
        $this->actingAs($artist)->putJson('/api/v1/admin/editorial/featured-artists', ['selections' => []])->assertForbidden();
    }

    public function test_featured_artists_only_include_public_profiles_and_active_published_windows(): void
    {
        $public = $this->artist();
        $private = $this->artist('hidden@example.com', false);
        FeaturedArtistSelection::create(['artist_profile_id' => $public->id, 'position' => 0, 'is_published' => true, 'starts_at' => now()->subDay(), 'ends_at' => now()->addDay()]);
        FeaturedArtistSelection::create(['artist_profile_id' => $private->id, 'position' => 1, 'is_published' => true]);
        FeaturedArtistSelection::create(['artist_profile_id' => $public->id, 'position' => 2, 'is_published' => false]);
        $this->getJson('/api/v1/featured-artists')->assertOk()->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.artist.slug', $public->slug);
    }

    public function test_admin_editorial_options_only_include_public_artists_and_approved_public_artworks(): void
    {
        $admin = $this->admin();
        $publicArtist = $this->artist();
        $privateArtist = $this->artist('options-private@example.com', false);
        $approved = $this->artwork($publicArtist, 'options-approved');
        $this->artwork($publicArtist, 'options-pending', Artwork::STATUS_PENDING_REVIEW);
        $this->artwork($privateArtist, 'options-private-work');

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/editorial/options')
            ->assertOk()
            ->assertJsonCount(1, 'data.artworks')
            ->assertJsonPath('data.artworks.0.id', $approved->id)
            ->assertJsonCount(1, 'data.artists')
            ->assertJsonPath('data.artists.0.id', $publicArtist->id);
    }

    public function test_admin_can_update_collection_items_and_reorder_collections_atomically(): void
    {
        $admin = $this->admin();
        $artist = $this->artist();
        $firstArtwork = $this->artwork($artist, 'reorder-first');
        $secondArtwork = $this->artwork($artist, 'reorder-second');
        $pendingArtwork = $this->artwork($artist, 'reorder-pending', Artwork::STATUS_PENDING_REVIEW);

        $first = $this->actingAs($admin)->postJson('/api/v1/admin/editorial/collections', [
            'title' => 'First collection',
            'artwork_ids' => [$firstArtwork->id],
        ])->assertCreated();
        $second = $this->postJson('/api/v1/admin/editorial/collections', [
            'title' => 'Second collection',
            'artwork_ids' => [$secondArtwork->id],
        ])->assertCreated();

        $firstId = $first->json('data.id');
        $secondId = $second->json('data.id');

        $this->patchJson('/api/v1/admin/editorial/collections/'.$firstId, [
            'title' => 'Updated first collection',
            'intro' => 'Updated editorial introduction',
            'artwork_ids' => [$secondArtwork->id],
        ])->assertOk()
            ->assertJsonPath('data.title', 'Updated first collection');

        $this->patchJson('/api/v1/admin/editorial/collections/'.$firstId, [
            'artwork_ids' => [$pendingArtwork->id],
        ])->assertUnprocessable();

        self::assertSame(
            [$secondArtwork->id],
            CuratedCollection::query()->findOrFail($firstId)->artworks()->pluck('artworks.id')->all(),
        );

        $this->putJson('/api/v1/admin/editorial/collections/order', [
            'collection_ids' => [$secondId, $firstId],
        ])->assertOk();

        $this->getJson('/api/v1/admin/editorial/collections')
            ->assertOk()
            ->assertJsonPath('data.0.id', $secondId)
            ->assertJsonPath('data.1.id', $firstId);

        $this->assertDatabaseHas('editorial_audits', [
            'action' => 'collection.reordered',
            'subject_id' => $secondId,
        ]);
    }

    public function test_admin_can_save_featured_artists_and_private_profiles_are_rejected(): void
    {
        $admin = $this->admin();
        $publicArtist = $this->artist();
        $privateArtist = $this->artist('featured-private@example.com', false);

        $this->actingAs($admin)
            ->putJson('/api/v1/admin/editorial/featured-artists', [
                'selections' => [[
                    'artist_profile_id' => $publicArtist->id,
                    'editorial_intro' => 'A selected public artist',
                    'starts_at' => now()->subDay()->toISOString(),
                    'ends_at' => now()->addDay()->toISOString(),
                ]],
            ])
            ->assertOk();

        $this->getJson('/api/v1/admin/editorial/featured-artists')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.artist.slug', $publicArtist->slug)
            ->assertJsonPath('data.0.editorial_intro', 'A selected public artist');

        $this->putJson('/api/v1/admin/editorial/featured-artists', [
            'selections' => [['artist_profile_id' => $privateArtist->id]],
        ])->assertUnprocessable();

        $this->assertDatabaseCount('featured_artist_selections', 1);
        $this->assertDatabaseHas('editorial_audits', [
            'action' => 'featured_artist.saved',
            'subject_id' => FeaturedArtistSelection::query()->value('id'),
        ]);
    }
}
