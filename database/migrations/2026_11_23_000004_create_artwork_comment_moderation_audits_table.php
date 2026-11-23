<?php

declare(strict_types=1);

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('artwork_comment_moderation_audits', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('report_id')->constrained('artwork_comment_reports')->cascadeOnDelete();
            $table->foreignId('admin_user_id')->constrained('users')->cascadeOnDelete();
            $table->string('action', 40);
            $table->string('note', 1000)->nullable();
            $table->timestamps();

            $table->index(['report_id', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('artwork_comment_moderation_audits');
    }
};
