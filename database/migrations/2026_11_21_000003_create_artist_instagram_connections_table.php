<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('artist_instagram_connections', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('artist_profile_id')->unique()->constrained()->cascadeOnDelete();
            $table->string('configuration_id', 128);
            $table->string('meta_user_id', 128);
            $table->text('access_token');
            $table->timestamp('token_expires_at')->nullable();
            $table->json('accounts');
            $table->json('media_snapshot');
            $table->timestamp('last_media_probe_at')->nullable();
            $table->string('status', 32)->default('connected')->index();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('artist_instagram_connections');
    }
};
