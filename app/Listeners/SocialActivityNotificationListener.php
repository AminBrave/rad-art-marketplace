<?php

declare(strict_types=1);

namespace App\Listeners;

use App\Models\ArtistProfile;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\DB;
use App\Models\User;
use App\Notifications\SocialActivityNotification;
use Illuminate\Support\Str;

class SocialActivityNotificationListener
{
    public function artistFollowed(ArtistProfile $artistProfile, User $actor, int $followId): void
    {
        $recipient = $artistProfile->user()->first();
        if (! $recipient || $recipient->id === $actor->id) {
            return;
        }

        $this->notifyOnce($recipient, new SocialActivityNotification(
            'artist_followed',
            'in_app_follows',
            [
                'actor_name' => $this->publicActorName($actor),
                'actor_name_en' => $this->publicActorNameEnglish($actor),
                'artist_slug' => $artistProfile->slug,
                'artist_name' => $artistProfile->display_name,
                'artist_name_en' => $artistProfile->display_name_en,
                'target_url' => '/artists/'.$artistProfile->slug,
            ],
            'follow:'.$followId.':'.$recipient->id,
        ));
    }

    public function artworkLiked(Model $artwork, User $actor, int $likeId): void
    {
        $artistProfile = $artwork->artistProfile()->with('user')->first();
        $recipient = $artistProfile?->user;
        if (! $recipient || $recipient->id === $actor->id) {
            return;
        }
        $this->notifyOnce($recipient, new SocialActivityNotification(
            'artwork_liked',
            'in_app_artwork_likes',
            [
                'actor_name' => $this->publicActorName($actor),
                'artwork_slug' => $artwork->slug,
                'artwork_title' => $artwork->title,
                'artwork_title_en' => $artwork->title_en,
                'artist_slug' => $artistProfile?->slug,
                'artist_name' => $artistProfile?->display_name,
                'artist_name_en' => $artistProfile?->display_name_en,
                'target_url' => '/artworks/'.$artwork->slug,
            ],
            'like:'.$likeId.':'.$recipient->id,
        ));
    }

    public function artworkCommented(Model $artwork, Model $comment, User $actor): void
    {
        $artistProfile = $artwork->artistProfile()->with('user')->first();
        $recipient = $artistProfile?->user;
        if (! $recipient || $recipient->id === $actor->id) {
            return;
        }
        $this->notifyOnce($recipient, new SocialActivityNotification(
            'artwork_commented',
            'in_app_artwork_comments',
            [
                'actor_name' => $this->publicActorName($actor),
                'artwork_slug' => $artwork->slug,
                'artwork_title' => $artwork->title,
                'artist_slug' => $artistProfile?->slug,
                'artist_name' => $artistProfile?->display_name,
                'comment_id' => $comment->id,
                'comment_preview' => Str::limit($comment->body, 120),
                'target_url' => '/artworks/'.$artwork->slug.'#comment-'.$comment->id,
            ],
            'comment:'.$comment->id.':'.$recipient->id,
        ));
    }

    public function artworkCommentReplied(Model $artwork, Model $comment, User $actor): void
    {
        $parent = $comment->parent()->with('user')->first();
        $artist = $artwork->artistProfile()->with('user')->first();
        $recipients = collect([$parent?->user, $artist?->user])
            ->filter()
            ->unique('id')
            ->reject(fn (User $recipient): bool => $recipient->id === $actor->id);

        foreach ($recipients as $recipient) {
            $this->notifyOnce($recipient, new SocialActivityNotification(
                'artwork_comment_replied',
                'in_app_comment_replies',
                [
                    'actor_name' => $this->publicActorName($actor),
                    'artwork_slug' => $artwork->slug,
                    'artwork_title' => $artwork->title,
                    'artist_slug' => $artist?->slug,
                    'artist_name' => $artist?->display_name,
                    'artist_name_en' => $artist?->display_name_en,
                    'comment_id' => $comment->id,
                    'parent_comment_id' => $parent?->id,
                    'comment_preview' => Str::limit($comment->body, 120),
                    'target_url' => '/artworks/'.$artwork->slug.'#comment-'.($parent?->id ?? $comment->id),
                ],
                'reply:'.$comment->id.':'.$recipient->id,
            ));
        }
    }

    private function notifyOnce(User $recipient, SocialActivityNotification $notification): void
    {
        if (! in_array('database', $notification->via($recipient), true)) {
            return;
        }

        DB::table('notifications')->insertOrIgnore([
            'id' => $notification->id,
            'type' => $notification::class,
            'notifiable_type' => $recipient->getMorphClass(),
            'notifiable_id' => $recipient->getKey(),
            'data' => json_encode($notification->toDatabase($recipient), JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE),
            'read_at' => null,
            'created_at' => now(),
            'updated_at' => now(),
        ]);
    }

    private function publicActorNameEnglish(User $actor): string
    {
        if ($actor->isArtist() && $actor->artistProfile?->is_public) {
            return (string) ($actor->artistProfile->display_name_en ?: $actor->artistProfile->display_name);
        }

        return $actor->isBuyer() ? 'Buyer' : 'Artist';
    }

    private function publicActorName(User $actor): string
    {
        if ($actor->isArtist() && $actor->artistProfile?->is_public) {
            return (string) $actor->artistProfile->display_name;
        }

        return $actor->isBuyer() ? 'خریدار' : 'هنرمند';
    }
}
