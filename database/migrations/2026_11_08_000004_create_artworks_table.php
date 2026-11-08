<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('artworks', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('artist_profile_id')->constrained()->cascadeOnDelete();
            $table->foreignId('category_id')->constrained()->restrictOnDelete();
            $table->string('slug', 180)->unique();
            $table->string('title', 160);
            $table->text('description')->nullable();
            $table->string('medium', 120)->nullable();
            $table->string('dimensions', 120)->nullable();
            $table->unsignedSmallInteger('year')->nullable();
            $table->decimal('price', 14, 2)->nullable();
            $table->string('availability', 24)->default('available');
            $table->string('status', 24)->default('pending_review')->index();
            $table->text('rejection_note')->nullable();
            $table->string('image_path');
            $table->timestamps();

            $table->index(['category_id', 'status']);
            $table->index(['artist_profile_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('artworks');
    }
};
