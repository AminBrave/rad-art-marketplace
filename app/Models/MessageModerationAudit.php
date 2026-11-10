<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MessageModerationAudit extends Model
{
    protected $fillable = ['report_id', 'admin_user_id', 'action', 'note'];

    public function report(): BelongsTo
    {
        return $this->belongsTo(MessageReport::class, 'report_id');
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'admin_user_id');
    }
}
