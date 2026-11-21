<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class ArtistCollection extends Model
{
    public const VISIBILITY_PRIVATE = 'private';

    public const VISIBILITY_PUBLIC = 'public';

    protected $fillable = [
        'artist_profile_id',
        'title',
        'slug',
        'description',
        'visibility',
        'position',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'position' => 'integer',
            'published_at' => 'datetime',
        ];
    }

    public function artistProfile(): BelongsTo
    {
        return $this->belongsTo(ArtistProfile::class);
    }

    public function contents(): BelongsToMany
    {
        return $this->belongsToMany(ArtistContent::class, 'artist_collection_items')
            ->withPivot(['artist_profile_id', 'position'])
            ->withTimestamps()
            ->orderByPivot('position');
    }
}
