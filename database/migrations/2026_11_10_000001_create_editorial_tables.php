<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('curated_collections', function (Blueprint $table): void {
            $table->id();
            $table->string('slug', 180)->unique();
            $table->string('title', 160);
            $table->text('intro')->nullable();
            $table->string('status', 16)->default('draft')->index();
            $table->timestamp('published_at')->nullable()->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('curated_collection_items', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('curated_collection_id')->constrained()->cascadeOnDelete();
            $table->foreignId('artwork_id')->constrained()->restrictOnDelete();
            $table->unsignedInteger('position')->default(0);
            $table->timestamps();
            $table->unique(['curated_collection_id', 'artwork_id']);
            $table->index(['curated_collection_id', 'position']);
        });

        Schema::create('featured_artist_selections', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('artist_profile_id')->constrained()->cascadeOnDelete();
            $table->string('editorial_intro', 500)->nullable();
            $table->unsignedInteger('position')->default(0);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_published')->default(false)->index();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('updated_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
            $table->index(['is_published', 'position']);
            $table->index(['starts_at', 'ends_at']);
        });

        Schema::create('editorial_audits', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('actor_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action', 40);
            $table->string('subject_type', 80);
            $table->unsignedBigInteger('subject_id')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->index(['subject_type', 'subject_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('editorial_audits');
        Schema::dropIfExists('featured_artist_selections');
        Schema::dropIfExists('curated_collection_items');
        Schema::dropIfExists('curated_collections');
    }
};
