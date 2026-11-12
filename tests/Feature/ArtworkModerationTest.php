<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Artwork;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ArtworkModerationTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_admins_can_access_the_moderation_queue(): void
    {
        $this->getJson('/api/v1/admin/artworks')->assertUnauthorized();

        $artist = $this->makeUser('artist@example.com');
        $this->actingAs($artist)->getJson('/api/v1/admin/artworks')->assertForbidden();
    }

    public function test_admin_can_filter_the_queue_and_approve_an_artwork(): void
    {
        [, $pending] = $this->makeArtwork('pending-work');
        [, $approved] = $this->makeArtwork('approved-work', Artwork::STATUS_APPROVED);
        $admin = $this->makeUser('admin@example.com', User::ROLE_ADMIN);

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/artworks?status=pending_review')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.slug', $pending->slug);

        $this->actingAs($admin)
            ->patchJson('/api/v1/admin/artworks/'.$pending->id.'/moderation', ['action' => 'approve'])
            ->assertOk()
            ->assertJsonPath('data.status', Artwork::STATUS_APPROVED)
            ->assertJsonPath('data.rejection_note', null);

        $this->assertDatabaseHas('artworks', [
            'id' => $pending->id,
            'status' => Artwork::STATUS_APPROVED,
            'reviewed_by' => $admin->id,
        ]);
        $this->assertNotNull($pending->fresh()->reviewed_at);
        $this->assertSame(Artwork::STATUS_APPROVED, $approved->fresh()->status);
    }

    public function test_admin_must_include_a_note_when_rejecting_or_requesting_changes(): void
    {
        [, $rejected] = $this->makeArtwork('rejected-work');
        [, $changes] = $this->makeArtwork('changes-work');
        $admin = $this->makeUser('admin@example.com', User::ROLE_ADMIN);

        $this->actingAs($admin)
            ->patchJson('/api/v1/admin/artworks/'.$rejected->id.'/moderation', ['action' => 'reject'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('note');

        $this->actingAs($admin)
            ->patchJson('/api/v1/admin/artworks/'.$changes->id.'/moderation', ['action' => 'request_changes'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('note');

        $this->actingAs($admin)
            ->patchJson('/api/v1/admin/artworks/'.$rejected->id.'/moderation', [
                'action' => 'reject',
                'note' => 'تصویر کیفیت کافی ندارد.',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', Artwork::STATUS_REJECTED)
            ->assertJsonPath('data.rejection_note', 'تصویر کیفیت کافی ندارد.');

        $this->actingAs($admin)
            ->patchJson('/api/v1/admin/artworks/'.$changes->id.'/moderation', [
                'action' => 'request_changes',
                'note' => 'لطفاً توضیحات اثر را کامل کنید.',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', Artwork::STATUS_CHANGES_REQUESTED);
    }

    public function test_admin_cannot_moderate_an_artwork_twice_without_artist_resubmission(): void
    {
        [, $artwork] = $this->makeArtwork('already-approved', Artwork::STATUS_APPROVED);
        $admin = $this->makeUser('admin@example.com', User::ROLE_ADMIN);

        $this->actingAs($admin)
            ->patchJson('/api/v1/admin/artworks/'.$artwork->id.'/moderation', ['action' => 'reject'])
            ->assertUnprocessable();
    }

    public function test_artwork_edits_reset_review_metadata_and_return_to_pending(): void
    {
        [$profile, $artwork] = $this->makeArtwork('approved-edit', Artwork::STATUS_APPROVED);
        $artwork->update(['reviewed_by' => $this->makeUser('admin@example.com', User::ROLE_ADMIN)->id, 'reviewed_at' => now()]);

        $this->actingAs($profile->user)
            ->patch('/api/v1/artist/artworks/'.$artwork->id, [
                ...$this->validArtwork(),
                'title' => 'اثر ویرایش‌شده',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', Artwork::STATUS_PENDING_REVIEW);

        $this->assertDatabaseHas('artworks', [
            'id' => $artwork->id,
            'status' => Artwork::STATUS_PENDING_REVIEW,
            'reviewed_by' => null,
            'reviewed_at' => null,
        ]);
    }


    public function test_artist_can_read_review_feedback_and_resubmission_clears_it(): void
    {
        [$profile, $artwork] = $this->makeArtwork('feedback-resubmission', Artwork::STATUS_REJECTED);
        $admin = $this->makeUser('reviewer@example.com', User::ROLE_ADMIN);
        $artwork->update([
            'rejection_note' => 'لطفاً تصویر واضح‌تری بارگذاری کنید.',
            'reviewed_by' => $admin->id,
            'reviewed_at' => now(),
        ]);

        $this->actingAs($profile->user)
            ->getJson('/api/v1/artist/artworks')
            ->assertOk()
            ->assertJsonPath('data.0.slug', $artwork->slug)
            ->assertJsonPath('data.0.status', Artwork::STATUS_REJECTED)
            ->assertJsonPath('data.0.rejection_note', 'لطفاً تصویر واضح‌تری بارگذاری کنید.');

        [$anotherArtist] = $this->makeArtwork('another-artists-work');
        $this->actingAs($anotherArtist->user)
            ->getJson('/api/v1/artist/artworks')
            ->assertOk()
            ->assertJsonMissing(['slug' => $artwork->slug])
            ->assertJsonMissing(['rejection_note' => 'لطفاً تصویر واضح‌تری بارگذاری کنید.']);

        $this->actingAs($profile->user)
            ->patchJson('/api/v1/artist/artworks/'.$artwork->id, [
                ...$this->validArtwork(),
                'title' => 'نسخه اصلاح‌شده',
            ])
            ->assertOk()
            ->assertJsonPath('data.status', Artwork::STATUS_PENDING_REVIEW)
            ->assertJsonPath('data.rejection_note', null);

        $this->assertDatabaseHas('artworks', [
            'id' => $artwork->id,
            'status' => Artwork::STATUS_PENDING_REVIEW,
            'rejection_note' => null,
            'reviewed_by' => null,
            'reviewed_at' => null,
        ]);
    }

    public function test_public_artist_profile_only_exposes_approved_artworks(): void
    {
        [$profile, $approved] = $this->makeArtwork('profile-approved', Artwork::STATUS_APPROVED);
        [, $pending] = $this->makeArtwork('profile-pending', Artwork::STATUS_PENDING_REVIEW);
        [, $rejected] = $this->makeArtwork('profile-rejected', Artwork::STATUS_REJECTED);
        [, $changesRequested] = $this->makeArtwork('profile-changes', Artwork::STATUS_CHANGES_REQUESTED);

        $this->getJson('/api/v1/artists/'.$profile->slug)
            ->assertOk()
            ->assertJsonCount(1, 'data.artworks')
            ->assertJsonPath('data.artworks.0.slug', $approved->slug)
            ->assertJsonMissing(['slug' => $pending->slug])
            ->assertJsonMissing(['slug' => $rejected->slug])
            ->assertJsonMissing(['slug' => $changesRequested->slug]);

        $this->getJson('/api/v1/artworks/'.$pending->slug)->assertForbidden();
        $this->getJson('/api/v1/artworks/'.$rejected->slug)->assertForbidden();
        $this->getJson('/api/v1/artworks/'.$changesRequested->slug)->assertForbidden();
    }

    private function makeArtwork(string $slug, string $status = Artwork::STATUS_PENDING_REVIEW): array
    {
        $artist = $this->makeUser('artist-'.$slug.'@example.com');
        $profile = $artist->artistProfile()->create([
            'slug' => 'profile-'.$slug,
            'display_name' => 'هنرمند نمونه',
            'is_public' => true,
        ]);
        $artwork = $profile->artworks()->create([
            ...$this->validArtwork(),
            'slug' => $slug,
            'image_path' => 'artworks/'.$slug.'.jpg',
            'status' => $status,
        ]);

        return [$profile, $artwork];
    }

    private function validArtwork(): array
    {
        return [
            'category_id' => Category::query()->firstOrFail()->id,
            'title' => 'اثر آزمایشی',
            'description' => 'توضیحات',
            'availability' => 'available',
        ];
    }

    private function makeUser(string $email, string $role = User::ROLE_ARTIST): User
    {
        return User::create([
            'name' => 'کاربر آزمایشی',
            'email' => $email,
            'password' => 'strong-password-123',
            'role' => $role,
        ]);
    }
}
