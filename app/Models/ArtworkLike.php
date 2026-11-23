<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ArtworkLike extends Model
{
    protected $fillable = ['artwork_id', 'user_id'];

    public function artwork(): BelongsTo
    {
        return $this->belongsTo(Artwork::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
