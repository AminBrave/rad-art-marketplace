<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Artwork extends Model
{
    public const STATUS_PENDING_REVIEW = 'pending_review';

    public const STATUS_APPROVED = 'approved';

    public const STATUS_REJECTED = 'rejected';

    public const STATUS_CHANGES_REQUESTED = 'changes_requested';

    protected $fillable = [
        'category_id',
        'slug',
        'title',
        'title_en',
        'description',
        'description_en',
        'city',
        'city_en',
        'medium',
        'dimensions',
        'year',
        'price',
        'availability',
        'status',
        'rejection_note',
        'reviewed_by',
        'reviewed_at',
        'image_path',
    ];

    protected function casts(): array
    {
        return [
            'year' => 'integer',
            'price' => 'decimal:2',
            'reviewed_at' => 'datetime',
        ];
    }

    public function artistProfile(): BelongsTo
    {
        return $this->belongsTo(ArtistProfile::class);
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function likes(): HasMany
    {
        return $this->hasMany(ArtworkLike::class);
    }

    public function comments(): HasMany
    {
        return $this->hasMany(ArtworkComment::class);
    }
}
