<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ArtworkComment extends Model
{
    use SoftDeletes;

    protected $fillable = ['artwork_id', 'user_id', 'parent_id', 'body'];

    public function artwork(): BelongsTo
    {
        return $this->belongsTo(Artwork::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(self::class, 'parent_id')
            ->where('artwork_id', $this->artwork_id);
    }

    public function replies(): HasMany
    {
        // Scope to the artwork in the consuming query. Referencing the current
        // model's artwork_id here breaks eager loading because Eloquent builds
        // the relation from an unhydrated model with a null artwork_id.
        return $this->hasMany(self::class, 'parent_id')->oldest();
    }
}
