<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Conversation extends Model
{
    protected $fillable = [
        'inquiry_id',
        'pair_key',
        'buyer_user_id',
        'artist_user_id',
        'last_message_at',
        'buyer_archived_at',
        'artist_archived_at',
        'buyer_muted_at',
        'artist_muted_at',
    ];

    protected function casts(): array
    {
        return [
            'last_message_at' => 'datetime',
            'buyer_archived_at' => 'datetime',
            'artist_archived_at' => 'datetime',
            'buyer_muted_at' => 'datetime',
            'artist_muted_at' => 'datetime',
        ];
    }

    public function inquiry(): BelongsTo
    {
        return $this->belongsTo(ArtistInquiry::class);
    }

    public function buyer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'buyer_user_id');
    }

    public function artist(): BelongsTo
    {
        return $this->belongsTo(User::class, 'artist_user_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function latestMessage(): HasOne
    {
        return $this->hasOne(Message::class)->withTrashed()->latestOfMany();
    }

    public function participantIdFor(User $user): ?int
    {
        if ((int) $this->buyer_user_id === (int) $user->id) {
            return (int) $this->buyer_user_id;
        }

        if ((int) $this->artist_user_id === (int) $user->id) {
            return (int) $this->artist_user_id;
        }

        return null;
    }

    public function archivedAtFor(User $user): mixed
    {
        return (int) $user->id === (int) $this->buyer_user_id
            ? $this->buyer_archived_at
            : $this->artist_archived_at;
    }
}
