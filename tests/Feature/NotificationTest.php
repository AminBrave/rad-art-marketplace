<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Models\ArtistProfile;
use App\Models\Artwork;
use App\Models\Category;
use App\Models\Conversation;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use App\Notifications\MessageReceivedNotification;
use App\Notifications\SocialActivityNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Notifications\DatabaseNotification;
use Tests\TestCase;

final class NotificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_notification_feed_is_private_and_read_actions_update_the_unread_count(): void
    {
        $buyer = $this->user('notification-buyer@example.test', User::ROLE_BUYER);
        $artist = $this->user('notification-artist@example.test', User::ROLE_ARTIST);
        $outsider = $this->user('notification-outsider@example.test', User::ROLE_BUYER);
        $conversation = Conversation::query()->create([
            'pair_key' => $buyer->id.':'.$artist->id,
            'buyer_user_id' => $buyer->id,
            'artist_user_id' => $artist->id,
            'last_message_at' => now(),
        ]);
        $notification = $this->notification($buyer, $conversation, 101, null);
        $this->notification($buyer, $conversation, 102, now()->subMinute());
        $otherNotification = $this->notification($outsider, $conversation, 103, null);

        $this->getJson('/api/v1/notifications')->assertUnauthorized();

        $this->actingAs($buyer)
            ->getJson('/api/v1/notifications')
            ->assertOk()
            ->assertJsonCount(2, 'data')
            ->assertJsonPath('unread_count', 1)
            ->assertJsonPath('data.0.sender_name', 'فرستنده آزمایشی');

        $this->patchJson('/api/v1/notifications/'.$notification->id.'/read')->assertOk();
        $this->getJson('/api/v1/notifications')->assertOk()->assertJsonPath('unread_count', 0);

        $this->patchJson('/api/v1/notifications/'.$otherNotification->id.'/read')->assertNotFound();

        $this->notification($buyer, $conversation, 104, null);
        $this->patchJson('/api/v1/notifications/read-all')
            ->assertOk()
            ->assertJsonPath('data.updated_notifications', 1);

        $this->getJson('/api/v1/notifications')->assertOk()->assertJsonPath('unread_count', 0);
    }

    public function test_message_notification_channel_selection_respects_user_preferences(): void
    {
        $artist = $this->user('notification-channel@example.test', User::ROLE_ARTIST);
        $notification = new MessageReceivedNotification(1, 1, 'فرستنده آزمایشی');

        $this->assertSame(['database'], $notification->via($artist));

        $artist->forceFill(['notification_preferences' => ['in_app_messages' => false]])->save();

        $this->assertSame([], $notification->via($artist));
    }

    public function test_message_notification_preferences_keep_email_disabled(): void
    {
        $buyer = $this->user('notification-preferences@example.test', User::ROLE_BUYER);

        $this->actingAs($buyer)
            ->getJson('/api/v1/notifications/preferences')
            ->assertOk()
            ->assertJsonPath('data.in_app_messages', true)
            ->assertJsonPath('data.email_messages', false)
            ->assertJsonPath('data.email_available', false);

        $this->patchJson('/api/v1/notifications/preferences', ['in_app_messages' => false])
            ->assertOk()
            ->assertJsonPath('data.in_app_messages', false)
            ->assertJsonPath('data.email_messages', false)
            ->assertJsonPath('data.email_available', false);

        $this->assertFalse($buyer->fresh()->messageNotificationPreferences()['in_app_messages']);
    }

    public function test_social_notifications_are_private_paginated_and_markable_read(): void
    {
        $buyer = $this->user('notification-social-buyer@example.test', User::ROLE_BUYER);
        $outsider = $this->user('notification-social-outsider@example.test', User::ROLE_BUYER);
        $notification = DatabaseNotification::query()->create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => SocialActivityNotification::class,
            'notifiable_type' => User::class,
            'notifiable_id' => $buyer->id,
            'data' => [
                'kind' => 'artist_followed',
                'actor_name' => 'خریدار',
                'artist_slug' => 'artist-sample',
                'target_url' => '/artists/artist-sample',
            ],
            'read_at' => null,
        ]);
        $other = DatabaseNotification::query()->create([
            'id' => (string) \Illuminate\Support\Str::uuid(),
            'type' => SocialActivityNotification::class,
            'notifiable_type' => User::class,
            'notifiable_id' => $outsider->id,
            'data' => ['kind' => 'artist_followed', 'target_url' => '/artists/artist-sample'],
            'read_at' => null,
        ]);

        $this->actingAs($buyer)
            ->getJson('/api/v1/notifications')
            ->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.kind', 'artist_followed')
            ->assertJsonPath('data.0.title', 'خریدار شما را دنبال کرد')
            ->assertJsonPath('data.0.target_url', '/artists/artist-sample')
            ->assertJsonPath('unread_count', 1);

        $this->patchJson('/api/v1/notifications/'.$other->id.'/read')->assertNotFound();
        $this->patchJson('/api/v1/notifications/'.$notification->id.'/read')->assertOk();

        $this->patchJson('/api/v1/notifications/preferences', [
            'in_app_follows' => false,
        ])->assertOk()
            ->assertJsonPath('data.in_app_follows', false)
            ->assertJsonPath('data.in_app_messages', true)
            ->assertJsonPath('data.in_app_artwork_likes', true);

        $this->assertSame([], (new SocialActivityNotification(
            'artist_followed',
            'in_app_follows',
            ['target_url' => '/artists/artist-sample'],
            'follow:sample:'.$buyer->id,
        ))->via($buyer->fresh()));
    }

    public function test_artist_follow_event_notifies_once_and_never_notifies_the_actor(): void
    {
        $artist = $this->user('notification-follow-artist@example.test', User::ROLE_ARTIST);
        $actor = $this->user('notification-follow-actor@example.test', User::ROLE_BUYER);
        $profile = $artist->artistProfile()->create([
            'slug' => 'notification-follow-profile',
            'display_name' => 'هنرمند اعلان',
            'is_public' => true,
        ]);

        event('artist.followed', [$profile, $actor, 123]);
        event('artist.followed', [$profile, $actor, 123]);

        $this->assertDatabaseCount('notifications', 1);
        $this->assertDatabaseHas('notifications', [
            'type' => SocialActivityNotification::class,
            'notifiable_type' => User::class,
            'notifiable_id' => $artist->id,
        ]);
        $this->assertSame(0, $actor->notifications()->count());

        event('artist.followed', [$profile, $artist, 124]);

        $this->assertDatabaseCount('notifications', 1);
    }

    public function test_artwork_like_event_notifies_the_artist_once_and_respects_preferences(): void
    {
        $artist = $this->user('notification-like-artist@example.test', User::ROLE_ARTIST);
        $actor = $this->user('notification-like-actor@example.test', User::ROLE_BUYER);
        $profile = $artist->artistProfile()->create([
            'slug' => 'notification-like-profile',
            'display_name' => 'هنرمند پسندیده',
            'is_public' => true,
        ]);
        $category = Category::query()->firstOrCreate(
            ['slug' => 'notification-like-category'],
            ['name' => 'دسته پسندیدن', 'is_active' => true],
        );
        $artwork = $profile->artworks()->create([
            'category_id' => $category->id,
            'slug' => 'notification-like-artwork',
            'title' => 'اثر پسندیده',
            'image_path' => 'artworks/notification-like-artwork.jpg',
            'status' => Artwork::STATUS_APPROVED,
        ]);

        event('artwork.liked', [$artwork, $actor, 321]);
        event('artwork.liked', [$artwork, $actor, 321]);

        $this->assertDatabaseCount('notifications', 1);
        $this->assertDatabaseHas('notifications', [
            'type' => SocialActivityNotification::class,
            'notifiable_type' => User::class,
            'notifiable_id' => $artist->id,
        ]);
        $this->assertSame(0, $actor->notifications()->count());

        event('artwork.liked', [$artwork, $artist, 322]);
        $this->assertDatabaseCount('notifications', 1);

        $artist->forceFill(['notification_preferences' => ['in_app_artwork_likes' => false]])->save();
        event('artwork.liked', [$artwork, $actor, 323]);
        $this->assertDatabaseCount('notifications', 1);
    }

    public function test_comment_and_reply_events_notify_the_artist_and_parent_author_once(): void
    {
        $artist = $this->user('notification-comment-artist@example.test', User::ROLE_ARTIST);
        $parentAuthor = $this->user('notification-parent-author@example.test', User::ROLE_BUYER);
        $actor = $this->user('notification-reply-actor@example.test', User::ROLE_BUYER);
        $profile = $artist->artistProfile()->create([
            'slug' => 'notification-comment-profile',
            'display_name' => 'هنرمند دیدگاه',
            'is_public' => true,
        ]);
        $category = Category::query()->firstOrCreate(
            ['slug' => 'notification-comment-category'],
            ['name' => 'دسته دیدگاه', 'is_active' => true],
        );
        $artwork = $profile->artworks()->create([
            'category_id' => $category->id,
            'slug' => 'notification-comment-artwork',
            'title' => 'اثر دیدگاه',
            'image_path' => 'artworks/notification-comment-artwork.jpg',
            'status' => Artwork::STATUS_APPROVED,
        ]);
        $comment = new SocialNotificationCommentFixture([
            'id' => 501,
            'body' => 'دیدگاه تازه',
        ]);
        $reply = new SocialNotificationCommentFixture([
            'id' => 502,
            'body' => 'پاسخ تازه',
        ]);
        $reply->setParentFixture((object) ['id' => 501, 'user' => $parentAuthor]);

        event('artwork.commented', [$artwork, $comment, $actor]);
        event('artwork.comment.replied', [$artwork, $reply, $actor]);
        event('artwork.comment.replied', [$artwork, $reply, $actor]);

        $this->assertDatabaseCount('notifications', 3);
        $this->assertDatabaseHas('notifications', [
            'type' => SocialActivityNotification::class,
            'notifiable_type' => User::class,
            'notifiable_id' => $artist->id,
        ]);
        $this->assertDatabaseHas('notifications', [
            'type' => SocialActivityNotification::class,
            'notifiable_type' => User::class,
            'notifiable_id' => $parentAuthor->id,
        ]);
        $this->assertSame(0, $actor->notifications()->count());
    }

    private function notification(User $recipient, Conversation $conversation, int $messageId, mixed $readAt): DatabaseNotification
    {
        return DatabaseNotification::query()->create([
            'id' => sprintf('00000000-0000-4000-8000-%012d', $messageId),
            'type' => MessageReceivedNotification::class,
            'notifiable_type' => User::class,
            'notifiable_id' => $recipient->id,
            'data' => [
                'kind' => 'message_received',
                'conversation_id' => $conversation->id,
                'message_id' => $messageId,
                'sender_name' => 'فرستنده آزمایشی',
            ],
            'read_at' => $readAt,
        ]);
    }

    private function user(string $email, string $role): User
    {
        return User::query()->create([
            'name' => 'کاربر اعلان',
            'email' => $email,
            'password' => 'strong-password-123',
            'role' => $role,
        ]);
    }
}

final class SocialNotificationCommentFixture extends Model
{
    protected $guarded = [];

    private ?object $parentFixture = null;

    public function setParentFixture(object $parent): void
    {
        $this->parentFixture = $parent;
    }

    public function parent(): object
    {
        return new class($this->parentFixture) {
            public function __construct(private readonly ?object $parent)
            {
            }

            public function with(string $relations): self
            {
                return $this;
            }

            public function first(): ?object
            {
                return $this->parent;
            }
        };
    }
}
