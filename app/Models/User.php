<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    use HasFactory, Notifiable;

    public const ROLE_ARTIST = 'artist';

    public const ROLE_ADMIN = 'admin';

    public const ROLE_BUYER = 'buyer';

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'notification_preferences' => 'array',
        ];
    }

    /**
     * @return array<string, bool>
     */
    public function notificationPreferences(): array
    {
        return array_replace([
            'in_app_messages' => true,
            'email_messages' => false,
            'in_app_follows' => true,
            'in_app_artwork_likes' => true,
            'in_app_artwork_comments' => true,
            'in_app_comment_replies' => true,
        ], $this->notification_preferences ?? [], [
            'email_messages' => false,
        ]);
    }

    /**
     * @return array{in_app_messages: bool, email_messages: bool}
     */
    public function messageNotificationPreferences(): array
    {
        $preferences = $this->notificationPreferences();

        return [
            'in_app_messages' => $preferences['in_app_messages'],
            'email_messages' => false,
        ];
    }

    /**
     * @return array{in_app_follows: bool, in_app_artwork_likes: bool, in_app_artwork_comments: bool, in_app_comment_replies: bool}
     */
    public function socialNotificationPreferences(): array
    {
        $preferences = $this->notificationPreferences();

        return [
            'in_app_follows' => $preferences['in_app_follows'],
            'in_app_artwork_likes' => $preferences['in_app_artwork_likes'],
            'in_app_artwork_comments' => $preferences['in_app_artwork_comments'],
            'in_app_comment_replies' => $preferences['in_app_comment_replies'],
        ];
    }

    public function isBuyer(): bool
    {
        return $this->role === self::ROLE_BUYER;
    }

    public function isAdmin(): bool
    {
        return $this->role === self::ROLE_ADMIN;
    }

    public function isArtist(): bool
    {
        return $this->role === self::ROLE_ARTIST;
    }

    public function artistProfile(): HasOne
    {
        return $this->hasOne(ArtistProfile::class);
    }
}
