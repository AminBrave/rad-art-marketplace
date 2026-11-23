<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('artist_follows', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('artist_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('follower_user_id')->constrained('users')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['artist_profile_id', 'follower_user_id'], 'artist_follows_profile_follower_unique');
            $table->index(['follower_user_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('artist_follows');
    }
};
