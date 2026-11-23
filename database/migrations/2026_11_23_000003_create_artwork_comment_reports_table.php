<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('artwork_comment_reports', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('comment_id')->constrained('artwork_comments')->cascadeOnDelete();
            $table->foreignId('reporter_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('reason', 40);
            $table->string('details', 1000)->nullable();
            $table->string('status', 24)->default('open');
            $table->foreignId('reviewed_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();

            $table->unique(['comment_id', 'reporter_user_id'], 'artwork_comment_reports_comment_reporter_unique');
            $table->index(['status', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('artwork_comment_reports');
    }
};
