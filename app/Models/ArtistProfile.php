<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ArtistProfile extends Model
{
    protected $fillable = [
        'slug',
        'display_name',
        'bio',
        'city',
        'website_url',
        'instagram_handle',
        'is_public',
    ];

    protected function casts(): array
    {
        return [
            'is_public' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function artworks(): HasMany
    {
        return $this->hasMany(Artwork::class);
    }

    public function contents(): HasMany
    {
        return $this->hasMany(ArtistContent::class);
    }

    public function collections(): HasMany
    {
        return $this->hasMany(ArtistCollection::class);
    }

    public function instagramConnection(): HasOne
    {
        return $this->hasOne(InstagramConnection::class);
    }
}
