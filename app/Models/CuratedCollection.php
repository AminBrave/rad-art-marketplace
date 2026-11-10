<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CuratedCollection extends Model
{
    protected $fillable = ['slug', 'title', 'intro', 'status', 'position', 'published_at', 'created_by', 'updated_by'];

    protected function casts(): array
    {
        return ['published_at' => 'datetime'];
    }

    public function artworks(): BelongsToMany
    {
        return $this->belongsToMany(Artwork::class, 'curated_collection_items')
            ->withPivot('position')->withTimestamps()->orderByPivot('position');
    }

    public function items(): BelongsToMany
    {
        return $this->artworks();
    }

    public function isPublished(): bool
    {
        return $this->status === 'published' && $this->published_at !== null && $this->published_at->isPast();
    }
}
