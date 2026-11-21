<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ArtistContent extends Model
{
    public const SOURCE_NATIVE = 'native';

    public const PUBLICATION_DRAFT = 'draft';

    public const PUBLICATION_PUBLISHED = 'published';

    public const PUBLICATION_ARCHIVED = 'archived';

    protected $fillable = [
        'artist_profile_id',
        'source',
        'external_id',
        'content_type',
        'title',
        'description',
        'source_caption',
        'source_permalink',
        'source_media_type',
        'source_metadata',
        'media_path',
        'publication_status',
        'artist_approved_at',
        'source_imported_at',
        'source_synced_at',
    ];

    protected function casts(): array
    {
        return [
            'source_metadata' => 'array',
            'artist_approved_at' => 'datetime',
            'source_imported_at' => 'datetime',
            'source_synced_at' => 'datetime',
        ];
    }

    public function artistProfile(): BelongsTo
    {
        return $this->belongsTo(ArtistProfile::class);
    }

    public function artwork(): HasOne
    {
        return $this->hasOne(Artwork::class);
    }

    public function collections(): BelongsToMany
    {
        return $this->belongsToMany(ArtistCollection::class, 'artist_collection_items')
            ->withPivot(['artist_profile_id', 'position'])
            ->withTimestamps()
            ->orderByPivot('position');
    }
}
