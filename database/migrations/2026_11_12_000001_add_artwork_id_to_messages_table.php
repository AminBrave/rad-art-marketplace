<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('messages', function (Blueprint $table): void {
            $table->foreignId('artwork_id')->nullable()->after('reply_to_id')->constrained()->nullOnDelete();
            $table->index(['conversation_id', 'artwork_id']);
        });
    }

    public function down(): void
    {
        Schema::table('messages', function (Blueprint $table): void {
            $table->dropIndex(['conversation_id', 'artwork_id']);
            $table->dropConstrainedForeignId('artwork_id');
        });
    }
};
