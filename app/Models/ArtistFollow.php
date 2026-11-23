<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArtistFollow extends Model
{
    protected $fillable = ['artist_profile_id', 'follower_user_id'];

    public function artistProfile(): BelongsTo
    {
        return $this->belongsTo(ArtistProfile::class);
    }

    public function follower(): BelongsTo
    {
        return $this->belongsTo(User::class, 'follower_user_id');
    }
}
