<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('artist_contents', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('artist_profile_id')->constrained()->cascadeOnDelete();
            $table->string('source', 32)->default('native');
            $table->string('external_id', 128)->nullable();
            $table->string('content_type', 32);
            $table->string('title', 160)->nullable();
            $table->text('description')->nullable();
            $table->text('source_caption')->nullable();
            $table->text('source_permalink')->nullable();
            $table->string('source_media_type', 40)->nullable();
            $table->json('source_metadata')->nullable();
            $table->string('media_path', 500)->nullable();
            $table->string('publication_status', 20)->default('draft')->index();
            $table->timestamp('artist_approved_at')->nullable();
            $table->timestamp('source_imported_at')->nullable();
            $table->timestamp('source_synced_at')->nullable();
            $table->timestamps();

            $table->unique(['artist_profile_id', 'source', 'external_id'], 'artist_contents_source_identity_unique');
            $table->unique(['id', 'artist_profile_id'], 'artist_contents_id_owner_unique');
            $table->index(['artist_profile_id', 'publication_status', 'created_at'], 'artist_contents_owner_status_created_index');
            $table->index(['source', 'external_id'], 'artist_contents_source_external_index');
        });

        Schema::create('artist_collections', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('artist_profile_id')->constrained()->cascadeOnDelete();
            $table->string('title', 160);
            $table->string('slug', 180);
            $table->text('description')->nullable();
            $table->string('visibility', 16)->default('private')->index();
            $table->unsignedInteger('position')->default(0);
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->unique(['artist_profile_id', 'slug'], 'artist_collections_owner_slug_unique');
            $table->unique(['id', 'artist_profile_id'], 'artist_collections_id_owner_unique');
            $table->index(['artist_profile_id', 'visibility', 'position'], 'artist_collections_owner_visibility_position_index');
        });

        Schema::create('artist_collection_items', function (Blueprint $table): void {
            $table->id();
            $table->unsignedBigInteger('artist_collection_id');
            $table->unsignedBigInteger('artist_content_id');
            $table->unsignedBigInteger('artist_profile_id');
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();

            $table->foreign(['artist_collection_id', 'artist_profile_id'], 'artist_collection_items_collection_owner_foreign')
                ->references(['id', 'artist_profile_id'])
                ->on('artist_collections')
                ->cascadeOnDelete();
            $table->foreign(['artist_content_id', 'artist_profile_id'], 'artist_collection_items_content_owner_foreign')
                ->references(['id', 'artist_profile_id'])
                ->on('artist_contents')
                ->cascadeOnDelete();

            $table->unique(['artist_collection_id', 'artist_content_id'], 'artist_collection_items_unique');
            $table->index(['artist_collection_id', 'position'], 'artist_collection_items_position_index');
            $table->index(['artist_profile_id', 'artist_content_id'], 'artist_collection_items_owner_content_index');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('artist_collection_items');
        Schema::dropIfExists('artist_collections');
        Schema::dropIfExists('artist_contents');
    }
};
