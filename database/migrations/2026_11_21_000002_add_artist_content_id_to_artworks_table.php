<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('artworks', function (Blueprint $table): void {
            $table->unsignedBigInteger('artist_content_id')->nullable();
            $table->unique('artist_content_id', 'artworks_artist_content_id_unique');
            $table->index(['artist_content_id', 'artist_profile_id'], 'artworks_content_owner_index');
            $table->foreign(['artist_content_id', 'artist_profile_id'], 'artworks_content_owner_foreign')
                ->references(['id', 'artist_profile_id'])
                ->on('artist_contents')
                ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('artworks', function (Blueprint $table): void {
            $table->dropForeign('artworks_content_owner_foreign');
            $table->dropIndex('artworks_content_owner_index');
            $table->dropUnique('artworks_artist_content_id_unique');
            $table->dropColumn('artist_content_id');
        });
    }
};
