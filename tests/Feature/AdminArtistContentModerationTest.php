<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ArtistContent;
use App\Models\Artwork;
use App\Models\Category;
use App\Models\EditorialAudit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AdminArtistContentModerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_admins_can_view_the_unified_content_moderation_queue(): void
    {
        $this->getJson('/api/v1/admin/contents')->assertUnauthorized();

        $artist = $this->makeUser('content-queue-artist@example.com');
        $this->actingAs($artist)->getJson('/api/v1/admin/contents')->assertForbidden();
    }

    public function test_admin_can_filter_content_and_unavailable_records_are_explicit(): void
    {
        [$profile, $content] = $this->makeContent('queue-pending');
        $this->attachArtwork($profile, $content, 'queue-pending');

        [, $unavailable] = $this->makeContent('queue-unavailable', [
            'source' => 'instagram',
            'external_id' => '17900000000000001',
        ]);

        $admin = $this->makeUser('content-queue-admin@example.com', User::ROLE_ADMIN);

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/contents?moderation_status=pending_review')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $content->id)
            ->assertJsonPath('data.0.moderation_status', Artwork::STATUS_PENDING_REVIEW)
            ->assertJsonMissingPath('data.0.source_metadata')
            ->assertJsonMissingPath('data.0.source_caption')
            ->assertJsonMissingPath('data.0.source_permalink')
            ->assertJsonMissingPath('data.0.external_id')
            ->assertJsonMissingPath('data.0.media_path');

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/contents?moderation_status=unavailable')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.id', $unavailable->id)
            ->assertJsonPath('data.0.moderation_status', 'unavailable')
            ->assertJsonPath('data.0.image_url', null);
    }

    public function test_admin_moderation_updates_artwork_gate_and_records_an_audit_event(): void
    {
        [$profile, $content] = $this->makeContent('queue-approve');
        $artwork = $this->attachArtwork($profile, $content, 'queue-approve');
        $admin = $this->makeUser('content-moderator@example.com', User::ROLE_ADMIN);

        $this->actingAs($admin)
            ->patchJson('/api/v1/admin/contents/'.$content->id.'/moderation', ['action' => 'approve'])
            ->assertOk()
            ->assertJsonPath('data.id', $content->id)
            ->assertJsonPath('data.moderation_status', Artwork::STATUS_APPROVED);

        $this->assertDatabaseHas('artworks', [
            'id' => $artwork->id,
            'status' => Artwork::STATUS_APPROVED,
            'reviewed_by' => $admin->id,
        ]);
        $this->assertDatabaseHas('editorial_audits', [
            'actor_id' => $admin->id,
            'action' => 'artist_content.moderated',
            'subject_type' => 'ArtistContent',
            'subject_id' => $content->id,
        ]);
    }

    public function test_admin_cannot_moderate_unavailable_content_or_repeat_a_decision(): void
    {
        [, $unavailable] = $this->makeContent('queue-no-artwork');
        [$profile, $content] = $this->makeContent('queue-repeat');
        $artwork = $this->attachArtwork($profile, $content, 'queue-repeat');
        $admin = $this->makeUser('content-repeat-admin@example.com', User::ROLE_ADMIN);

        $this->actingAs($admin)
            ->patchJson('/api/v1/admin/contents/'.$unavailable->id.'/moderation', ['action' => 'approve'])
            ->assertStatus(409);

        $this->actingAs($admin)
            ->patchJson('/api/v1/admin/contents/'.$content->id.'/moderation', ['action' => 'approve'])
            ->assertOk();

        $this->actingAs($admin)
            ->patchJson('/api/v1/admin/contents/'.$content->id.'/moderation', ['action' => 'reject', 'note' => 'تکرار'])
            ->assertUnprocessable();

        $this->assertSame(Artwork::STATUS_APPROVED, $artwork->fresh()->status);
        $this->assertSame(1, EditorialAudit::query()->where('subject_type', 'ArtistContent')->where('subject_id', $content->id)->count());
    }

    public function test_artist_cannot_use_admin_content_moderation_actions(): void
    {
        [$profile, $content] = $this->makeContent('queue-artist-denied');
        $this->attachArtwork($profile, $content, 'queue-artist-denied');

        $this->actingAs($profile->user)
            ->patchJson('/api/v1/admin/contents/'.$content->id.'/moderation', ['action' => 'approve'])
            ->assertForbidden();

        $this->assertSame(Artwork::STATUS_PENDING_REVIEW, $content->artwork()->firstOrFail()->status);
    }

    private function makeContent(string $slug, array $overrides = []): array
    {
        $artist = $this->makeUser('artist-'.$slug.'@example.com');
        $profile = $artist->artistProfile()->create([
            'slug' => 'profile-'.$slug,
            'display_name' => 'هنرمند آزمایشی',
            'is_public' => true,
        ]);

        $content = $profile->contents()->create(array_replace([
            'source' => ArtistContent::SOURCE_NATIVE,
            'content_type' => 'artwork',
            'title' => 'محتوای '.$slug,
            'description' => 'شرح محتوای آزمایشی',
            'publication_status' => ArtistContent::PUBLICATION_DRAFT,
            'source_caption' => 'private provider caption',
            'source_permalink' => 'https://provider.example/private',
            'source_metadata' => ['private' => 'snapshot'],
            'media_path' => 'private/media/path.jpg',
        ], $overrides));

        return [$profile, $content];
    }

    private function attachArtwork($profile, ArtistContent $content, string $slug): Artwork
    {
        $artwork = $profile->artworks()->create([
            'category_id' => Category::query()->firstOrFail()->id,
            'slug' => $slug,
            'title' => 'اثر '.$slug,
            'description' => 'شرح اثر',
            'availability' => 'available',
            'image_path' => 'artworks/'.$slug.'.jpg',
            'status' => Artwork::STATUS_PENDING_REVIEW,
        ]);
        $artwork->forceFill(['artist_content_id' => $content->id])->save();

        return $artwork;
    }

    private function makeUser(string $email, string $role = User::ROLE_ARTIST): User
    {
        return User::query()->create([
            'name' => 'کاربر آزمایشی',
            'email' => $email,
            'password' => 'strong-password-123',
            'role' => $role,
        ]);
    }
}
