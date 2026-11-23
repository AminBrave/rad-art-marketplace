<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\Artwork;
use App\Models\ArtworkComment;
use App\Models\Category;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

final class ArtworkInteractionTest extends TestCase
{
    use RefreshDatabase;

    public function test_guest_can_read_public_comments_and_counts_but_cannot_mutate_interactions(): void
    {
        [$artist, $profile, $artwork] = $this->artworkFixture();
        $buyer = $this->user('social-buyer@example.test', User::ROLE_BUYER);
        $comment = ArtworkComment::query()->create([
            'artwork_id' => $artwork->id,
            'user_id' => $buyer->id,
            'body' => 'دیدگاه عمومی',
        ]);

        $this->getJson('/api/v1/artworks/'.$artwork->slug)
            ->assertOk()
            ->assertJsonPath('data.likes_count', 0)
            ->assertJsonPath('data.comments_count', 1)
            ->assertJsonPath('data.liked_by_me', false);

        $this->getJson('/api/v1/artworks/'.$artwork->slug.'/comments')
            ->assertOk()
            ->assertJsonPath('data.0.id', $comment->id)
            ->assertJsonPath('data.0.body', 'دیدگاه عمومی')
            ->assertJsonPath('data.0.user.name', 'خریدار')
            ->assertJsonPath('data.0.is_mine', false)
            ->assertJsonMissingPath('data.0.user.id');

        $this->postJson('/api/v1/artworks/'.$artwork->slug.'/likes')->assertUnauthorized();
        $this->postJson('/api/v1/artworks/'.$artwork->slug.'/comments', ['body' => 'مهمان'])->assertUnauthorized();
    }

    public function test_buyer_can_like_and_unlike_once_and_artwork_payload_tracks_the_state(): void
    {
        [, , $artwork] = $this->artworkFixture();
        $buyer = $this->user('social-like-buyer@example.test', User::ROLE_BUYER);

        $this->actingAs($buyer)
            ->postJson('/api/v1/artworks/'.$artwork->slug.'/likes')
            ->assertOk()
            ->assertJsonPath('data.liked', true)
            ->assertJsonPath('data.likes_count', 1);

        $this->postJson('/api/v1/artworks/'.$artwork->slug.'/likes')
            ->assertOk()
            ->assertJsonPath('data.likes_count', 1);

        $this->getJson('/api/v1/artworks/'.$artwork->slug)
            ->assertOk()
            ->assertJsonPath('data.likes_count', 1)
            ->assertJsonPath('data.liked_by_me', true);

        $this->deleteJson('/api/v1/artworks/'.$artwork->slug.'/likes')
            ->assertOk()
            ->assertJsonPath('data.liked', false)
            ->assertJsonPath('data.likes_count', 0);

        $this->deleteJson('/api/v1/artworks/'.$artwork->slug.'/likes')
            ->assertOk()
            ->assertJsonPath('data.likes_count', 0);

        $this->assertDatabaseCount('artwork_likes', 0);
    }

    public function test_buyer_and_artist_can_create_comments_and_one_level_replies(): void
    {
        [$artist, , $artwork] = $this->artworkFixture();
        $buyer = $this->user('social-comment-buyer@example.test', User::ROLE_BUYER);

        $root = $this->actingAs($buyer)
            ->postJson('/api/v1/artworks/'.$artwork->slug.'/comments', ['body' => 'دیدگاه اصلی'])
            ->assertCreated()
            ->assertJsonPath('data.body', 'دیدگاه اصلی')
            ->json('data.id');

        $reply = $this->actingAs($artist)
            ->postJson('/api/v1/artworks/'.$artwork->slug.'/comments', [
                'body' => 'پاسخ هنرمند',
                'parent_id' => $root,
            ])
            ->assertCreated()
            ->assertJsonPath('data.parent_id', $root)
            ->json('data.id');

        $this->getJson('/api/v1/artworks/'.$artwork->slug.'/comments')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.replies.0.id', $reply)
            ->assertJsonPath('data.0.replies.0.body', 'پاسخ هنرمند');

        $this->getJson('/api/v1/artworks/'.$artwork->slug)
            ->assertOk()
            ->assertJsonPath('data.comments_count', 2);
    }

    public function test_reply_must_target_a_root_comment_on_the_same_artwork(): void
    {
        [$artist, $profile, $artwork] = $this->artworkFixture();
        $otherArtwork = $profile->artworks()->create([
            'category_id' => $artwork->category_id,
            'slug' => 'social-other-work',
            'title' => 'اثر دیگر',
            'image_path' => 'artworks/social-other-work.jpg',
            'status' => Artwork::STATUS_APPROVED,
        ]);
        $buyer = $this->user('social-reply-buyer@example.test', User::ROLE_BUYER);
        $root = ArtworkComment::query()->create([
            'artwork_id' => $artwork->id,
            'user_id' => $buyer->id,
            'body' => 'دیدگاه اول',
        ]);
        $reply = ArtworkComment::query()->create([
            'artwork_id' => $artwork->id,
            'user_id' => $artist->id,
            'parent_id' => $root->id,
            'body' => 'پاسخ اول',
        ]);
        $foreignReply = ArtworkComment::query()->create([
            'artwork_id' => $otherArtwork->id,
            'user_id' => $artist->id,
            'parent_id' => $root->id,
            'body' => 'پاسخ متعلق به اثر دیگر',
        ]);

        $this->actingAs($buyer)
            ->postJson('/api/v1/artworks/'.$artwork->slug.'/comments', [
                'body' => 'پاسخ به پاسخ',
                'parent_id' => $reply->id,
            ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['parent_id']);

        $this->postJson('/api/v1/artworks/'.$artwork->slug.'/comments', [
            'body' => 'شناسه والد نامعتبر',
            'parent_id' => 0,
        ])->assertUnprocessable();

        $this->postJson('/api/v1/artworks/'.$otherArtwork->slug.'/comments', [
            'body' => 'پاسخ به اثر دیگر',
            'parent_id' => $root->id,
        ])->assertUnprocessable()->assertJsonValidationErrors(['parent_id']);

        $this->getJson('/api/v1/artworks/'.$artwork->slug.'/comments')
            ->assertOk()
            ->assertJsonCount(1, 'data.0.replies')
            ->assertJsonPath('data.0.replies.0.id', $reply->id);
    }

    public function test_only_comment_author_can_delete_and_deleted_parent_keeps_replies_visible(): void
    {
        [$artist, , $artwork] = $this->artworkFixture();
        $buyer = $this->user('social-delete-buyer@example.test', User::ROLE_BUYER);
        $outsider = $this->user('social-delete-outsider@example.test', User::ROLE_BUYER);
        $root = ArtworkComment::query()->create([
            'artwork_id' => $artwork->id,
            'user_id' => $buyer->id,
            'body' => 'دیدگاه برای حذف',
        ]);
        $reply = ArtworkComment::query()->create([
            'artwork_id' => $artwork->id,
            'user_id' => $artist->id,
            'parent_id' => $root->id,
            'body' => 'پاسخ باقی می‌ماند',
        ]);

        $this->actingAs($outsider)
            ->deleteJson('/api/v1/artworks/'.$artwork->slug.'/comments/'.$root->id)
            ->assertForbidden();

        $this->actingAs($buyer)
            ->deleteJson('/api/v1/artworks/'.$artwork->slug.'/comments/'.$root->id)
            ->assertOk();

        $this->assertSoftDeleted('artwork_comments', ['id' => $root->id]);
        $this->getJson('/api/v1/artworks/'.$artwork->slug.'/comments')
            ->assertOk()
            ->assertJsonPath('data.0.is_deleted', true)
            ->assertJsonPath('data.0.body', null)
            ->assertJsonPath('data.0.replies.0.id', $reply->id);
    }

    public function test_comment_deep_links_return_the_page_containing_the_root_thread(): void
    {
        [$artist, , $artwork] = $this->artworkFixture();
        $buyer = $this->user('social-deep-link-buyer@example.test', User::ROLE_BUYER);
        $target = null;

        for ($index = 1; $index <= 21; $index++) {
            $target = ArtworkComment::query()->create([
                'artwork_id' => $artwork->id,
                'user_id' => $buyer->id,
                'body' => 'دیدگاه '.$index,
            ]);
        }

        $reply = ArtworkComment::query()->create([
            'artwork_id' => $artwork->id,
            'user_id' => $artist->id,
            'parent_id' => $target->id,
            'body' => 'پاسخ عمیق',
        ]);

        $this->getJson('/api/v1/artworks/'.$artwork->slug.'/comments?comment_id='.$reply->id)
            ->assertOk()
            ->assertJsonPath('current_page', 2)
            ->assertJsonPath('data.0.id', $target->id)
            ->assertJsonPath('data.0.replies.0.id', $reply->id);
    }

    public function test_admin_can_review_report_remove_comment_and_record_audit(): void
    {
        [, , $artwork] = $this->artworkFixture();
        $buyer = $this->user('social-report-buyer@example.test', User::ROLE_BUYER);
        $admin = $this->user('social-report-admin@example.test', User::ROLE_ADMIN);
        $commentId = $this->actingAs($buyer)
            ->postJson('/api/v1/artworks/'.$artwork->slug.'/comments', ['body' => 'دیدگاه نامناسب'])
            ->assertCreated()
            ->json('data.id');

        $reporter = $this->user('social-report-reporter@example.test', User::ROLE_BUYER);
        $reportId = $this->actingAs($reporter)
            ->postJson('/api/v1/artworks/'.$artwork->slug.'/comments/'.$commentId.'/reports', [
                'reason' => 'spam',
                'details' => 'گزارش آزمایشی',
            ])->assertCreated()->json('data.id');

        $this->actingAs($admin)
            ->getJson('/api/v1/admin/artwork-comment-reports')
            ->assertOk()
            ->assertJsonPath('data.0.id', $reportId)
            ->assertJsonPath('data.0.comment.body', 'دیدگاه نامناسب');

        $this->patchJson('/api/v1/admin/artwork-comment-reports/'.$reportId, [
            'action' => 'remove_comment',
            'note' => 'نقض سیاست محتوا',
        ])->assertOk();

        $this->assertSoftDeleted('artwork_comments', ['id' => $commentId]);
        $this->assertDatabaseHas('artwork_comment_reports', [
            'id' => $reportId,
            'status' => 'reviewed',
            'reviewed_by_user_id' => $admin->id,
        ]);
        $this->assertDatabaseHas('artwork_comment_moderation_audits', [
            'report_id' => $reportId,
            'admin_user_id' => $admin->id,
            'action' => 'remove_comment',
        ]);
    }

    public function test_comment_validation_rejects_blank_oversized_and_ineligible_content(): void
    {
        [, , $artwork] = $this->artworkFixture();
        $buyer = $this->user('social-validation-buyer@example.test', User::ROLE_BUYER);
        $admin = $this->user('social-validation-admin@example.test', User::ROLE_ADMIN);

        $this->actingAs($buyer)
            ->postJson('/api/v1/artworks/'.$artwork->slug.'/comments', ['body' => '   '])
            ->assertUnprocessable()
            ->assertJsonPath('errors.body.0', 'متن دیدگاه نمی‌تواند خالی باشد.');

        $this->postJson('/api/v1/artworks/'.$artwork->slug.'/comments', ['body' => str_repeat('x', 2001)])
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['body']);

        $this->actingAs($admin)
            ->postJson('/api/v1/artworks/'.$artwork->slug.'/comments', ['body' => 'نظر مدیر'])
            ->assertForbidden();
    }

    public function test_social_endpoints_hide_pending_and_private_artworks(): void
    {
        [$artist, $profile, $artwork] = $this->artworkFixture();
        $pending = $profile->artworks()->create([
            'category_id' => $artwork->category_id,
            'slug' => 'social-pending-work',
            'title' => 'اثر در انتظار',
            'image_path' => 'artworks/social-pending-work.jpg',
            'status' => Artwork::STATUS_PENDING_REVIEW,
        ]);
        $rejected = $profile->artworks()->create([
            'category_id' => $artwork->category_id,
            'slug' => 'social-rejected-work',
            'title' => 'اثر ردشده',
            'image_path' => 'artworks/social-rejected-work.jpg',
            'status' => Artwork::STATUS_REJECTED,
        ]);
        $profile->update(['is_public' => false]);

        $this->actingAs($artist)
            ->getJson('/api/v1/artworks/'.$artwork->slug)
            ->assertOk()
            ->assertJsonMissingPath('data.likes_count')
            ->assertJsonMissingPath('data.comments_count')
            ->assertJsonMissingPath('data.liked_by_me');

        $this->getJson('/api/v1/artworks/'.$artwork->slug.'/comments')->assertNotFound();
        $this->getJson('/api/v1/artworks/'.$pending->slug.'/comments')->assertNotFound();
        $this->getJson('/api/v1/artworks/'.$rejected->slug.'/comments')->assertNotFound();

        $buyer = $this->user('social-private-buyer@example.test', User::ROLE_BUYER);
        $this->actingAs($buyer)
            ->postJson('/api/v1/artworks/'.$artwork->slug.'/likes')
            ->assertNotFound();
    }

    /**
     * @return array{0: User, 1: \App\Models\ArtistProfile, 2: Artwork}
     */
    private function artworkFixture(): array
    {
        $artist = $this->user('social-artist@example.test', User::ROLE_ARTIST);
        $profile = $artist->artistProfile()->create([
            'slug' => 'social-artist-profile',
            'display_name' => 'هنرمند آزمایشی',
            'is_public' => true,
        ]);
        $category = Category::query()->firstOrCreate(
            ['slug' => 'social-test-category'],
            ['name' => 'دسته آزمایشی', 'is_active' => true],
        );
        $artwork = $profile->artworks()->create([
            'category_id' => $category->id,
            'slug' => 'social-test-artwork',
            'title' => 'اثر آزمایشی',
            'description' => 'توضیحات اثر',
            'image_path' => 'artworks/social-test-artwork.jpg',
            'status' => Artwork::STATUS_APPROVED,
        ]);

        return [$artist, $profile, $artwork];
    }

    private function user(string $email, string $role): User
    {
        return User::query()->create([
            'name' => 'کاربر آزمایشی',
            'email' => $email,
            'password' => Hash::make('strong-password-123'),
            'role' => $role,
        ]);
    }
}
