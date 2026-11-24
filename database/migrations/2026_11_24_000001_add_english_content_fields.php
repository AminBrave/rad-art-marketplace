<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('artist_profiles', function (Blueprint $table): void {
            $table->string('display_name_en', 120)->nullable();
            $table->text('bio_en')->nullable();
            $table->string('city_en', 120)->nullable();
        });

        Schema::table('artworks', function (Blueprint $table): void {
            $table->string('title_en', 160)->nullable();
            $table->text('description_en')->nullable();
            $table->string('city', 120)->nullable();
            $table->string('city_en', 120)->nullable();
        });

        Schema::table('categories', function (Blueprint $table): void {
            $table->string('name_en', 120)->nullable();
        });

        Schema::table('curated_collections', function (Blueprint $table): void {
            $table->string('title_en', 160)->nullable();
            $table->text('intro_en')->nullable();
        });

        Schema::table('featured_artist_selections', function (Blueprint $table): void {
            $table->string('editorial_intro_en', 500)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('featured_artist_selections', fn (Blueprint $table) => $table->dropColumn('editorial_intro_en'));
        Schema::table('curated_collections', fn (Blueprint $table) => $table->dropColumn(['title_en', 'intro_en']));
        Schema::table('categories', fn (Blueprint $table) => $table->dropColumn('name_en'));
        Schema::table('artworks', fn (Blueprint $table) => $table->dropColumn(['title_en', 'description_en', 'city', 'city_en']));
        Schema::table('artist_profiles', fn (Blueprint $table) => $table->dropColumn(['display_name_en', 'bio_en', 'city_en']));
    }
};
