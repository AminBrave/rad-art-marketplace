<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ArtistCollection;
use App\Models\ArtistContent;
use App\Models\ArtistProfile;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArtistLibraryApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_artist_library_is_owner_scoped_and_omits_provider_private_fields(): void
    {
        [$artist, $profile] = $this->artistWithProfile('library-owner@example.com');
        [, $otherProfile] = $this->artistWithProfile('library-other@example.com');

        $ownContent = $this->content($profile, [
            'source_caption' => 'Provider-only caption',
            'source_permalink' => 'https://provider.example/private',
            'source_metadata' => ['private_marker' => 'must-not-leak'],
            'external_id' => 'provider-123',
            'media_path' => 'private/storage/path.jpg',
        ]);
        $otherContent = $this->content($otherProfile, ['title' => 'محتوای هنرمند دیگر']);

        $response = $this->actingAs($artist)->getJson('/api/v1/artist/content');

        $response->assertOk()
            ->assertJsonPath('data.0.id', $ownContent->id)
            ->assertJsonMissing(['id' => $otherContent->id])
            ->assertJsonMissing(['private_marker' => 'must-not-leak'])
            ->assertJsonMissing(['source_caption' => 'Provider-only caption'])
            ->assertJsonMissing(['source_permalink' => 'https://provider.example/private'])
            ->assertJsonMissing(['media_path' => 'private/storage/path.jpg'])
            ->assertJsonMissing(['external_id' => 'provider-123']);
    }

    public function test_artist_must_approve_content_and_have_a_public_profile_before_publication(): void
    {
        [$artist, $profile] = $this->artistWithProfile('publication-owner@example.com', false);
        $content = $this->content($profile);

        $this->actingAs($artist)
            ->postJson('/api/v1/artist/content/'.$content->id.'/publish')
            ->assertStatus(409);

        $this->postJson('/api/v1/artist/content/'.$content->id.'/approve')
            ->assertOk()
            ->assertJsonPath('data.publication_status', ArtistContent::PUBLICATION_DRAFT);

        $profile->forceFill(['is_public' => true])->save();

        $this->postJson('/api/v1/artist/content/'.$content->id.'/publish')
            ->assertOk()
            ->assertJsonPath('data.publication_status', ArtistContent::PUBLICATION_PUBLISHED);

        $this->assertDatabaseHas('artist_contents', [
            'id' => $content->id,
            'publication_status' => ArtistContent::PUBLICATION_PUBLISHED,
        ]);
    }

    public function test_artist_cannot_approve_another_artists_content(): void
    {
        [$artist] = $this->artistWithProfile('content-policy-owner@example.com');
        [, $otherProfile] = $this->artistWithProfile('content-policy-other@example.com');
        $otherContent = $this->content($otherProfile);

        $this->actingAs($artist)
            ->postJson('/api/v1/artist/content/'.$otherContent->id.'/approve')
            ->assertForbidden();

        $this->assertDatabaseHas('artist_contents', [
            'id' => $otherContent->id,
            'artist_approved_at' => null,
        ]);
    }

    public function test_imported_content_cannot_be_approved_before_source_integration_is_ready(): void
    {
        [$artist, $profile] = $this->artistWithProfile('imported-owner@example.com');
        $content = $this->content($profile, [
            'source' => 'instagram',
            'external_id' => 'external-456',
        ]);

        $this->actingAs($artist)
            ->postJson('/api/v1/artist/content/'.$content->id.'/approve')
            ->assertStatus(409);

        $this->assertDatabaseHas('artist_contents', [
            'id' => $content->id,
            'artist_approved_at' => null,
            'publication_status' => ArtistContent::PUBLICATION_DRAFT,
        ]);
    }

    public function test_artist_collections_default_to_private_and_reject_other_artists_content(): void
    {
        [$artist, $profile] = $this->artistWithProfile('collection-owner@example.com');
        [, $otherProfile] = $this->artistWithProfile('collection-other@example.com');
        $ownContent = $this->content($profile);
        $otherContent = $this->content($otherProfile);

        $response = $this->actingAs($artist)->postJson('/api/v1/artist/collections', [
            'title' => 'مجموعه من',
            'description' => 'توضیح مجموعه',
        ]);

        $response->assertCreated()
            ->assertJsonPath('data.visibility', ArtistCollection::VISIBILITY_PRIVATE);

        $collectionId = $response->json('data.id');
        $this->putJson('/api/v1/artist/collections/'.$collectionId.'/items', [
            'content_ids' => [$ownContent->id, $otherContent->id],
        ])->assertUnprocessable();

        $this->assertDatabaseCount('artist_collection_items', 0);

        $this->putJson('/api/v1/artist/collections/'.$collectionId.'/items', [
            'content_ids' => [$ownContent->id],
        ])->assertOk()
            ->assertJsonPath('data.items.0.id', $ownContent->id);

        $this->assertDatabaseHas('artist_collection_items', [
            'artist_collection_id' => $collectionId,
            'artist_content_id' => $ownContent->id,
            'artist_profile_id' => $profile->id,
            'position' => 0,
        ]);

        $this->getJson('/api/v1/artist/collections?per_page=100')
            ->assertOk()
            ->assertJsonPath('data.0.items.0.id', $ownContent->id);
    }

    public function test_collection_publication_requires_every_item_to_be_approved_and_published(): void
    {
        [$artist, $profile] = $this->artistWithProfile('collection-publication@example.com');
        $content = $this->content($profile);

        $collectionResponse = $this->actingAs($artist)->postJson('/api/v1/artist/collections', [
            'title' => 'مجموعه قابل انتشار',
        ])->assertCreated();

        $collectionId = $collectionResponse->json('data.id');
        $this->putJson('/api/v1/artist/collections/'.$collectionId.'/items', [
            'content_ids' => [$content->id],
        ])->assertOk();

        $this->postJson('/api/v1/artist/collections/'.$collectionId.'/publish')
            ->assertStatus(409);

        $content->forceFill([
            'artist_approved_at' => now(),
            'publication_status' => ArtistContent::PUBLICATION_PUBLISHED,
        ])->save();

        $this->postJson('/api/v1/artist/collections/'.$collectionId.'/publish')
            ->assertOk()
            ->assertJsonPath('data.visibility', ArtistCollection::VISIBILITY_PUBLIC);

        $this->assertDatabaseHas('artist_collections', [
            'id' => $collectionId,
            'visibility' => ArtistCollection::VISIBILITY_PUBLIC,
        ]);

        $this->postJson('/api/v1/artist/content/'.$content->id.'/unpublish')
            ->assertOk()
            ->assertJsonPath('data.publication_status', ArtistContent::PUBLICATION_DRAFT);

        $this->assertDatabaseHas('artist_collections', [
            'id' => $collectionId,
            'visibility' => ArtistCollection::VISIBILITY_PRIVATE,
            'published_at' => null,
        ]);
    }

    public function test_artist_cannot_update_another_artists_collection(): void
    {
        [$artist] = $this->artistWithProfile('collection-policy-owner@example.com');
        [, $otherProfile] = $this->artistWithProfile('collection-policy-other@example.com');
        $collection = $otherProfile->collections()->create([
            'title' => 'مجموعه خصوصی',
            'slug' => 'private-collection-other',
            'visibility' => ArtistCollection::VISIBILITY_PRIVATE,
        ]);

        $this->actingAs($artist)
            ->patchJson('/api/v1/artist/collections/'.$collection->id, [
                'title' => 'تلاش برای تغییر',
            ])
            ->assertForbidden();

        $this->assertDatabaseHas('artist_collections', [
            'id' => $collection->id,
            'title' => 'مجموعه خصوصی',
        ]);
    }

    public function test_only_artist_role_can_access_the_artist_library_routes(): void
    {
        [$buyer] = $this->artistWithProfile('role-check@example.com');
        $buyer->forceFill(['role' => User::ROLE_BUYER])->save();

        $this->actingAs($buyer)
            ->getJson('/api/v1/artist/content')
            ->assertForbidden();
    }

    private function artistWithProfile(string $email, bool $isPublic = true): array
    {
        $artist = User::query()->create([
            'name' => 'Artist',
            'email' => $email,
            'password' => 'strong-password-123',
            'role' => User::ROLE_ARTIST,
        ]);

        $profile = $artist->artistProfile()->create([
            'slug' => 'artist-'.str_replace(['@', '.'], '-', $email),
            'display_name' => 'هنرمند آزمایشی',
            'is_public' => $isPublic,
        ]);

        return [$artist, $profile];
    }

    private function content(ArtistProfile $profile, array $overrides = []): ArtistContent
    {
        return $profile->contents()->create(array_replace([
            'source' => ArtistContent::SOURCE_NATIVE,
            'content_type' => 'post',
            'title' => 'محتوای آزمایشی',
            'description' => 'توضیحات محتوای آزمایشی',
            'publication_status' => ArtistContent::PUBLICATION_DRAFT,
        ], $overrides));
    }
}
